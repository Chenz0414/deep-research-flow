import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarkdownViewerProps {
  content: string;
  isStreaming: boolean;
  hideTopBar?: boolean;
}

export function MarkdownViewer({ content, isStreaming }: MarkdownViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/50 flex-shrink-0 bg-card-alt">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary/60" />
          <h2 className="text-sm font-medium text-title">研究报告</h2>
          {isStreaming && (
            <span className="tag-pill text-[10px]">
              生成中...
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleExportPDF} className="shadow-sm hover:bg-hover-bg">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          <span className="hidden sm:inline">导出 PDF</span>
        </Button>
      </div>

      {/* Markdown content */}
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
