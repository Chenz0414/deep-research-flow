import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Timeline } from './Timeline';
import type { ThoughtItem, Stage } from '@/types/deep-research';

interface LeftSidebarProps {
  stage: Stage;
  thoughts: ThoughtItem[];
  onSend: (message: string) => void;
}

export function LeftSidebar({ stage, thoughts, onSend }: LeftSidebarProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = stage === 'IDLE' || stage === 'REVIEWING_PLAN';

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || !canSend) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (canSend) textareaRef.current?.focus();
  }, [canSend]);

  const isActive = stage === 'GENERATING_PLAN' || stage === 'RESEARCHING';

  return (
    <div className="h-full flex flex-col border-r bg-surface-elevated">
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

      {/* Input */}
      <div className="p-3 border-t flex-shrink-0 bg-card">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={canSend ? '输入您的研究主题...' : '请等待当前任务完成...'}
            disabled={!canSend}
            className="pr-12 min-h-[72px] max-h-[140px] resize-none text-sm bg-muted/30"
            rows={3}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!canSend || !input.trim()}
            className="absolute bottom-2 right-2 h-8 w-8 rounded-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
