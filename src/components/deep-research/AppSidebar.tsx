import { useState } from 'react';
import { Plus, Search, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Stage } from '@/types/deep-research';

interface HistoryItem {
  id: string;
  title: string;
  date: string;
}

const MOCK_HISTORY: HistoryItem[] = [
  { id: '1', title: '人工智能在医疗领域的应用', date: '2025-03-01' },
  { id: '2', title: '新能源汽车市场分析', date: '2025-02-28' },
  { id: '3', title: '量子计算技术发展趋势', date: '2025-02-25' },
  { id: '4', title: '全球气候变化影响研究', date: '2025-02-20' },
];

interface AppSidebarProps {
  stage: Stage;
  onNewResearch: () => void;
  activeId?: string;
}

export function AppSidebar({ stage, onNewResearch, activeId }: AppSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_HISTORY.filter(h =>
    h.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-surface-elevated border-r w-[240px]">
      {/* Header + New button */}
      <div className="p-4 flex-shrink-0 space-y-3">
        <h1 className="text-base font-bold text-foreground tracking-tight">DeepFlow</h1>
        <Button
          onClick={onNewResearch}
          className="w-full justify-start gap-2"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          新建研究
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索历史记录..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* History list */}
      <div className="px-3 pb-2 flex-shrink-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-1">
          历史记录
        </p>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 pb-4">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-4 text-center">暂无记录</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors group hover:bg-accent ${
                  activeId === item.id ? 'bg-accent text-accent-foreground' : 'text-foreground/80'
                }`}
              >
                <div className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {item.date}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
