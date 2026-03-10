import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Stage } from '@/types/deep-research';
import { SkeletonView } from './SkeletonView';
import { ResearchPlanCard } from './ResearchPlanCard';
import { ResearchLoadingView } from './ResearchLoadingView';
import { ResearchStatusCard } from './ResearchStatusCard';

interface RightPanelProps {
  stage: Stage;
  planText: string;
  reportMarkdown: string;
  onEditPlan: (newPlan: string) => void;
  onStartResearch: () => void;
  isLoading?: boolean;
  onToggleRightPanel?: () => void;
  rightPanelVisible?: boolean;
}

export function RightPanel({
  stage, planText, reportMarkdown,
  onEditPlan, onStartResearch, isLoading,
  onToggleRightPanel, rightPanelVisible,
}: RightPanelProps) {
  const isResearching = stage === 'RESEARCHING';
  const isCompleted = stage === 'COMPLETED';
  const isResearchPhase = isResearching || isCompleted;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isResearching && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [reportMarkdown, isResearching]);

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
        {isResearchPhase && (
          <div key="research" className="h-full flex flex-col overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
              {/* Pinned plan at top */}
              <div className="px-4 sm:px-6 pt-4 pb-2">
                <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
                  <article className="prose prose-sm max-w-none text-body2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {planText}
                    </ReactMarkdown>
                  </article>
                </div>
              </div>

              {/* Status card */}
              <ResearchStatusCard
                isCompleted={isCompleted}
                planText={planText}
                onToggleRightPanel={onToggleRightPanel || (() => {})}
                rightPanelVisible={rightPanelVisible ?? true}
              />

              {/* Report content */}
              {reportMarkdown.length > 0 ? (
                <div className="px-4 sm:px-8 py-6">
                  <article className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reportMarkdown}
                    </ReactMarkdown>
                    {isResearching && (
                      <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-blink-cursor" />
                    )}
                  </article>
                </div>
              ) : isResearching ? (
                <ResearchLoadingView />
              ) : null}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
