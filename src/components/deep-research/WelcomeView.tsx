import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, BookOpen, Brain, FileText, Zap, Globe, Shield, ChevronDown, Star, MessageSquare } from 'lucide-react';
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

const CAPABILITIES = [
  { icon: Zap, title: '极速研究', desc: '数分钟内完成传统数小时的调研工作，大幅提升效率' },
  { icon: Globe, title: '全网信息覆盖', desc: '自动搜索并整合多来源信息，确保调研的全面性与准确性' },
  { icon: Shield, title: '结构化输出', desc: '标准化的 Markdown 报告格式，支持导出 PDF 便于分享与归档' },
  { icon: Brain, title: '自适应计划', desc: '根据您的反馈实时调整研究方向，灵活应对各类研究需求' },
];

const TESTIMONIALS = [
  { name: '张明', role: '产品经理', avatar: '张', content: '之前做竞品分析需要整整一天，现在用 DeepFlow 几分钟就能得到一份详尽的调研报告，真的太高效了。', rating: 5 },
  { name: '李薇', role: '市场研究员', avatar: '李', content: '信息覆盖面非常广，自动整合多来源数据，让我的市场洞察报告质量提升了一个档次。', rating: 5 },
  { name: '王浩', role: '创业者', avatar: '王', content: '作为创业者需要快速了解不同行业，DeepFlow 帮我在短时间内完成了深度行业调研，推荐给所有创业伙伴。', rating: 5 },
];

const FAQS = [
  { q: 'DeepFlow 是如何工作的？', a: 'DeepFlow 使用先进的 AI 模型分析您的研究主题，自动生成调研大纲，然后通过多维度搜索和智能分析，最终输出结构化的研究报告。' },
  { q: '生成一份研究报告需要多长时间？', a: '通常在 3-8 分钟内完成，具体时间取决于研究主题的复杂度。相比传统调研方式，效率提升可达 10 倍以上。' },
  { q: '我可以同时进行多个研究吗？', a: '可以。DeepFlow 支持多任务并发，您可以同时发起多个研究任务，它们会在后台独立运行，互不干扰。' },
  { q: '研究报告支持哪些导出格式？', a: '目前支持在线阅读和 PDF 导出。报告采用标准 Markdown 格式，便于在各类文档工具中二次编辑。' },
];

export function WelcomeView({ onSend }: WelcomeViewProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    <div className="h-full overflow-y-auto scrollbar-thin">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[85vh] px-8 relative">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.07]"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent 70%)' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl space-y-10 relative z-10"
        >
          {/* Hero */}
          <div className="text-center space-y-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto glow-sm"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-gradient-primary leading-tight">
                DeepFlow
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
                AI 驱动的深度研究助手，自动生成调研计划并执行多维分析，输出专业研究报告
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="text-center p-5 rounded-xl glass-panel surface-interactive cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-3">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{f.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute -inset-px rounded-xl bg-primary/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
            <div className="relative glass-panel rounded-xl overflow-hidden glow-sm">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您的研究主题，例如：人工智能在医疗领域的应用前景..."
                className="pr-14 min-h-[110px] max-h-[180px] resize-none text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={4}
              />
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="absolute bottom-3 right-3 h-9 w-9 rounded-lg shadow-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground animate-bounce" />
        </motion.div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl font-bold text-foreground mb-3">为什么选择 DeepFlow</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              强大的 AI 能力赋予您专业研究员级别的调研效率
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-5">
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-6 rounded-xl glass-panel surface-interactive"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-4">
                  <cap.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-8 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl font-bold text-foreground mb-3">用户评价</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              来自各行业用户的真实反馈
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="p-6 rounded-xl glass-panel"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-5">
                  <MessageSquare className="w-4 h-4 text-primary/30 inline mr-1 -mt-0.5" />
                  {t.content}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-8 border-t border-border/40">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl font-bold text-foreground mb-3">常见问题</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              关于 DeepFlow 您可能想了解的
            </p>
          </motion.div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-5 rounded-xl glass-panel surface-interactive"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground pr-4">{faq.q}</h3>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </div>
                  {openFaq === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-sm text-muted-foreground leading-relaxed mt-3 pt-3 border-t border-border/40"
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 border-t border-border/40 text-center">
        <p className="text-xs text-muted-foreground">
          © 2024 DeepFlow. AI 驱动的深度研究助手。
        </p>
      </footer>
    </div>
  );
}