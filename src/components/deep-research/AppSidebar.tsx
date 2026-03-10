import { useState } from 'react';
import { Plus, Search, FileText, Clock, CheckCircle2, Sparkles, Loader2, Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
  IDLE: { label: '待开始', color: 'text-subtitle' },
  GENERATING_PLAN: { label: '生成计划中', color: 'text-primary', pulse: true },
  REVIEWING_PLAN: { label: '待确认', color: 'text-amber-500' },
  RESEARCHING: { label: '研究中', color: 'text-primary', pulse: true },
  COMPLETED: { label: '已完成', color: 'text-theme-accent' },
};

export function AppSidebar({ sessions, activeSessionId, onNewResearch, onSelectSession }: AppSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarContent = (
    <div className="h-full flex flex-col bg-card border-r border-border/50 w-full sm:w-[260px]">
      {/* Brand + collapse button */}
      <div className="p-5 flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base font-bold text-title tracking-tight">
              深度研究
            </h1>
          </div>
          <div className="flex items-center gap-1">
            {/* Desktop collapse */}
            <button
              onClick={() => setCollapsed(true)}
              className="hidden sm:flex p-1.5 rounded-md hover:bg-hover-bg transition-colors cursor-pointer"
              title="收起侧边栏"
            >
              <PanelLeftClose className="w-4 h-4 text-subtitle" />
            </button>
            {/* Mobile close */}
            <button onClick={() => setMobileOpen(false)} className="sm:hidden p-1 rounded-md hover:bg-hover-bg transition-colors cursor-pointer">
              <X className="w-5 h-5 text-body2" />
            </button>
          </div>
        </div>
        <Button onClick={onNewResearch} className="w-full justify-center gap-2 gradient-primary border-0 text-white hover:opacity-90 transition-opacity" size="sm">
          <Plus className="w-4 h-4" />
          新建研究
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtitle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索历史记录..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border/60 bg-card-alt text-title placeholder:text-subtitle focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      </div>

      {/* Label */}
      <div className="px-5 pb-2 flex-shrink-0">
        <p className="text-[10px] font-semibold text-subtitle uppercase tracking-[0.15em]">
          历史记录
        </p>
      </div>

      {/* Sessions list */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-4">
          {filtered.length === 0 ? (
            <p className="text-xs text-subtitle px-3 py-8 text-center">暂无记录</p>
          ) : (
            filtered.map((session) => {
              const cfg = STAGE_CONFIG[session.stage] || STAGE_CONFIG.IDLE;
              const isActive = activeSessionId === session.id;
              return (
                <button
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? 'bg-menu-selected border border-primary/15 shadow-sm'
                      : 'hover:bg-hover-bg border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {session.stage === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-theme-accent" />
                    ) : cfg.pulse ? (
                      <Loader2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary animate-spin" style={{ animationDuration: '2s' }} />
                    ) : (
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-subtitle group-hover:text-body2 transition-colors" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`truncate font-medium ${isActive ? 'text-title' : 'text-body2'}`}>{session.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-subtitle flex items-center gap-1">
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

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 sm:hidden p-2 rounded-lg bg-card border border-border/60 shadow-sm hover:bg-hover-bg transition-colors cursor-pointer"
      >
        <Menu className="w-5 h-5 text-title" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[280px] shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop: collapsed state → floating icon */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden sm:flex fixed top-3 left-3 z-10 p-2 rounded-2xl bg-muted hover:bg-hover-bg transition-colors cursor-pointer"
          title="展开侧边栏"
        >
          <Menu className="w-5 h-5 text-subtitle" />
        </button>
      )}

      {/* Desktop: expanded sidebar */}
      {!collapsed && (
        <div className="hidden sm:block h-full">
          {sidebarContent}
        </div>
      )}
    </>
  );
}
