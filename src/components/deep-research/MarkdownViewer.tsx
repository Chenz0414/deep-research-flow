import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
  isStreaming: boolean;
  hideTopBar?: boolean;
}

export function MarkdownViewer({ content, isStreaming, hideTopBar }: MarkdownViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col"
    >
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 scrollbar-thin"
      >
        <article className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-blink-cursor" />
          )}
        </article>
      </div>
    </motion.div>
  );
}
