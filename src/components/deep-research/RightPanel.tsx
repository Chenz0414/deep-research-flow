import { AnimatePresence } from 'framer-motion';
import type { Stage } from '@/types/deep-research';
import { WelcomeView } from './WelcomeView';
import { SkeletonView } from './SkeletonView';
import { ResearchPlanCard } from './ResearchPlanCard';
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
  return (
    <div className="h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === 'IDLE' && <WelcomeView key="welcome" />}
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
        {stage === 'RESEARCHING' && (
          <MarkdownViewer
            key="report"
            content={reportMarkdown}
            isStreaming={true}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
