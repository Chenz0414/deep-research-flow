import { useState } from 'react';
import { motion } from 'framer-motion';
import { Circle, Play, Send, Pencil, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { PlanSection } from '@/types/deep-research';

interface ResearchPlanCardProps {
  planText: string;
  sections: PlanSection[];
  statusText?: string;
  onEdit: (newRequirement: string) => void;
  onStart: () => void;
  isLoading?: boolean;
}

function parseSections(text: string): PlanSection[] {
  const lines = text.split('\n').filter(l => l.trim());
  const sections: PlanSection[] = [];
  let current: PlanSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(?:#{1,3}\s+|\d+[\.\)]\s*)(.*)/);
    if (match) {
      if (current) sections.push(current);
      current = { title: match[1].trim(), description: '' };
    } else if (current) {
      current.description += (current.description ? ' ' : '') + trimmed;
    } else {
      sections.push({ title: trimmed, description: '' });
    }
  }
  if (current) sections.push(current);
  return sections.length > 0 ? sections : [{ title: text.slice(0, 60), description: text }];
}

export function ResearchPlanCard({ planText, statusText, onEdit, onStart, isLoading }: ResearchPlanCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requirement, setRequirement] = useState('');
  const sections = parseSections(planText);

  const handleSubmitRequirement = () => {
    if (!requirement.trim()) return;
    onEdit(requirement.trim());
    setRequirement('');
    setDialogOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitRequirement();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl mx-auto px-4 sm:px-0"
      >
        <div className="rounded-lg bg-card border border-border/50 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 sm:px-6 py-5 border-b border-border/40 bg-muted">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">研究调研计划</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI 已为您生成以下研究大纲，请确认后开始深度研究。
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 sm:px-6 py-5">
            <motion.div className="space-y-2">
              {sections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-accent transition-colors cursor-default"
                >
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Circle className="w-2.5 h-2.5 text-primary/60" strokeWidth={3} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{section.title}</p>
                    {section.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {section.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 py-4 border-t border-border/40 bg-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-[11px] text-muted-foreground italic">
              {statusText || 'Organizing details...'}
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="ghost" size="sm" onClick={() => { setRequirement(''); setDialogOpen(true); }} className="text-xs flex-1 sm:flex-none hover:bg-accent">
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                修改计划
              </Button>
              <Button size="sm" onClick={onStart} disabled={isLoading} className="gradient-primary border-0 text-white hover:opacity-90 transition-opacity flex-1 sm:flex-none">
                <Play className="w-3.5 h-3.5 mr-1.5" />
                开始研究
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="text-foreground">修改研究计划</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              输入您的新需求，AI 将根据您的要求重新生成研究计划。
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述您的新需求..."
              className="flex min-h-[120px] w-full rounded-lg border border-border/60 bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors resize-none"
              autoFocus
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitRequirement}
                disabled={!requirement.trim()}
                className="gradient-primary border-0 text-white hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4 mr-1.5" />
                提交修改
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
