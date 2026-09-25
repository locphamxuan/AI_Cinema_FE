'use client';

import { useState, type ComponentType } from 'react';
import Image from 'next/image';
import { Clapperboard, Plus, ChevronDown } from 'lucide-react';
import type { ProductionProject } from '@/types/workflow';
import type { ProjectGroup } from '@/features/workflow/lib/projectGroups';

type ProjectStatus = NonNullable<ProductionProject['overall_status']>;

const STATUS_META: Record<string, { label: string; dot: string }> = {
  NOT_STARTED: { label: 'Chưa bắt đầu', dot: 'bg-slate-400' },
  DRAFT: { label: 'Bản nháp', dot: 'bg-slate-400' },
  IN_PROGRESS: { label: 'Đang thực hiện', dot: 'bg-purple-500' },
  ACTIVE: { label: 'Đang hoạt động', dot: 'bg-purple-500' },
  PENDING_REVIEW: { label: 'Chờ duyệt', dot: 'bg-amber-500' },
  CHANGES_REQUESTED: { label: 'Cần chỉnh sửa', dot: 'bg-rose-500' },
  COMPLETED: { label: 'Hoàn thành', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Đã hủy', dot: 'bg-slate-500' },
};

export interface SidebarNavItem {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}

export interface WorkspaceSidebarProps {
  groups: ProjectGroup[];
  selectedProjectId?: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject?: () => void;
  /** Nav for whichever project is selected, shown nested under that project (e.g. Overview / Plan review). */
  navItems?: SidebarNavItem[];
  activeNavKey?: string;
  onNavSelect?: (key: string) => void;
}

function ProjectRow({ project, isSelected, onSelect }: { project: ProductionProject; isSelected: boolean; onSelect: () => void }) {
  const statusKey = project.overall_status || 'NOT_STARTED';
  const status = STATUS_META[statusKey] || STATUS_META.NOT_STARTED;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isSelected ? 'true' : undefined}
      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
        isSelected ? 'bg-purple-50 dark:bg-purple-500/10' : 'hover:bg-slate-100 dark:hover:bg-white/5'
      }`}
    >
      <div className="relative w-9 h-9 rounded-md overflow-hidden bg-slate-200 dark:bg-white/10 shrink-0">
        {project.thumbnail_url ? (
          <Image src={project.thumbnail_url} alt="" fill sizes="36px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Clapperboard className="w-4 h-4" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-semibold truncate ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-800 dark:text-slate-200'}`}>
          {project.title}
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} aria-hidden="true" />
          <span className="truncate">{status.label}</span>
        </p>
      </div>
    </button>
  );
}

function NavList({ items, activeKey, onSelect }: { items: SidebarNavItem[]; activeKey?: string; onSelect?: (key: string) => void }) {
  return (
    <nav aria-label="Các mục của phim đang chọn" className="ml-4 pl-3 my-1 border-l border-slate-200 dark:border-white/10 space-y-0.5">
      {items.map(({ key, label, icon: Icon, badge }) => {
        const isActive = activeKey === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect?.(key)}
            aria-current={isActive ? 'page' : undefined}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
              isActive ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-left truncate">{label}</span>
            {Boolean(badge) && (
              <span className={`min-w-4 px-1 rounded-full text-[10px] font-bold text-center ${isActive ? 'bg-white/25 text-white' : 'bg-amber-500 text-white'}`}>
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/**
 * Left-hand navigation for both role workspaces. Projects are split into
 * collapsible groups (which groups depends on the role); opening a group lists
 * its films, and the selected film expands into its own sections.
 */
export function WorkspaceSidebar({ groups, selectedProjectId, onSelectProject, onCreateProject, navItems, activeNavKey, onNavSelect }: WorkspaceSidebarProps) {
  // A group the user has not touched stays open only while it holds the selected film.
  const [openByKey, setOpenByKey] = useState<Record<string, boolean>>({});

  return (
    <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E0F14] flex flex-col h-full overflow-hidden">
      {onCreateProject && (
        <div className="p-3 border-b border-slate-100 dark:border-white/5">
          <button
            type="button"
            onClick={onCreateProject}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0E0F14]"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Tạo dự án phim
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {groups.map((group) => {
          const hasSelected = group.projects.some((p) => p.id === selectedProjectId);
          const isOpen = openByKey[group.key] ?? hasSelected;
          const panelId = `sidebar-group-${group.key}`;

          return (
            <section key={group.key}>
              <button
                type="button"
                onClick={() => setOpenByKey((prev) => ({ ...prev, [group.key]: !isOpen }))}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[13px] font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
              >
                <span className="flex-1 truncate">{group.label}</span>
                <span className="text-xs font-normal text-slate-400 tabular-nums">{group.projects.length}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} aria-hidden="true" />
              </button>

              {isOpen && (
                <div id={panelId} className="mt-0.5 mb-2 pl-1">
                  {group.projects.length === 0 ? (
                    <p className="px-2.5 py-2 text-xs text-slate-400 dark:text-slate-500">{group.emptyText}</p>
                  ) : (
                    <ul className="space-y-0.5">
                      {group.projects.map((p) => {
                        const isSelected = p.id === selectedProjectId;
                        return (
                          <li key={p.id}>
                            <ProjectRow project={p} isSelected={isSelected} onSelect={() => onSelectProject(p.id)} />
                            {isSelected && navItems && navItems.length > 0 && <NavList items={navItems} activeKey={activeNavKey} onSelect={onNavSelect} />}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
