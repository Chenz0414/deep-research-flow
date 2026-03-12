import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronUp, Clock, Loader2 } from 'lucide-react';
import type { ResearchProgress } from '@/types/research-session';

interface PlanSection {
  title: string;
}

interface ResearchStatusCardProps {
  isCompleted: boolean;
  isWritingReport: boolean;
  planText: string;
  progress: ResearchProgress;
  onToggleRightPanel: () => void;
  rightPanelVisible: boolean;
  startTime?: number;
  endTime?: number;
}

function extractSections(planText: string): PlanSection[] {
  const lines = planText.split('\n');
  const sections: PlanSection[] = [];
  for (const line of lines) {
    const match = line.match(/^###\s+\d+\.\s*(.+)/);
    if (match) {
      sections.push({ title: match[1].trim() });
    }
  }
  return sections;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0
    ? `${min}:${sec.toString().padStart(2, '0')}`
    : `${sec}s`;
}

function useElapsedTime(startTime?: number, endTime?: number) {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!startTime) return;

    if (endTime) {
      setElapsed(endTime - startTime);
      return;
    }

    const tick = () => {
      setElapsed(Date.now() - startTime);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startTime, endTime]);

  return elapsed;
}

export function ResearchStatusCard({
  isCompleted,
  isWritingReport,
  planText,
  progress,
  onToggleRightPanel,
  rightPanelVisible,
  startTime,
  endTime,
}: ResearchStatusCardProps) {
  const [expanded, setExpanded] = useState(true);
  const sections = extractSections(planText);
  const elapsed = useElapsedTime(startTime, endTime);
  const isRunning = !isCompleted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 sm:mx-6 mt-4 rounded-xl border border-border/40 overflow-hidden"
      style={{
        background: isRunning
          ? 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--primary) / 0.03) 100%)'
          : 'hsl(var(--muted) / 0.4)',
      }}
    >
      {/* Animated top border for active state */}
      {isRunning && (
        <div className="h-[2px] w-full overflow-hidden">
          <motion.div
            className="h-full w-full"
            style={{
              background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--primary) / 0.3), transparent)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          {isRunning ? (
            <div className="relative flex items-center justify-center w-5 h-5">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
          ) : (
            <CheckCircle2 className="w-5 h-5 text-theme-accent" />
          )}

          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-title">
              {isCompleted ? '研究完成' : isWritingReport ? '正在撰写报告' : '研究中'}
            </h3>
            {!isCompleted && !isWritingReport && progress.totalSections > 0 && (
              <span className="text-[11px] text-subtitle">
                进度 {progress.completedSections}/{progress.totalSections}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          {startTime && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono tabular-nums ${
              isCompleted
                ? 'bg-theme-accent/8 text-theme-accent'
                : 'bg-card-alt text-subtitle'
            }`}>
              <Clock className="w-3 h-3" />
              <span>{isCompleted ? `用时 ${formatElapsed(elapsed)}` : formatElapsed(elapsed)}</span>
            </div>
          )}

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

      {/* Progress bar */}
      {isRunning && progress.totalSections > 0 && (
        <div className="px-4 pb-2">
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))' }}
              initial={{ width: '0%' }}
              animate={{ width: `${(progress.completedSections / progress.totalSections) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Sections list */}
      <AnimatePresence>
        {expanded && sections.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2">
              {sections.map((section, i) => {
                const completed = isCompleted || i < progress.completedSections;
                const isCurrent = !isCompleted && i === progress.completedSections;
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    {completed ? (
                      <CheckCircle2 className="w-4 h-4 text-theme-accent flex-shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-primary flex-shrink-0 animate-spin" />
                    ) : (
                      <Circle className="w-4 h-4 text-subtitle/40 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${completed ? 'text-body' : isCurrent ? 'text-title font-medium' : 'text-subtitle'}`}>
                      {section.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
