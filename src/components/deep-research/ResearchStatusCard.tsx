import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckCircle2, Circle, ChevronUp } from 'lucide-react';

interface PlanSection {
  title: string;
  completed: boolean;
}

interface ResearchStatusCardProps {
  isCompleted: boolean;
  planText: string;
  onToggleRightPanel: () => void;
  rightPanelVisible: boolean;
}

function extractSections(planText: string): PlanSection[] {
  const lines = planText.split('\n');
  const sections: PlanSection[] = [];
  for (const line of lines) {
    const match = line.match(/^###\s+\d+\.\s*(.+)/);
    if (match) {
      sections.push({ title: match[1].trim(), completed: false });
    }
  }
  return sections;
}

export function ResearchStatusCard({
  isCompleted,
  planText,
  onToggleRightPanel,
  rightPanelVisible,
}: ResearchStatusCardProps) {
  const [expanded, setExpanded] = useState(true);
  const sections = extractSections(planText);

  // Mark all as completed when research is done
  const displaySections = sections.map((s, i) => ({
    ...s,
    completed: isCompleted ? true : false,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 sm:mx-6 mt-4 rounded-xl bg-muted/40 border border-border/40"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-title">
            {isCompleted ? '研究完成' : '研究中'}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleRightPanel}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            {rightPanelVisible ? '关闭' : '打开'}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="cursor-pointer text-subtitle hover:text-body transition-colors"
          >
            <ChevronUp className={`w-4 h-4 transition-transform ${expanded ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>

      {/* Sections list */}
      <AnimatePresence>
        {expanded && displaySections.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2">
              {displaySections.map((section, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {section.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-subtitle/40 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${section.completed ? 'text-body' : 'text-subtitle'}`}>
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
