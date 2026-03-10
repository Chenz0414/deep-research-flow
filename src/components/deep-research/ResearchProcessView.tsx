import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, Globe, ChevronUp, ChevronDown, FileText, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ResearchRound } from '@/types/deep-research';

interface ResearchProcessViewProps {
  rounds: ResearchRound[];
  isResearching: boolean;
  hideTopBar?: boolean;
}

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <motion.img
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.2 }}
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center text-title hover:bg-background transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function SearchRoundCard({ round, onImageClick }: { round: ResearchRound; onImageClick: (src: string, alt: string) => void }) {
  const [refsExpanded, setRefsExpanded] = useState(true);
  const refs = round.references || [];
  const images = round.images || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border/60 bg-card p-4 space-y-3 overflow-hidden"
    >
      {/* Search query header */}
      <div className="flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Search className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-title leading-snug break-words">{round.query}</p>
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

      {/* Images - wrap to next line, no horizontal scroll */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={img.alt || ''}
              className="w-24 h-20 object-cover rounded-lg border border-border/40 cursor-pointer hover:opacity-80 hover:shadow-md transition-all"
              onClick={() => onImageClick(img.url, img.alt || '')}
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
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const handleImageClick = useCallback((src: string, alt: string) => {
    setLightbox({ src, alt });
  }, []);

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
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 space-y-4 scrollbar-thin">
        {rounds.map((round) => {
          if (round.type === 'search') {
            return <SearchRoundCard key={round.id} round={round} onImageClick={handleImageClick} />;
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

      {/* Image lightbox */}
      <AnimatePresence>
        {lightbox && (
          <ImageLightbox
            src={lightbox.src}
            alt={lightbox.alt}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
