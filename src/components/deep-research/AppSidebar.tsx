import { useState } from 'react';
import { Plus, Search, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ResearchSession } from '@/types/research-session';

interface AppSidebarProps {
  sessions: ResearchSession[];
  activeSessionId?: string;
  onNewResearch: () => void;
  onSelectSession: (id: string) => void;
}

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  IDLE: { label: '待开始', color: 'text-muted-foreground' },
  GENERATING_PLAN: { label: '生成计划中', color: 'text-primary' },
  REVIEWING_PLAN: { label: '待确认', color: 'text-amber-500' },
  RESEARCHING: { label: '研究中', color: 'text-primary' },
  COMPLETED: { label: '已完成', color: 'text-emerald-500' },
};

export function AppSidebar({ sessions, activeSessionId, onNewResearch, onSelectSession }: AppSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-surface-elevated border-r w-[240px]">
      <div className="p-4 flex-shrink-0 space-y-3">
        <h1 className="text-base font-bold text-foreground tracking-tight">DeepFlow</h1>
        <Button onClick={onNewResearch} className="w-full justify-start gap-2" size="sm">
          <Plus className="w-4 h-4" />
          新建研究
        </Button>
      </div>

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
            filtered.map((session) => {
              const cfg = STAGE_CONFIG[session.stage] || STAGE_CONFIG.IDLE;
              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors group hover:bg-accent ${
                    activeSessionId === session.id ? 'bg-accent text-accent-foreground' : 'text-foreground/80'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {session.stage === 'COMPLETED' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-500" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{session.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {session.createdAt}
                        </span>
                        <span className={`text-[10px] font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
