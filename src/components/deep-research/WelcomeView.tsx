import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

export function WelcomeView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full px-8"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
        DeepFlowChat
      </h1>
      <p className="text-muted-foreground text-center max-w-md text-base leading-relaxed">
        输入您的研究主题，AI 将为您生成调研计划并执行深度研究，最终输出完整的 Markdown 报告。
      </p>
      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground/60">
        <Search className="w-4 h-4" />
        <span>在左侧输入您的问题开始</span>
      </div>
    </motion.div>
  );
}
