import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSSE } from '@/hooks/useSSE';
import { AppSidebar } from '@/components/deep-research/AppSidebar';
import { WelcomeView } from '@/components/deep-research/WelcomeView';
import { RightPanel } from '@/components/deep-research/RightPanel';
import { AgentPanel } from '@/components/deep-research/AgentPanel';
import type { Stage, ThoughtItem, MessageItem, ApiMessage } from '@/types/deep-research';
import type { ResearchSession } from '@/types/research-session';

function toApiMessages(messages: MessageItem[]): ApiMessage[] {
  return messages.filter(m => m.role === 'user').map(m => ({ text: m.content }));
}

function generateId(): string {
  return crypto.randomUUID();
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const CHAT_ID = 0;
const MODEL = 'GPT-4.1';

const Index = () => {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [stage, setStage] = useState<Stage>('IDLE');
  const [thoughts, setThoughts] = useState<ThoughtItem[]>([]);
  const [messageHistory, setMessageHistory] = useState<MessageItem[]>([]);
  const [planText, setPlanText] = useState('');
  const [reportMarkdown, setReportMarkdown] = useState('');
  const { toast } = useToast();

  const planAccRef = useRef('');
  const reportAccRef = useRef('');
  const stageRef = useRef<Stage>('IDLE');
  const activeIdRef = useRef<string | undefined>();

  const updateSession = useCallback((id: string, updates: Partial<ResearchSession>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const updateStageRef = useCallback((s: Stage) => {
    stageRef.current = s;
    setStage(s);
    if (activeIdRef.current) {
      updateSession(activeIdRef.current, { stage: s });
    }
  }, [updateSession]);

  const { send, abort } = useSSE({
    onThought: (thought) => {
      setThoughts(prev => {
        const next = [...prev, thought];
        if (activeIdRef.current) {
          updateSession(activeIdRef.current, { thoughts: next });
        }
        return next;
      });
    },
    onContent: (chunk) => {
      if (stageRef.current === 'GENERATING_PLAN') {
        planAccRef.current += chunk;
        const plan = planAccRef.current;
        setPlanText(plan);
        if (activeIdRef.current) updateSession(activeIdRef.current, { planText: plan });
      } else if (stageRef.current === 'RESEARCHING') {
        reportAccRef.current += chunk;
        const report = reportAccRef.current;
        setReportMarkdown(report);
        if (activeIdRef.current) updateSession(activeIdRef.current, { reportMarkdown: report });
      }
    },
    onComplete: () => {
      if (stageRef.current === 'GENERATING_PLAN') {
        updateStageRef('REVIEWING_PLAN');
      } else if (stageRef.current === 'RESEARCHING') {
        // Research is done!
        updateStageRef('COMPLETED');
        // Add a final "done" thought
        setThoughts(prev => {
          const next = [...prev, {
            id: `done-${Date.now()}`,
            type: 'writing' as const,
            content: '研究报告已生成完成',
            timestamp: Date.now(),
          }];
          if (activeIdRef.current) updateSession(activeIdRef.current, { thoughts: next });
          return next;
        });
      }
    },
    onError: (err) => {
      toast({ title: '请求失败', description: err, variant: 'destructive' });
      if (stageRef.current === 'GENERATING_PLAN') {
        updateStageRef('IDLE');
      }
    },
  });

  const handleSend = useCallback((message: string) => {
    if (stage !== 'IDLE') return;

    const id = generateId();
    const title = message.length > 30 ? message.slice(0, 30) + '...' : message;
    const newHistory: MessageItem[] = [{ role: 'user', content: message }];
    const newSession: ResearchSession = {
      id,
      title,
      createdAt: todayStr(),
      stage: 'GENERATING_PLAN',
      thoughts: [],
      messageHistory: newHistory,
      planText: '',
      reportMarkdown: '',
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(id);
    activeIdRef.current = id;
    setMessageHistory(newHistory);
    setThoughts([]);
    planAccRef.current = '';
    setPlanText('');
    updateStageRef('GENERATING_PLAN');

    send(toApiMessages(newHistory), {
      chat_id: CHAT_ID,
      model: MODEL,
      is_deep_search: false,
      is_edit_plan: false,
      deep_search_step: 3,
      language: 'zh-CN',
    });
  }, [stage, send, updateStageRef]);

  const handleEditPlan = useCallback((newPlan: string) => {
    const newHistory: MessageItem[] = [
      ...messageHistory,
      { role: 'assistant', content: planText },
      { role: 'user', content: newPlan },
    ];
    setMessageHistory(newHistory);
    setThoughts([]);
    planAccRef.current = '';
    setPlanText('');
    updateStageRef('GENERATING_PLAN');
    if (activeIdRef.current) {
      updateSession(activeIdRef.current, { messageHistory: newHistory, thoughts: [], planText: '' });
    }

    send(toApiMessages(newHistory), {
      chat_id: CHAT_ID,
      model: MODEL,
      is_deep_search: false,
      is_edit_plan: true,
      language: 'zh-CN',
    });
  }, [messageHistory, planText, send, updateStageRef, updateSession]);

  const handleStartResearch = useCallback(() => {
    const newHistory: MessageItem[] = [
      ...messageHistory,
      { role: 'assistant', content: planText },
    ];
    setMessageHistory(newHistory);
    setThoughts([]);
    reportAccRef.current = '';
    setReportMarkdown('');
    updateStageRef('RESEARCHING');
    if (activeIdRef.current) {
      updateSession(activeIdRef.current, { messageHistory: newHistory, thoughts: [], reportMarkdown: '' });
    }

    send(toApiMessages(newHistory), {
      chat_id: CHAT_ID,
      model: MODEL,
      is_deep_search: true,
      is_edit_plan: false,
      language: 'zh-CN',
    });
  }, [messageHistory, planText, send, updateStageRef, updateSession]);

  const handleNewResearch = useCallback(() => {
    // Don't abort - let background streams continue updating session state
    activeIdRef.current = undefined;
    setActiveSessionId(undefined);
    stageRef.current = 'IDLE';
    setStage('IDLE');
    setThoughts([]);
    setMessageHistory([]);
    setPlanText('');
    setReportMarkdown('');
    planAccRef.current = '';
    reportAccRef.current = '';
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    setSessions(prev => {
      const session = prev.find(s => s.id === id);
      if (!session) return prev;

      activeIdRef.current = id;
      setActiveSessionId(id);
      stageRef.current = session.stage;
      setStage(session.stage);
      setThoughts(session.thoughts);
      setMessageHistory(session.messageHistory);
      setPlanText(session.planText);
      setReportMarkdown(session.reportMarkdown);
      planAccRef.current = session.planText;
      reportAccRef.current = session.reportMarkdown;
      return prev;
    });
  }, []);

  const isActive = stage !== 'IDLE';

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      <div className="flex-shrink-0">
        <AppSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewResearch={handleNewResearch}
          onSelectSession={handleSelectSession}
        />
      </div>

      {isActive ? (
        <>
          <div className="flex-1 min-w-0">
            <RightPanel
              stage={stage}
              planText={planText}
              reportMarkdown={reportMarkdown}
              onEditPlan={handleEditPlan}
              onStartResearch={handleStartResearch}
            />
          </div>
          <div className="w-[280px] flex-shrink-0">
            <AgentPanel stage={stage} thoughts={thoughts} />
          </div>
        </>
      ) : (
        <div className="flex-1 min-w-0">
          <WelcomeView onSend={handleSend} />
        </div>
      )}
    </div>
  );
};

export default Index;
