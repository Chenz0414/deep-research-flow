import { AnimatePresence } from 'framer-motion';
import type { Stage, ResearchRound } from '@/types/deep-research';
import { SkeletonView } from './SkeletonView';
import { ResearchPlanCard } from './ResearchPlanCard';
import { ResearchLoadingView } from './ResearchLoadingView';
import { ResearchProcessView } from './ResearchProcessView';
import { MarkdownViewer } from './MarkdownViewer';

interface RightPanelProps {
  stage: Stage;
  planText: string;
  reportMarkdown: string;
  researchRounds: ResearchRound[];
  onEditPlan: (newPlan: string) => void;
  onStartResearch: () => void;
  isLoading?: boolean;
}

export function RightPanel({ stage, planText, reportMarkdown, researchRounds, onEditPlan, onStartResearch, isLoading }: RightPanelProps) {
  const isResearching = stage === 'RESEARCHING';
  const isCompleted = stage === 'COMPLETED';
  const hasRounds = researchRounds.length > 0;
  const showResearchProcess = (isResearching || isCompleted) && hasRounds;
  const showResearchLoading = isResearching && !hasRounds;

  return (
    <div className="h-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        {stage === 'GENERATING_PLAN' && <SkeletonView key="skeleton" />}
        {stage === 'REVIEWING_PLAN' && (
          <div key="plan" className="h-full flex items-center justify-center overflow-y-auto scrollbar-thin p-6">
            <ResearchPlanCard
              planText={planText}
              sections={[]}
              onEdit={onEditPlan}
              onStart={onStartResearch}
              isLoading={isLoading}
            />
          </div>
        )}
        {showResearchLoading && (
          <ResearchLoadingView key="research-loading" />
        )}
        {showResearchProcess && (
          <ResearchProcessView
            key="research-process"
            rounds={researchRounds}
            isResearching={isResearching}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
