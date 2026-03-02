import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function SkeletonView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full gap-4"
    >
      <Loader2 className="w-8 h-8 text-primary animate-spin-slow" />
      <p className="text-sm text-muted-foreground">正在生成研究计划...</p>
      <div className="w-full max-w-md space-y-3 px-8 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2 animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted/60 rounded w-1/2" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
