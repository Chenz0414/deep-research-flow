import { useState } from 'react';
import { Timeline } from './Timeline';
import { Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ThoughtItem, Stage } from '@/types/deep-research';

interface AgentPanelProps {
  stage: Stage;
  thoughts: ThoughtItem[];
}

const STATUS_MAP: Record<Stage, { text: string; active: boolean }> = {
  IDLE: { text: '等待输入...', active: false },
  GENERATING_PLAN: { text: '正在生成计划...', active: true },
  REVIEWING_PLAN: { text: '等待确认计划', active: false },
  RESEARCHING: { text: '深度研究进行中...', active: true },
  COMPLETED: { text: '研究已完成', active: false },
};

export function AgentPanel({ stage, thoughts }: AgentPanelProps) {
  const isActive = stage === 'GENERATING_PLAN' || stage === 'RESEARCHING';
  const status = STATUS_MAP[stage] || STATUS_MAP.IDLE;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile: bottom sheet style */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border/50 max-h-[40vh] flex flex-col">
        <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2.5">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isActive ? 'bg-primary/10' : 'bg-card-alt'}`}>
            {isActive ? (
              <Loader2 className="w-3 h-3 text-primary animate-spin" style={{ animationDuration: '2s' }} />
            ) : (
              <Sparkles className="w-3 h-3 text-subtitle" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-title">Agent</p>
            <p className={`text-[10px] ${isActive ? 'text-primary' : 'text-subtitle'}`}>{status.text}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Timeline thoughts={thoughts} isActive={isActive} />
        </div>
      </div>

      {/* Desktop */}
      <div className={`hidden sm:flex h-full flex-col border-l border-border/50 bg-card transition-all duration-200 ${collapsed ? 'w-10' : 'w-full'}`}>
        {collapsed ? (
          <button onClick={() => setCollapsed(false)} className="h-full flex items-center justify-center hover:bg-hover-bg transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-subtitle" />
          </button>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-border/50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-primary/10' : 'bg-card-alt'}`}>
                    {isActive ? (
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" style={{ animationDuration: '2s' }} />
                    ) : stage === 'COMPLETED' ? (
                      <Sparkles className="w-3.5 h-3.5 text-theme-accent" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-subtitle" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-title tracking-tight">Agent</h2>
                    <p className={`text-[11px] ${isActive ? 'text-primary' : 'text-subtitle'}`}>
                      {status.text}
                    </p>
                  </div>
                </div>
                <button onClick={() => setCollapsed(true)} className="p-1 rounded-md hover:bg-hover-bg transition-colors cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-subtitle" />
                </button>
              </div>
              {isActive && (
                <div className="mt-3 h-1 bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full animate-pulse gradient-primary" style={{ width: '60%' }} />
                </div>
              )}
            </div>
            <Timeline thoughts={thoughts} isActive={isActive} />
          </>
        )}
      </div>
    </>
  );
}
