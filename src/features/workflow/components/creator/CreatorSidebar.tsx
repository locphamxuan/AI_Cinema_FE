import { Layers, LayoutDashboard, FileText, Video, Zap, MessageSquare, ExternalLink } from 'lucide-react';
import type { EpisodePackage, ProductionProject } from '@/types/workflow';
import { EpisodeSwitcherList } from '../shared/EpisodeSwitcherList';

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
const NAV_ITEM_ACTIVE = 'bg-ruby/10 dark:bg-ruby/20 text-ruby border border-ruby/30 font-bold';
const NAV_ITEM_INACTIVE = 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5';

export function CreatorSidebar({
  project,
  currentPackage,
  activeTab,
  onTabChange,
  onSelectEpisode,
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
    <aside className="w-full md:w-64 lg:w-72 bg-white dark:bg-[#12141A] border-r border-slate-200 dark:border-white/10 flex flex-col shrink-0 transition-colors">
      {/* Episode Quick Switcher */}
      <div className="p-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
          <span className="font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-ruby" /> Danh Sách Tập Phim
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
            {project.episodes.length} Tập
          </span>
        </div>

        <EpisodeSwitcherList
          episodes={project.episodes}
          selectedId={currentPackage?.id}
          onSelect={onSelectEpisode}
          variant="creator"
          renderSubtitle={(ep) => (ep.actual_tokens_used > 0 ? `${ep.actual_tokens_used} Tokens` : 'Chưa dùng Token')}
        />
      </div>

      {/* Navigation Tabs */}
      <nav className="p-3 space-y-1 flex-1">
        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3 pt-2">
          Menu Sáng Tạo
        </div>

        <button
          onClick={() => onTabChange('overview')}
          className={`${NAV_ITEM_BASE} gap-2.5 ${activeTab === 'overview' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Tổng Quan & Số Liệu</span>
        </button>

        <button
          onClick={() => onTabChange('brief')}
          className={`${NAV_ITEM_BASE} justify-between ${activeTab === 'brief' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4" />
            <span>Kế Hoạch & Kịch Bản</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-mono">
            {scenesCount}
          </span>
        </button>

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
            <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>AI Production Studio</span>
          </div>
          {canEnterStudio ? (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              Mở <ExternalLink className="w-3 h-3" />
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">Khóa</span>
          )}
        </button>

        <button
          onClick={() => onTabChange('tokens')}
          className={`${NAV_ITEM_BASE} justify-between ${activeTab === 'tokens' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>AI Token Quota</span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
            {quotaUsed}/{quotaAllocated}
          </span>
        </button>

        <button
          onClick={() => onTabChange('reviews')}
          className={`${NAV_ITEM_BASE} justify-between ${activeTab === 'reviews' ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Phản Hồi & Thẩm Định</span>
          </div>
          {hasFeedback && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
        </button>
      </nav>

      {/* Bottom Sidebar Token Card */}
      <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5">
        <div className="bg-white dark:bg-[#161922] p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Quota Tập Đang Chọn:</span>
            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-xs">
              {quotaAllocated > 0 ? `${quotaAllocated} T` : 'Chưa cấp'}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isQuotaWarning ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-amber-500'
              }`}
              style={{ width: `${quotaFillPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Trạng thái: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{currentPackage?.status}</strong>
          </p>
        </div>
      </div>
    </aside>
  );
}
