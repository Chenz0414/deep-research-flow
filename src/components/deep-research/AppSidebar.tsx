import { useState } from 'react';
import { Plus, Search, FileText, Clock, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ResearchSession } from '@/types/research-session';

interface AppSidebarProps {
  sessions: ResearchSession[];
  activeSessionId?: string;
  onNewResearch: () => void;
  onSelectSession: (id: string) => void;
}

const STAGE_CONFIG: Record<string, { label: string; color: string; pulse?: boolean }> = {
  IDLE: { label: '待开始', color: 'text-muted-foreground' },
  GENERATING_PLAN: { label: '生成计划中', color: 'text-primary', pulse: true },
  REVIEWING_PLAN: { label: '待确认', color: 'text-amber-500' },
  RESEARCHING: { label: '研究中', color: 'text-primary', pulse: true },
  COMPLETED: { label: '已完成', color: 'text-emerald-500' },
};

export function AppSidebar({ sessions, activeSessionId, onNewResearch, onSelectSession }: AppSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col border-r border-border/50 w-[260px]" style={{ background: 'hsl(var(--sidebar-background))' }}>
      {/* Brand */}
      <div className="p-5 flex-shrink-0 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-base font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            DeepFlow
          </h1>
        </div>
        <Button onClick={onNewResearch} className="w-full justify-center gap-2 shadow-sm" size="sm">
          <Plus className="w-4 h-4" />
          新建研究
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索历史记录..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-background/60 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
          />
        </div>
      </div>

      {/* Label */}
      <div className="px-5 pb-2 flex-shrink-0">
        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">
          历史记录
        </p>
      </div>

      {/* Sessions list */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-4">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 px-3 py-8 text-center">暂无记录</p>
          ) : (
            filtered.map((session) => {
              const cfg = STAGE_CONFIG[session.stage] || STAGE_CONFIG.IDLE;
              const isActive = activeSessionId === session.id;
              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary/8 border border-primary/15 shadow-sm'
                      : 'hover:bg-accent/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {session.stage === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                    ) : cfg.pulse ? (
                      <Loader2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary animate-spin" style={{ animationDuration: '2s' }} />
                    ) : (
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground/60 group-hover:text-foreground/60 transition-colors" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`truncate font-medium ${isActive ? 'text-foreground' : 'text-foreground/80'}`}>{session.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
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