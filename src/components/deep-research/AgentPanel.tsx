import { Timeline } from './Timeline';
import type { ThoughtItem, Stage } from '@/types/deep-research';

interface AgentPanelProps {
  stage: Stage;
  thoughts: ThoughtItem[];
}

export function AgentPanel({ stage, thoughts }: AgentPanelProps) {
  const isActive = stage === 'GENERATING_PLAN' || stage === 'RESEARCHING';

  return (
    <div className="h-full flex flex-col border-l bg-surface-elevated">
      {/* Header */}
      <div className="px-4 py-4 border-b flex-shrink-0">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Agent 状态</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {stage === 'IDLE' && '等待输入...'}
          {stage === 'GENERATING_PLAN' && '正在生成计划...'}
          {stage === 'REVIEWING_PLAN' && '等待确认计划'}
          {stage === 'RESEARCHING' && '深度研究进行中...'}
        </p>
      </div>

      {/* Timeline */}
      <Timeline thoughts={thoughts} isActive={isActive} />
    </div>
  );
}
