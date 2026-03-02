import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSSE } from '@/hooks/useSSE';
import { AppSidebar } from '@/components/deep-research/AppSidebar';
import { WelcomeView } from '@/components/deep-research/WelcomeView';
import { RightPanel } from '@/components/deep-research/RightPanel';
import { AgentPanel } from '@/components/deep-research/AgentPanel';
import type { Stage, ThoughtItem, MessageItem, ApiMessage } from '@/types/deep-research';

function toApiMessages(messages: MessageItem[]): ApiMessage[] {
  return messages
    .filter(m => m.role === 'user')
    .map(m => ({ text: m.content }));
}

const CHAT_ID = 0;
const MODEL = 'GPT-4.1';

const Index = () => {
  const [stage, setStage] = useState<Stage>('IDLE');
  const [thoughts, setThoughts] = useState<ThoughtItem[]>([]);
  const [messageHistory, setMessageHistory] = useState<MessageItem[]>([]);
  const [planText, setPlanText] = useState('');
  const [reportMarkdown, setReportMarkdown] = useState('');
  const { toast } = useToast();

  const planAccRef = useRef('');
  const reportAccRef = useRef('');
  const stageRef = useRef<Stage>('IDLE');

  const updateStageRef = (s: Stage) => {
    stageRef.current = s;
    setStage(s);
  };

  const { send } = useSSE({
    onThought: (thought) => {
      setThoughts((prev) => [...prev, thought]);
    },
    onContent: (chunk) => {
      if (stageRef.current === 'GENERATING_PLAN') {
        planAccRef.current += chunk;
        setPlanText(planAccRef.current);
      } else if (stageRef.current === 'RESEARCHING') {
        reportAccRef.current += chunk;
        setReportMarkdown(reportAccRef.current);
      }
    },
    onComplete: () => {
      if (stageRef.current === 'GENERATING_PLAN') {
        updateStageRef('REVIEWING_PLAN');
      }
    },
    onError: (err) => {
      toast({
        title: '请求失败',
        description: err,
        variant: 'destructive',
      });
      if (stageRef.current === 'GENERATING_PLAN') {
        updateStageRef('IDLE');
      }
    },
  });

  const handleSend = useCallback((message: string) => {
    if (stage === 'IDLE') {
      const newHistory: MessageItem[] = [
        ...messageHistory,
        { role: 'user', content: message },
      ];
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
    }
  }, [stage, messageHistory, send]);

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

    send(toApiMessages(newHistory), {
      chat_id: CHAT_ID,
      model: MODEL,
      is_deep_search: false,
      is_edit_plan: true,
      language: 'zh-CN',
    });
  }, [messageHistory, planText, send]);

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

    send(toApiMessages(newHistory), {
      chat_id: CHAT_ID,
      model: MODEL,
      is_deep_search: true,
      is_edit_plan: false,
      language: 'zh-CN',
    });
  }, [messageHistory, planText, send]);

  const handleNewResearch = useCallback(() => {
    updateStageRef('IDLE');
    setThoughts([]);
    setMessageHistory([]);
    setPlanText('');
    setReportMarkdown('');
    planAccRef.current = '';
    reportAccRef.current = '';
  }, []);

  const isActive = stage !== 'IDLE';

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Left sidebar - always visible */}
      <div className="flex-shrink-0">
        <AppSidebar
          stage={stage}
          onNewResearch={handleNewResearch}
        />
      </div>

      {isActive ? (
        <>
          {/* Middle - main content area (large) */}
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
        /* IDLE: welcome + input fills the rest */
        <div className="flex-1 min-w-0">
          <WelcomeView onSend={handleSend} />
        </div>
      )}
    </div>
  );
};

export default Index;
