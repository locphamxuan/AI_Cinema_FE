import Link from 'next/link';
import { LayoutDashboard, FileText, Video, Zap, MessageSquare, ExternalLink, ChevronLeft, Film } from 'lucide-react';
import type { EpisodePackage, ProductionProject } from '@/types/workflow';

export type CreatorTab = 'overview' | 'brief' | 'studio' | 'tokens' | 'reviews';

export interface CreatorSidebarProps {
  project: ProductionProject;
  currentPackage?: EpisodePackage;
  activeTab: CreatorTab;
  onTabChange: (tab: CreatorTab) => void;
  onSelectEpisode: (id: string) => void;
  scenesCount: number;
  canEnterStudio: boolean;
  onStudioClick: () => void;
  hasFeedback: boolean;
  isQuotaWarning: boolean;
}

const NAV_ITEM_BASE =
  'w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center transition cursor-pointer';
const NAV_ITEM_ACTIVE = 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/20 font-semibold shadow-2xs';
const NAV_ITEM_INACTIVE = 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent';

export function CreatorSidebar({
  project,
  currentPackage,
  activeTab,
  onTabChange,
  scenesCount,
  canEnterStudio,
  onStudioClick,
  hasFeedback,
  isQuotaWarning,
}: CreatorSidebarProps) {
  const quotaAllocated = currentPackage?.quota_allocated ?? 0;
  const quotaUsed = currentPackage?.actual_tokens_used ?? 0;
  const quotaFillPercent = quotaAllocated > 0 ? Math.min(100, (quotaUsed / quotaAllocated) * 100) : 0;

  return (
    <aside className="w-full md:w-60 lg:w-64 bg-white dark:bg-[#12141A] border-r border-slate-200/80 dark:border-white/10 flex flex-col shrink-0 transition-colors">
      {/* Back to Project Hub Link & Active Project Info Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-white/10 space-y-2.5">
        <Link
          href="/creator/projects"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Tất cả project Hub</span>
        </Link>

        <div className="flex items-center gap-2.5 pt-0.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-white truncate" title={project.title}>
              {project.title}
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
              {project.episodes.length} Tập Phim
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Streamlined to 5 Core Items */}
      <nav className="p-3 space-y-1 flex-1">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2.5 pt-1">
          Menu Trong Project
        </div>

        {/* 1. Tổng quan */}
        <button
          onClick={() => onTabChange('overview')}
          className={`${NAV_ITEM_BASE} gap-2.5 ${activeTab === 'overview' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <LayoutDashboard className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Tổng quan</span>
        </button>

        {/* 2. Kịch bản & phân cảnh */}
        <button
          onClick={() => onTabChange('brief')}
          className={`${NAV_ITEM_BASE} justify-between ${activeTab === 'brief' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Kịch bản & phân cảnh</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-mono">
            {scenesCount}
          </span>
        </button>

        {/* 3. Sản xuất video */}
        <button
          onClick={onStudioClick}
          className={`${NAV_ITEM_BASE} justify-between ${
            activeTab === 'studio'
              ? NAV_ITEM_ACTIVE
              : canEnterStudio
              ? 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              : 'text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Video className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Sản xuất video</span>
          </div>
          {canEnterStudio ? (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              Studio <ExternalLink className="w-3 h-3" />
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">Khóa</span>
          )}
        </button>

        {/* 4. Feedback & duyệt */}
        <button
          onClick={() => onTabChange('reviews')}
          className={`${NAV_ITEM_BASE} justify-between ${activeTab === 'reviews' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Feedback & duyệt</span>
          </div>
          {hasFeedback && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
        </button>

        {/* 5. Token */}
        <button
          onClick={() => onTabChange('tokens')}
          className={`${NAV_ITEM_BASE} justify-between ${activeTab === 'tokens' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Token</span>
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono font-medium">
            {quotaUsed}/{quotaAllocated}
          </span>
        </button>
      </nav>

      {/* Bottom Sidebar Quota Summary */}
      <div className="p-3 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="bg-slate-100 dark:bg-white/5 p-3 rounded-lg border border-slate-200/60 dark:border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Quota Tập Chọn:</span>
            <span className="font-mono text-slate-900 dark:text-white font-semibold text-xs">
              {quotaAllocated > 0 ? `${quotaAllocated} Tokens` : 'Chưa cấp'}
            </span>
          </div>
          <div className="w-full bg-slate-200/80 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isQuotaWarning ? 'bg-rose-500' : 'bg-indigo-600 dark:bg-indigo-500'
              }`}
              style={{ width: `${quotaFillPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
            Trạng thái: <strong className="text-slate-700 dark:text-slate-300 font-medium">{currentPackage?.status}</strong>
          </p>
        </div>
      </div>
    </aside>
  );
}
