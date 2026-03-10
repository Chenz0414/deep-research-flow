import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, BookOpen, Brain, FileText, Zap, Globe, Shield, ChevronDown, Star, MessageSquare, ArrowRight, TrendingUp, Cpu, Microscope, GraduationCap, Newspaper, Share2, BarChart3, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface WelcomeViewProps {
  onSend: (message: string, deepSearchStep: number) => void;
}

const SEARCH_MODES = [
  { label: '快速', step: 1, cost: 10, icon: Zap },
  { label: '标准', step: 2, cost: 15, icon: TrendingUp },
  { label: '深度', step: 3, cost: 20, icon: Microscope },
] as const;

const WRITING_STYLES = [
  { id: 'academic', label: '学术', icon: GraduationCap, desc: '正式、客观、逻辑严谨，使用精准术语，适用于论文、报告与学术研究。' },
  { id: 'popular', label: '科普', icon: BookOpen, desc: '通俗易懂、生动自然，适合向大众解释复杂概念。' },
  { id: 'news', label: '新闻', icon: Newspaper, desc: '事实导向、简洁客观，强调信息准确与中立表达。' },
  { id: 'social', label: '社交媒体', icon: Share2, desc: '简短有力、吸引注意力，适合分享与传播。' },
  { id: 'strategy', label: '战略投资', icon: BarChart3, desc: '深度分析、数据驱动，聚焦市场趋势与投资价值判断。' },
] as const;

const QUICK_TOPICS = [
  { text: '2025年AI Agent行业全景分析', icon: Cpu },
  { text: '新能源汽车市场竞争格局研究', icon: TrendingUp },
  { text: '大语言模型商业化落地路径', icon: Brain },
  { text: 'Web3与去中心化金融发展趋势', icon: Globe },
];

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
  { name: '张明', role: '产品经理', avatar: '张', content: '之前做竞品分析需要整整一天，现在用深度研究几分钟就能得到一份详尽的调研报告，真的太高效了。', rating: 5 },
  { name: '李薇', role: '市场研究员', avatar: '李', content: '信息覆盖面非常广，自动整合多来源数据，让我的市场洞察报告质量提升了一个档次。', rating: 5 },
  { name: '王浩', role: '创业者', avatar: '王', content: '作为创业者需要快速了解不同行业，深度研究帮我在短时间内完成了深度行业调研，推荐给所有创业伙伴。', rating: 5 },
];

const FAQS = [
  { q: '深度研究是如何工作的？', a: '深度研究使用先进的 AI 模型分析您的研究主题，自动生成调研大纲，然后通过多维度搜索和智能分析，最终输出结构化的研究报告。' },
  { q: '生成一份研究报告需要多长时间？', a: '通常在 3-8 分钟内完成，具体时间取决于研究主题的复杂度。相比传统调研方式，效率提升可达 10 倍以上。' },
  { q: '我可以同时进行多个研究吗？', a: '可以。深度研究支持多任务并发，您可以同时发起多个研究任务，它们会在后台独立运行，互不干扰。' },
  { q: '研究报告支持哪些导出格式？', a: '目前支持在线阅读和 PDF 导出。报告采用标准 Markdown 格式，便于在各类文档工具中二次编辑。' },
];

