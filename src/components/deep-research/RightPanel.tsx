import { AnimatePresence } from 'framer-motion';
import type { Stage } from '@/types/deep-research';
import { SkeletonView } from './SkeletonView';
import { ResearchPlanCard } from './ResearchPlanCard';
import { ResearchLoadingView } from './ResearchLoadingView';
import { MarkdownViewer } from './MarkdownViewer';

interface RightPanelProps {
  stage: Stage;
  planText: string;
  reportMarkdown: string;
  onEditPlan: (newPlan: string) => void;
  onStartResearch: () => void;
  isLoading?: boolean;
}

export function RightPanel({ stage, planText, reportMarkdown, onEditPlan, onStartResearch, isLoading }: RightPanelProps) {
  const isResearching = stage === 'RESEARCHING';
  const isCompleted = stage === 'COMPLETED';
  const showReport = (isResearching || isCompleted) && reportMarkdown.length > 0;
  const showResearchLoading = isResearching && !reportMarkdown;

  return (
    <div className="h-full overflow-hidden">
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
        {showReport && (
          <MarkdownViewer
            key="report"
            content={reportMarkdown}
            isStreaming={isResearching}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
