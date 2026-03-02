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

  const updateStageRef = (s: Stage) => {
    stageRef.current = s;
    setStage(s);
    // Sync stage back to session
    if (activeIdRef.current) {
      setSessions(prev => prev.map(sess =>
        sess.id === activeIdRef.current ? { ...sess, stage: s } : sess
      ));
    }
  };

  // Save current state into the active session
  const syncSession = useCallback((overrides?: Partial<ResearchSession>) => {
    if (!activeIdRef.current) return;
    setSessions(prev => prev.map(sess =>
      sess.id === activeIdRef.current
        ? {
            ...sess,
            stage: stageRef.current,
            thoughts: overrides?.thoughts ?? sess.thoughts,
            messageHistory: overrides?.messageHistory ?? sess.messageHistory,
            planText: overrides?.planText ?? sess.planText,
            reportMarkdown: overrides?.reportMarkdown ?? sess.reportMarkdown,
          }
        : sess
    ));
  }, []);

  const { send } = useSSE({
    onThought: (thought) => {
      setThoughts(prev => {
        const next = [...prev, thought];
        // sync to session
        if (activeIdRef.current) {
          setSessions(s => s.map(sess =>
            sess.id === activeIdRef.current ? { ...sess, thoughts: next } : sess
          ));
        }
        return next;
      });
    },
    onContent: (chunk) => {
      if (stageRef.current === 'GENERATING_PLAN') {
        planAccRef.current += chunk;
        setPlanText(planAccRef.current);
        if (activeIdRef.current) {
          const plan = planAccRef.current;
          setSessions(s => s.map(sess =>
            sess.id === activeIdRef.current ? { ...sess, planText: plan } : sess
          ));
        }
      } else if (stageRef.current === 'RESEARCHING') {
        reportAccRef.current += chunk;
        setReportMarkdown(reportAccRef.current);
        if (activeIdRef.current) {
          const report = reportAccRef.current;
          setSessions(s => s.map(sess =>
            sess.id === activeIdRef.current ? { ...sess, reportMarkdown: report } : sess
          ));
        }
      }
    },
    onComplete: () => {
      if (stageRef.current === 'GENERATING_PLAN') {
        updateStageRef('REVIEWING_PLAN');
      }
    },
    onError: (err) => {
      toast({ title: '请求失败', description: err, variant: 'destructive' });
      if (stageRef.current === 'GENERATING_PLAN') {
        updateStageRef('IDLE');
      }
    },
  });

  // User sends initial query from WelcomeView
  const handleSend = useCallback((message: string) => {
    if (stage !== 'IDLE') return;

    // Create a new session
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
  }, [stage, send]);

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
    syncSession({ messageHistory: newHistory, thoughts: [] });

    send(toApiMessages(newHistory), {
      chat_id: CHAT_ID,
      model: MODEL,
      is_deep_search: false,
      is_edit_plan: true,
      language: 'zh-CN',
    });
  }, [messageHistory, planText, send, syncSession]);

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
    syncSession({ messageHistory: newHistory, thoughts: [], reportMarkdown: '' });

    send(toApiMessages(newHistory), {
      chat_id: CHAT_ID,
      model: MODEL,
      is_deep_search: true,
      is_edit_plan: false,
      language: 'zh-CN',
    });
  }, [messageHistory, planText, send, syncSession]);

  const handleNewResearch = useCallback(() => {
    activeIdRef.current = undefined;
    setActiveSessionId(undefined);
    updateStageRef('IDLE');
    setThoughts([]);
    setMessageHistory([]);
    setPlanText('');
    setReportMarkdown('');
    planAccRef.current = '';
    reportAccRef.current = '';
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

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
  }, [sessions]);

  const isActive = stage !== 'IDLE';

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Left sidebar - always visible */}
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
          {/* Middle - main content area */}
          <div className="flex-1 min-w-0">
            <RightPanel
              stage={stage}
              planText={planText}
              reportMarkdown={reportMarkdown}
              onEditPlan={handleEditPlan}
              onStartResearch={handleStartResearch}
            />
          </div>
          {/* Right - agent status */}
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
