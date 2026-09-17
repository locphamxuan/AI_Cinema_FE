import { ShieldCheck, LayoutDashboard, CheckSquare, BadgeCheck, Film, Zap, Plus } from 'lucide-react';
import type { EpisodePackage, ProductionProject } from '@/types/workflow';
import { EpisodeSwitcherList } from '../shared/EpisodeSwitcherList';

export type ReviewerTab = 'overview' | 'plans' | 'audits' | 'projects' | 'tokens';

export interface ReviewerSidebarProps {
  project: ProductionProject;
  currentPackage?: EpisodePackage;
  activeTab: ReviewerTab;
  onTabChange: (tab: ReviewerTab) => void;
  onSelectEpisode: (id: string) => void;
  pendingPlanCount: number;
  submittedCount: number;
  onCreateProject: () => void;
}

const NAV_ITEM_BASE = 'w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center transition cursor-pointer';
const NAV_ITEM_ACTIVE = 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 font-bold';
const NAV_ITEM_INACTIVE = 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5';

export function ReviewerSidebar({
  project,
  currentPackage,
  activeTab,
  onTabChange,
  onSelectEpisode,
  pendingPlanCount,
  submittedCount,
  onCreateProject,
}: ReviewerSidebarProps) {
  return (
    <aside className="w-full md:w-64 lg:w-72 bg-white dark:bg-[#12141A] border-r border-slate-200 dark:border-white/10 flex flex-col shrink-0 transition-colors">
      <div className="p-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
          <span className="font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Tập Phim Cần Duyệt
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
            {project.episodes.length} Tập
          </span>
        </div>

        <EpisodeSwitcherList episodes={project.episodes} selectedId={currentPackage?.id} onSelect={onSelectEpisode} variant="reviewer" />
      </div>

      <nav className="p-3 space-y-1 flex-1">
        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3 pt-2">
          Menu Thẩm Định
        </div>

        <button
          onClick={() => onTabChange('overview')}
          className={`${NAV_ITEM_BASE} gap-2.5 ${activeTab === 'overview' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Tổng Quan Thẩm Định</span>
        </button>

        <button
          onClick={() => onTabChange('plans')}
          className={`${NAV_ITEM_BASE} justify-between ${activeTab === 'plans' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-4 h-4 text-amber-500" />
            <span>Duyệt Kế Hoạch & Quota</span>
          </div>
          {pendingPlanCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-semibold border border-amber-200 dark:border-amber-500/30">
              {pendingPlanCount} chờ
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('audits')}
          className={`${NAV_ITEM_BASE} justify-between ${activeTab === 'audits' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <div className="flex items-center gap-2.5">
            <BadgeCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Kiểm Định Video & Pháp Lý</span>
          </div>
          {submittedCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-400 font-semibold border border-purple-200 dark:border-purple-500/30">
              {submittedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('projects')}
          className={`${NAV_ITEM_BASE} justify-between ${activeTab === 'projects' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <div className="flex items-center gap-2.5">
            <Film className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Quản Lý Dự Án</span>
          </div>
        </button>

        <button
          onClick={() => onTabChange('tokens')}
          className={`${NAV_ITEM_BASE} justify-between ${activeTab === 'tokens' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Ngân Sách AI Tokens</span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
            {project.allocated_tokens}/{project.total_budget_tokens}
          </span>
        </button>
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5">
        <button
          onClick={onCreateProject}
          className="w-full py-2 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Khởi Tạo Dự Án Mới
        </button>
      </div>
    </aside>
  );
}
