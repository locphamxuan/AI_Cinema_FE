'use client';

import { useMemo, useState, type ComponentType } from 'react';
import Image from 'next/image';
import { Search, Clapperboard, Plus } from 'lucide-react';
import type { ProductionProject } from '@/types/workflow';
import { Badge } from '@/components/ui/Badge';

const STATUS_LABEL: Record<NonNullable<ProductionProject['overall_status']>, string> = {
  NOT_STARTED: 'Cần bắt đầu',
  IN_PROGRESS: 'Đang thực hiện',
  PENDING_REVIEW: 'Chờ duyệt',
  CHANGES_REQUESTED: 'Cần chỉnh sửa',
  COMPLETED: 'Đã hoàn thành',
};

const STATUS_TONE: Record<NonNullable<ProductionProject['overall_status']>, 'neutral' | 'amber' | 'emerald' | 'blue' | 'purple' | 'rose'> = {
  NOT_STARTED: 'blue',
  IN_PROGRESS: 'purple',
  PENDING_REVIEW: 'amber',
  CHANGES_REQUESTED: 'rose',
  COMPLETED: 'emerald',
};

export interface SidebarNavItem {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}

export interface WorkspaceSidebarProps {
  title: string;
  projects: ProductionProject[];
  selectedProjectId?: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject?: () => void;
  /** Contextual nav for whichever project is selected (e.g. Overview / Plan review / Tokens). */
  navItems?: SidebarNavItem[];
  activeNavKey?: string;
  onNavSelect?: (key: string) => void;
}

function TokenBar({ used, allocated }: { used: number; allocated: number }) {
  if (allocated <= 0) return null;
  const pct = Math.min(100, Math.round((used / allocated) * 100));
  return (
    <div className="w-full h-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden mt-1.5">
      <div className={`h-full rounded-full ${pct >= 90 ? 'bg-rose-500' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function ProjectRow({ project, isSelected, onSelect }: { project: ProductionProject; isSelected: boolean; onSelect: () => void }) {
  const status = project.overall_status || 'NOT_STARTED';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition cursor-pointer border ${
        isSelected ? 'bg-ruby/10 dark:bg-ruby/15 border-ruby/40' : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5'
      }`}
    >
      <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-200 dark:bg-white/10 shrink-0">
        {project.thumbnail_url ? (
          <Image src={project.thumbnail_url} alt={project.title} fill sizes="44px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Clapperboard className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold truncate ${isSelected ? 'text-ruby' : 'text-slate-800 dark:text-slate-200'}`}>{project.title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{project.total_episodes} tập</span>
          <span className="text-slate-300 dark:text-white/20">·</span>
          <Badge tone={STATUS_TONE[status]} dot className="px-1.5 py-0 text-[10px]">
            {STATUS_LABEL[status]}
          </Badge>
        </div>
        <TokenBar used={project.consumed_tokens} allocated={project.allocated_tokens} />
      </div>
    </button>
  );
}

/**
 * Left-hand navigation for both role workspaces: search + film lists
 * (assigned / completed), plus a contextual nav section for whichever
 * project is currently selected (Overview, plan review, tokens, ...).
 */
export function WorkspaceSidebar({
  title,
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  navItems,
  activeNavKey,
  onNavSelect,
}: WorkspaceSidebarProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.title.toLowerCase().includes(q) || p.genre.some((g) => g.toLowerCase().includes(q)));
  }, [projects, query]);

  const assigned = filtered.filter((p) => p.overall_status !== 'COMPLETED');
  const completed = filtered.filter((p) => p.overall_status === 'COMPLETED');
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const totalAllocated = projects.reduce((sum, p) => sum + p.allocated_tokens, 0);
  const totalConsumed = projects.reduce((sum, p) => sum + p.consumed_tokens, 0);

  return (
    <aside className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E0F14] flex flex-col md:h-[calc(100vh-56px)] md:sticky md:top-14">
      <div className="p-4 space-y-3 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">{title}</h2>
        </div>
        {onCreateProject && (
          <button
            type="button"
            onClick={onCreateProject}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-ruby/10 hover:bg-ruby/20 text-ruby text-xs font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby/50"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm dự án phim mới
          </button>
        )}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm phim…"
            aria-label="Tìm phim"
            autoComplete="off"
            className="w-full pl-8 pr-2.5 py-1.5 bg-slate-100 dark:bg-white/5 border border-transparent rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby/40 transition"
          />
        </div>
        {navItems && (projects.length > 0) && (
          <div className="flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400 px-0.5">
            <span>Ngân sách token tổng</span>
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {totalConsumed}/{totalAllocated}
            </span>
          </div>
        )}
      </div>

      {navItems && navItems.length > 0 && (
        <div className="p-3 border-b border-slate-100 dark:border-white/5 space-y-1">
          {selectedProject && <p className="px-1.5 text-[10px] text-slate-400 dark:text-slate-500 truncate mb-1">{selectedProject.title}</p>}
          {navItems.map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              type="button"
              onClick={() => onNavSelect?.(key)}
              disabled={!selectedProjectId}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                activeNavKey === key
                  ? 'bg-ruby/10 dark:bg-ruby/15 text-ruby'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 text-left truncate">{label}</span>
              {Boolean(badge) && <span className="px-1.5 py-0 rounded-full bg-amber-500 text-white text-[10px] font-bold">{badge}</span>}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="space-y-1">
          <div className="px-1.5 py-1 text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Phim được giao</span>
            <span>{assigned.length}</span>
          </div>
          {assigned.length === 0 ? (
            <p className="px-1.5 py-2 text-[11px] text-slate-400 dark:text-slate-500">Không có phim nào.</p>
          ) : (
            assigned.map((p) => <ProjectRow key={p.id} project={p} isSelected={p.id === selectedProjectId} onSelect={() => onSelectProject(p.id)} />)
          )}
        </div>

        <div className="space-y-1">
          <div className="px-1.5 py-1 text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Phim đã hoàn thành</span>
            <span>{completed.length}</span>
          </div>
          {completed.length === 0 ? (
            <p className="px-1.5 py-2 text-[11px] text-slate-400 dark:text-slate-500">Chưa có phim nào hoàn thành.</p>
          ) : (
            completed.map((p) => <ProjectRow key={p.id} project={p} isSelected={p.id === selectedProjectId} onSelect={() => onSelectProject(p.id)} />)
          )}
        </div>
      </div>
    </aside>
  );
}
