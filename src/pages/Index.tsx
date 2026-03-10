import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { startStream } from '@/hooks/useSSE';
import { AppSidebar } from '@/components/deep-research/AppSidebar';
import { WelcomeView } from '@/components/deep-research/WelcomeView';
import { RightPanel } from '@/components/deep-research/RightPanel';
import { ResearchProcessView } from '@/components/deep-research/ResearchProcessView';
import { Button } from '@/components/ui/button';
import { FileText, Download, Menu } from 'lucide-react';
import type { Stage, ThoughtItem, MessageItem, ApiMessage, ResearchRound } from '@/types/deep-research';
import type { ResearchSession, ResearchProgress } from '@/types/research-session';

function toApiMessages(messages: MessageItem[]): ApiMessage[] {
  return messages.filter(m => m.role === 'user').map(m => ({ text: m.content }));
}

const CHAT_ID = 0;
const MODEL = 'GPT-4.1';

const Index = () => {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { toast } = useToast();

  const abortsRef = useRef<Map<string, () => void>>(new Map());
  const planAccs = useRef<Map<string, string>>(new Map());
  const reportAccs = useRef<Map<string, string>>(new Map());

  const updateSession = useCallback((id: string, updater: (s: ResearchSession) => ResearchSession) => {
    setSessions(prev => prev.map(s => s.id === id ? updater(s) : s));
  }, []);

  const getActiveSession = useCallback((): ResearchSession | undefined => {
    let found: ResearchSession | undefined;
    setSessions(prev => {
      found = prev.find(s => s.id === activeSessionId);
      return prev;
    });
    return found;
  }, [activeSessionId]);

  const startSessionStream = useCallback((
    sessionId: string,
    messages: ApiMessage[],
    params: Parameters<typeof startStream>[1],
    streamPhase: 'plan' | 'research',
  ) => {
    abortsRef.current.get(sessionId)?.();

    const abort = startStream(messages, params, {
      onThought: (thought) => {
        updateSession(sessionId, s => ({
          ...s,
          thoughts: [...s.thoughts, thought],
        }));
      },
      onContent: (chunk) => {
        if (streamPhase === 'plan') {
          const acc = (planAccs.current.get(sessionId) || '') + chunk;
          planAccs.current.set(sessionId, acc);
          updateSession(sessionId, s => ({ ...s, planText: acc }));
        } else {
          const acc = (reportAccs.current.get(sessionId) || '') + chunk;
          reportAccs.current.set(sessionId, acc);
          updateSession(sessionId, s => ({ ...s, reportMarkdown: acc }));
        }
      },
      onResearchRound: (round: ResearchRound) => {
        updateSession(sessionId, s => ({
          ...s,
          researchRounds: [...s.researchRounds, round],
        }));
      },
      onUpdateRound: (roundId: string, updater: (r: ResearchRound) => ResearchRound) => {
        updateSession(sessionId, s => ({
          ...s,
          researchRounds: s.researchRounds.map(r => r.id === roundId ? updater(r) : r),
        }));
      },
      onProgressUpdate: (progress: ResearchProgress) => {
        updateSession(sessionId, s => ({ ...s, researchProgress: progress }));
      },
      onResearchDone: () => {
        updateSession(sessionId, s => ({ ...s, isWritingReport: true }));
      },
      onComplete: () => {
        abortsRef.current.delete(sessionId);
        if (streamPhase === 'plan') {
          updateSession(sessionId, s => ({ ...s, stage: 'REVIEWING_PLAN' }));
        } else {
          updateSession(sessionId, s => ({
            ...s,
            stage: 'COMPLETED',
            researchEndTime: Date.now(),
            thoughts: [...s.thoughts, {
              id: `done-${Date.now()}`,
              type: 'writing' as const,
              content: '研究报告已生成完成',
              timestamp: Date.now(),
            }],
          }));
        }
      },
      onError: (err) => {
        abortsRef.current.delete(sessionId);
        toast({ title: '请求失败', description: err, variant: 'destructive' });
        if (streamPhase === 'plan') {
          updateSession(sessionId, s => ({ ...s, stage: 'IDLE' }));
        }
      },
    });

    abortsRef.current.set(sessionId, abort);
  }, [updateSession, toast]);

  const handleSend = useCallback((message: string, deepSearchStep: number = 2) => {
    const id = crypto.randomUUID();
    const title = message.length > 30 ? message.slice(0, 30) + '...' : message;
    const newHistory: MessageItem[] = [{ role: 'user', content: message }];

    const newSession: ResearchSession = {
      id,
      title,
      createdAt: new Date().toISOString().slice(0, 10),
      stage: 'GENERATING_PLAN',
      thoughts: [],
      messageHistory: newHistory,
      planText: '',
      reportMarkdown: '',
      researchRounds: [],
      researchProgress: { totalSections: 0, completedSections: 0 },
      isWritingReport: false,
      deepSearchStep,
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(id);
    planAccs.current.set(id, '');

    startSessionStream(id, toApiMessages(newHistory), {
      chat_id: CHAT_ID,
      model: MODEL,
      is_deep_search: false,
      is_edit_plan: false,
      deep_search_step: deepSearchStep,
      language: 'zh-CN',
    }, 'plan');
  }, [startSessionStream]);

  const handleEditPlanWithText = useCallback((newPlan: string) => {
    if (!activeSessionId) return;

    setSessions(prev => {
      const session = prev.find(s => s.id === activeSessionId);
      if (!session) return prev;

      const newHistory: MessageItem[] = [
        ...session.messageHistory,
        { role: 'assistant', content: session.planText },
        { role: 'user', content: newPlan },
      ];

      planAccs.current.set(activeSessionId, '');

      setTimeout(() => {
        startSessionStream(activeSessionId, toApiMessages(newHistory), {
          chat_id: CHAT_ID,
          model: MODEL,
          is_deep_search: false,
          is_edit_plan: true,
          language: 'zh-CN',
        }, 'plan');
      }, 0);

      return prev.map(s => s.id === activeSessionId ? {
        ...s,
        stage: 'GENERATING_PLAN' as const,
        messageHistory: newHistory,
        thoughts: [],
        planText: '',
      } : s);
    });
  }, [activeSessionId, startSessionStream]);

  const handleStartResearch = useCallback(() => {
    if (!activeSessionId) return;

    // Force right panel visible when research begins
    setShowRightPanel(true);

    setSessions(prev => {
      const session = prev.find(s => s.id === activeSessionId);
      if (!session) return prev;

      const newHistory: MessageItem[] = [
        ...session.messageHistory,
        { role: 'assistant', content: session.planText },
      ];

      reportAccs.current.set(activeSessionId, '');

      const step = session.deepSearchStep ?? 2;
      setTimeout(() => {
        startSessionStream(activeSessionId, toApiMessages(newHistory), {
          chat_id: CHAT_ID,
          model: MODEL,
          is_deep_search: true,
          is_edit_plan: false,
          deep_search_step: step,
          language: 'zh-CN',
        }, 'research');
      }, 0);

      return prev.map(s => s.id === activeSessionId ? {
        ...s,
        stage: 'RESEARCHING' as const,
        messageHistory: newHistory,
        thoughts: [],
        reportMarkdown: '',
        researchRounds: [],
        researchProgress: { totalSections: 0, completedSections: 0 },
        isWritingReport: false,
        researchStartTime: Date.now(),
        researchEndTime: undefined,
      } : s);
    });
  }, [activeSessionId, startSessionStream]);

  const handleNewResearch = useCallback(() => {
    setActiveSessionId(undefined);
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const stage: Stage = activeSession?.stage ?? 'IDLE';
  const isActive = stage !== 'IDLE' && !!activeSession;

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

      {isActive && activeSession ? (
        <div className="flex-1 min-w-0 flex flex-col h-full">
          {/* Unified top bar for RESEARCHING / COMPLETED */}
          {(activeSession.stage === 'RESEARCHING' || activeSession.stage === 'COMPLETED') && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-border/50 flex-shrink-0 bg-card-alt">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-xs font-medium text-title">研究报告</span>
                </div>
                {activeSession.stage === 'RESEARCHING' && (
                  <span className="tag-pill text-[10px]">生成中...</span>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="shadow-sm hover:bg-hover-bg h-7 text-xs">
                <Download className="w-3 h-3 mr-1" />
                导出 PDF
              </Button>
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 min-w-0 flex overflow-hidden">
            <div className="flex-1 min-w-0">
              <RightPanel
                stage={activeSession.stage}
                planText={activeSession.planText}
                reportMarkdown={activeSession.reportMarkdown}
                onEditPlan={handleEditPlanWithText}
                onStartResearch={handleStartResearch}
                onToggleRightPanel={() => setShowRightPanel(prev => !prev)}
                rightPanelVisible={showRightPanel}
                researchProgress={activeSession.researchProgress}
                isWritingReport={activeSession.isWritingReport}
                researchStartTime={activeSession.researchStartTime}
                researchEndTime={activeSession.researchEndTime}
              />
            </div>
            {(activeSession.stage === 'RESEARCHING' || activeSession.stage === 'COMPLETED') && showRightPanel && (
              <div className="hidden sm:block w-[480px] flex-shrink-0 border-l border-border/50">
                <ResearchProcessView
                  rounds={activeSession.researchRounds}
                  isResearching={activeSession.stage === 'RESEARCHING'}
                  hideTopBar
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-w-0">
          <WelcomeView onSend={handleSend} />
        </div>
      )}
    </div>
  );
};

export default Index;
