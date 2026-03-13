import { motion } from 'framer-motion';
import { Search, Brain, FileText, Loader2, CheckCircle2, Lightbulb } from 'lucide-react';
import type { ThoughtItem } from '@/types/deep-research';

const iconMap: Record<ThoughtItem['type'], React.ElementType> = {
  thinking: Brain,
  searching: Search,
  search_result: FileText,
  planning: Lightbulb,
  writing: FileText,
};

const labelMap: Record<ThoughtItem['type'], string> = {
  thinking: '思考中',
  searching: '搜索中',
  search_result: '搜索结果',
  planning: '规划中',
  writing: '撰写中',
};

interface TimelineProps {
  thoughts: ThoughtItem[];
  isActive: boolean;
}

export function Timeline({ thoughts, isActive }: TimelineProps) {
  if (thoughts.length === 0 && !isActive) return null;

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border/60" />

        <div className="space-y-1">
          {thoughts.map((thought, i) => {
            const Icon = iconMap[thought.type] || Brain;
            const isLast = i === thoughts.length - 1;
            const isSearching = thought.type === 'searching' && isLast && isActive;

            return (
              <motion.div
                key={thought.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="relative flex items-start gap-3 pl-0"
              >
                {/* Dot */}
                <div className="relative z-10 flex-shrink-0 mt-0.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isSearching
                      ? 'bg-primary/15 text-primary ring-2 ring-primary/10'
                      : isLast && isActive
                        ? 'bg-primary/15 text-primary ring-2 ring-primary/10'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isSearching ? (
                      <Loader2 className="w-3 h-3 animate-spin" style={{ animationDuration: '2s' }} />
                    ) : isLast && isActive ? (
                      <Icon className="w-3 h-3 animate-pulse-dot" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                    {labelMap[thought.type]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {thought.content}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
