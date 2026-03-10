import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, Globe, ChevronUp, ChevronDown, FileText, Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ResearchRound } from '@/types/deep-research';

interface ResearchProcessViewProps {
  rounds: ResearchRound[];
  isResearching: boolean;
  hideTopBar?: boolean;
}

function SearchRoundCard({ round }: { round: ResearchRound }) {
  const [refsExpanded, setRefsExpanded] = useState(true);
  const refs = round.references || [];
  const images = round.images || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
    >
      {/* Search query header */}
      <div className="flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Search className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-title leading-snug">{round.query}</p>
        </div>
      </div>

      {/* References */}
      {refs.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setRefsExpanded(!refsExpanded)}
            className="flex items-center gap-2 text-xs text-subtitle hover:text-body transition-colors cursor-pointer"
          >
            <span>参考网站</span>
            <span className="text-primary/70 font-medium">{refs.length}</span>
            {refsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <AnimatePresence>
            {refsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {refs.map((ref, i) => (
                    <a
                      key={i}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/60 transition-colors text-xs text-body max-w-[180px] truncate"
                      title={ref.title}
                    >
                      {ref.favicon ? (
                        <img src={ref.favicon} className="w-3.5 h-3.5 rounded-sm flex-shrink-0" alt="" />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-subtitle flex-shrink-0" />
                      )}
                      <span className="truncate">{ref.title}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Images */}
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={img.alt || ''}
              className="w-24 h-20 object-cover rounded-lg border border-border/40 flex-shrink-0"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function TextRoundCard({ round }: { round: ResearchRound }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border/60 bg-card p-4"
    >
      <article className="prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {round.content || ''}
        </ReactMarkdown>
        {round.isStreaming && (
          <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-blink-cursor" />
        )}
      </article>
    </motion.div>
  );
}

function SummaryCard({ round }: { round: ResearchRound }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-primary/20 bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-title">研究总结</h3>
      </div>
      <article className="prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {round.content || ''}
        </ReactMarkdown>
        {round.isStreaming && (
          <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-blink-cursor" />
        )}
      </article>
    </motion.div>
  );
}

export function ResearchProcessView({ rounds, isResearching, hideTopBar }: ResearchProcessViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [rounds]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col"
    >

      {/* Scrolling rounds */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 scrollbar-thin">
        {rounds.map((round) => {
          if (round.type === 'search') {
            return <SearchRoundCard key={round.id} round={round} />;
          }
          if (round.type === 'summary') {
            return <SummaryCard key={round.id} round={round} />;
          }
          return <TextRoundCard key={round.id} round={round} />;
        })}

        {/* Loading indicator when researching but no rounds yet */}
        {isResearching && rounds.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-subtitle">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Search className="w-5 h-5 text-primary" />
              </motion.div>
              <span className="text-sm">正在启动深度研究...</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
