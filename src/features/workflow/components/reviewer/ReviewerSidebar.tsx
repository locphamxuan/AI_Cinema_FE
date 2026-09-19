import { LayoutDashboard, CheckSquare, ShieldCheck, Calendar, Plus, Sparkles, Film, UserCheck } from 'lucide-react';
import type { EpisodePackage, ProductionProject } from '@/types/workflow';

export type ReviewerTab = 'overview' | 'plans' | 'audits' | 'publication' | 'projects' | 'tokens';

export interface ReviewerSidebarProps {
  project: ProductionProject;
  currentPackage?: EpisodePackage;
  activeTab: ReviewerTab;
  onTabChange: (tab: ReviewerTab) => void;
  onSelectEpisode?: (id: string) => void;
  pendingPlanCount: number;
  submittedCount: number;
  onCreateProject: () => void;
}

const NAV_ITEM_BASE = 'w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center transition-all cursor-pointer';
const NAV_ITEM_ACTIVE = 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 font-bold shadow-xs';
const NAV_ITEM_INACTIVE = 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent';

export function ReviewerSidebar({
  project,
  activeTab,
  onTabChange,
  pendingPlanCount,
  submittedCount,
  onCreateProject,
}: ReviewerSidebarProps) {
  const publishedCount = project.episodes.filter((e) => e.status === 'PUBLISHED').length;

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-white dark:bg-[#12141A] border-r border-slate-200 dark:border-white/10 flex flex-col shrink-0 transition-colors">
      {/* Project Brand & Reviewer Identity Header */}
      <div className="p-4 border-b border-slate-200 dark:border-white/10 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400 block truncate">
              Content Reviewer Hub
            </span>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {project.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 dark:text-slate-400">
          <span>Quy mô dự án:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
            {project.episodes.length} Tập Phim
          </span>
        </div>
      </div>

      {/* 4 Navigation Menu Items */}
      <nav className="p-3 space-y-1.5 flex-1">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3 pt-1">
          Menu Điều Hướng Thẩm Định
        </div>

        {/* 1. Tổng Quan Thẩm Định */}
        <button
          type="button"
          onClick={() => onTabChange('overview')}
          className={`${NAV_ITEM_BASE} gap-3 ${activeTab === 'overview' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <LayoutDashboard className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="truncate">📊 Tổng Quan Thẩm Định</span>
        </button>

        {/* 2. Duyệt Kế Hoạch & Phân Bổ Quota */}
        <button
          type="button"
          onClick={() => onTabChange('plans')}
          className={`${NAV_ITEM_BASE} justify-between ${activeTab === 'plans' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <div className="flex items-center gap-3 truncate">
            <CheckSquare className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">📝 Duyệt Kế Hoạch & Quota</span>
          </div>
          {pendingPlanCount > 0 ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold border border-amber-500/30 shrink-0">
              {pendingPlanCount} chờ
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 shrink-0">0</span>
          )}
        </button>

        {/* 3. Kiểm Định Video & Tuân Thủ AI (Compliance Check) */}
        <button
          type="button"
          onClick={() => onTabChange('audits')}
          className={`${NAV_ITEM_BASE} justify-between ${activeTab === 'audits' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <div className="flex items-center gap-3 truncate">
            <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate">⚖️ Kiểm Định & Tuân Thủ AI</span>
          </div>
          {submittedCount > 0 ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-extrabold border border-purple-500/30 shrink-0">
              {submittedCount} video
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 shrink-0">0</span>
          )}
        </button>

        {/* 4. Lịch Chiếu & Xuất Bản (Publication) */}
        <button
          type="button"
          onClick={() => onTabChange('publication')}
          className={`${NAV_ITEM_BASE} justify-between ${activeTab === 'publication' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <div className="flex items-center gap-3 truncate">
            <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">📅 Lịch Chiếu & Xuất Bản</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/30 shrink-0">
            {publishedCount} OTT
          </span>
        </button>
      </nav>

      {/* Footer Quick Action */}
      <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
        <button
          type="button"
          onClick={onCreateProject}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Khởi Tạo Dự Án Mới
        </button>
      </div>
    </aside>
  );
}