export function WelcomeView({ onSend }: WelcomeViewProps) {
  const [input, setInput] = useState('');
  const [selectedStep, setSelectedStep] = useState(2);
  const [selectedStyle, setSelectedStyle] = useState('academic');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed, selectedStep);
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
      <section className="flex flex-col items-center justify-center min-h-[85vh] px-4 sm:px-8 relative">
        {/* Background gradient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, hsl(var(--gradient-from)), hsl(var(--gradient-to)) 60%, transparent 80%)' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl space-y-10 relative z-10"
        >
          {/* Hero */}
          <div className="text-center space-y-5">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gradient-primary leading-tight">
                深度研究
              </h1>
              <p className="text-base sm:text-lg text-subtitle leading-relaxed max-w-lg mx-auto">
                AI 驱动的深度研究助手，自动生成调研计划并执行多维分析，输出专业研究报告
              </p>
            </div>
          </div>

          {/* Writing Style Selector - Horizontal Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <div className="relative flex items-center gap-1.5 bg-card-alt rounded-xl p-1 border border-border/50"
              onMouseLeave={() => setHoveredStyle(null)}
            >
              {WRITING_STYLES.map((style) => {
                const StyleIcon = style.icon;
                const isSelected = selectedStyle === style.id;
                const activeTooltipId = hoveredStyle || selectedStyle;
                const showTooltip = style.id === activeTooltipId;
                return (
                  <div key={style.id} className="relative flex-1">
                    <button
                      onClick={() => setSelectedStyle(style.id)}
                      onMouseEnter={() => setHoveredStyle(style.id)}
                      className={`w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-menu-selected text-primary shadow-sm'
                          : 'text-body2 hover:text-title hover:bg-hover-bg'
                      }`}
                    >
                      <StyleIcon className="w-3.5 h-3.5" />
                      <span className="whitespace-nowrap">{style.label}</span>
                    </button>
                    {/* Tooltip - left aligned to tab */}
                    {showTooltip && (
                      <div className="absolute left-0 bottom-full mb-2 px-3 py-1.5 rounded-lg bg-popover border border-border/60 shadow-lg text-[11px] text-subtitle leading-relaxed whitespace-nowrap z-50 pointer-events-none">
                        {style.desc}
                        <div className="absolute left-4 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-border/60" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Input area */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute -inset-px rounded-xl gradient-primary opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 blur-sm" />
            <div className="relative bg-card rounded-xl border border-border/60 overflow-hidden glow-sm">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您的研究主题，例如：人工智能在医疗领域的应用前景..."
                className="pr-14 min-h-[100px] max-h-[180px] resize-none text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-subtitle"
                rows={3}
              />
              {/* Bottom bar */}
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-0.5 bg-card-alt rounded-lg p-0.5">
                  {SEARCH_MODES.map((mode) => {
                    const ModeIcon = mode.icon;
                    const isSelected = selectedStep === mode.step;
                    return (
                      <button
                        key={mode.step}
                        onClick={() => setSelectedStep(mode.step)}
                        className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-menu-selected text-primary shadow-sm'
                            : 'text-body2 hover:text-title hover:bg-hover-bg'
                        }`}
                      >
                        <ModeIcon className="w-3 h-3" />
                        <span>{mode.label}</span>
                        <span className={`text-[9px] ${isSelected ? 'text-primary/60' : 'text-subtitle'}`}>
                          {mode.cost}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  className="h-8 w-8 rounded-lg gradient-primary border-0 text-white hover:opacity-90 transition-opacity"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick topics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {QUICK_TOPICS.map((topic, i) => {
              const TopicIcon = topic.icon;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.06 }}
                  onClick={() => onSend(topic.text, selectedStep)}
                  className="group/topic flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card hover:bg-hover-bg hover:border-primary/20 transition-all duration-200 text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover/topic:bg-primary/12 transition-colors">
                    <TopicIcon className="w-3.5 h-3.5 text-primary/60 group-hover/topic:text-primary transition-colors" />
                  </div>
                  <span className="text-xs text-body2 group-hover/topic:text-title transition-colors flex-1 line-clamp-1">
                    {topic.text}
                  </span>
                  <ArrowRight className="w-3 h-3 text-subtitle group-hover/topic:text-primary/60 group-hover/topic:translate-x-0.5 transition-all flex-shrink-0" />
                </motion.button>
              );
            })}
          </motion.div>

          {/* Features - compact row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2"
          >
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-subtitle">
                <f.icon className="w-3.5 h-3.5 text-primary/50" />
                <span className="text-[11px] font-medium">{f.title}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8"
        >
          <ChevronDown className="w-5 h-5 text-subtitle animate-bounce" />
        </motion.div>
      </section>

      {/* Capabilities Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-14"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-title mb-3">为什么选择深度研究</h2>
            <p className="text-sm text-subtitle max-w-md mx-auto">
              强大的 AI 能力赋予您专业研究员级别的调研效率
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-6 rounded-xl bg-card border border-border/50 surface-interactive"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-4">
                  <cap.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-title mb-2">{cap.title}</h3>
                <p className="text-xs text-subtitle leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-14"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-title mb-3">用户评价</h2>
            <p className="text-sm text-subtitle max-w-md mx-auto">
              来自各行业用户的真实反馈
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="p-6 rounded-xl bg-card border border-border/50"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-theme-accent text-theme-accent" />
                  ))}
                </div>
                <p className="text-sm text-body2 leading-relaxed mb-5">
                  <MessageSquare className="w-4 h-4 text-primary/30 inline mr-1 -mt-0.5" />
                  {t.content}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-semibold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-title">{t.name}</p>
                    <p className="text-[11px] text-subtitle">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 border-t border-border/40">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-14"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-title mb-3">常见问题</h2>
            <p className="text-sm text-subtitle max-w-md mx-auto">
              关于深度研究您可能想了解的
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
                  className="w-full text-left p-5 rounded-xl bg-card border border-border/50 surface-interactive"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-title pr-4">{faq.q}</h3>
                    <ChevronDown className={`w-4 h-4 text-subtitle flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </div>
                  {openFaq === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-sm text-body2 leading-relaxed mt-3 pt-3 border-t border-border/40"
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
      <footer className="py-10 px-4 sm:px-8 border-t border-border/40 text-center">
        <p className="text-xs text-subtitle">
          © 2024 深度研究. AI 驱动的深度研究助手。
        </p>
      </footer>
    </div>
  );
}
