import { motion } from 'framer-motion';

export function SkeletonView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full gap-6 relative px-4"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, hsl(var(--gradient-from)), hsl(var(--gradient-to)) 60%, transparent 80%)' }} />
      </div>

      {/* Animated spinner */}
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{ borderTopColor: 'hsl(var(--primary))' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-sm font-medium text-title">正在生成研究计划</p>
        <p className="text-xs text-subtitle">AI 正在分析您的研究主题...</p>
      </div>

      <div className="w-full max-w-sm space-y-3 px-4 sm:px-8 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="space-y-2"
          >
            <div className="h-4 bg-card-alt rounded-md animate-pulse" style={{ width: `${85 - i * 8}%`, animationDelay: `${i * 150}ms` }} />
            <div className="h-3 bg-card-alt/60 rounded-md animate-pulse" style={{ width: `${60 - i * 5}%`, animationDelay: `${i * 150 + 75}ms` }} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
