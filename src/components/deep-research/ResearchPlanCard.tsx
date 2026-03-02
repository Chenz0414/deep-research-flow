import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, CheckCircle2, Pencil, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { PlanSection } from '@/types/deep-research';

interface ResearchPlanCardProps {
  planText: string;
  sections: PlanSection[];
  statusText?: string;
  onEdit: (newPlan: string) => void;
  onStart: () => void;
  isLoading?: boolean;
}

function parseSections(text: string): PlanSection[] {
  const lines = text.split('\n').filter(l => l.trim());
  const sections: PlanSection[] = [];
  let current: PlanSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    // Match numbered items or markdown headers
    const match = trimmed.match(/^(?:#{1,3}\s+|\d+[\.\)]\s*)(.*)/);
    if (match) {
      if (current) sections.push(current);
      current = { title: match[1].trim(), description: '' };
    } else if (current) {
      current.description += (current.description ? ' ' : '') + trimmed;
    } else {
      // Standalone line before any heading
      sections.push({ title: trimmed, description: '' });
    }
  }
  if (current) sections.push(current);
  return sections.length > 0 ? sections : [{ title: text.slice(0, 60), description: text }];
}

export function ResearchPlanCard({ planText, statusText, onEdit, onStart, isLoading }: ResearchPlanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(planText);
  const sections = parseSections(planText);

  const handleSaveEdit = () => {
    onEdit(editText);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground">研究调研计划</h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI 已为您生成以下研究大纲，请确认后开始深度研究。
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[240px] text-sm leading-relaxed resize-none font-mono bg-muted/30"
                  placeholder="编辑您的研究计划..."
                />
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {sections.map((section, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 py-2"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <Circle className="w-4 h-4 text-primary/50" strokeWidth={2} />
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
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground/70 italic">
            {statusText || 'Organizing details...'}
          </p>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  取消
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveEdit}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  提交修改
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => { setEditText(planText); setIsEditing(true); }}>
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  修改计划
                </Button>
                <Button size="sm" onClick={onStart} disabled={isLoading}>
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  开始研究
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
