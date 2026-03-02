import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, BookOpen, Brain, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface WelcomeViewProps {
  onSend: (message: string) => void;
}

const FEATURES = [
  { icon: Brain, title: '智能大纲生成', desc: 'AI 自动分析主题，生成结构化研究计划' },
  { icon: BookOpen, title: '深度调研执行', desc: '多维度搜索与分析，覆盖全面信息源' },
  { icon: FileText, title: 'Markdown 报告', desc: '自动生成专业格式的完整研究报告' },
];

export function WelcomeView({ onSend }: WelcomeViewProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full px-8"
    >
      <div className="w-full max-w-xl space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            开始您的深度研究
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            输入研究主题，AI 将为您生成调研计划并执行深度研究，输出完整报告。
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-center p-4 rounded-xl bg-muted/40 border border-border/50"
            >
              <f.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground mb-1">{f.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入您的研究主题，例如：人工智能在医疗领域的应用前景..."
            className="pr-14 min-h-[100px] max-h-[180px] resize-none text-sm bg-card border-border/60"
            rows={4}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="absolute bottom-3 right-3 h-9 w-9 rounded-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
