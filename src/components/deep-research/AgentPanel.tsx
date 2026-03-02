import { Timeline } from './Timeline';
import { Sparkles, Loader2 } from 'lucide-react';
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

  return (
    <div className="h-full flex flex-col border-l border-border/50" style={{ background: 'hsl(var(--surface-elevated))' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
            {isActive ? (
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" style={{ animationDuration: '2s' }} />
            ) : stage === 'COMPLETED' ? (
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground tracking-tight">Agent</h2>
            <p className={`text-[11px] ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              {status.text}
            </p>
          </div>
        </div>
        {isActive && (
          <div className="mt-3 h-1 bg-primary/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary/40 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        )}
      </div>

      {/* Timeline */}
      <Timeline thoughts={thoughts} isActive={isActive} />
    </div>
  );
}