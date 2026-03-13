import { motion } from 'framer-motion';
import { Brain, Search, FileText } from 'lucide-react';

export function ResearchLoadingView() {
  const steps = [
    { icon: Search, label: '正在检索相关资料', delay: 0 },
    { icon: Brain, label: '分析与整合信息', delay: 0.6 },
    { icon: FileText, label: '准备生成研究报告', delay: 1.2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full gap-10 relative px-4"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, hsl(var(--gradient-from)), hsl(var(--gradient-to)) 60%, transparent 80%)' }} />
      </div>

      <div className="relative w-28 h-28">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)' }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.08, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-3 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.12), transparent 70%)' }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <motion.div
          className="absolute inset-6 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center shadow-sm"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          >
            <Brain className="w-8 h-8 text-primary" />
          </motion.div>
        </motion.div>
      </div>

      <div className="text-center space-y-2 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-semibold text-foreground"
        >
          正在启动深度研究
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted-foreground"
        >
          AI 正在多维度搜索与分析，请稍候...
        </motion.p>
      </div>

      <div className="space-y-4 w-full max-w-xs relative z-10">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + step.delay, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <motion.div
              className="w-9 h-9 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center flex-shrink-0"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: step.delay }}
            >
              <step.icon className="w-4 h-4 text-primary" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{step.label}</p>
              <motion.div className="h-1 bg-primary/10 rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full gradient-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, delay: 1 + step.delay, ease: 'easeInOut' }}
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
