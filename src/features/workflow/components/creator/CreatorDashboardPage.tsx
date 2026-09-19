'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Video, Play, Milestone, FileText } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { CreatorSidebar, type CreatorTab } from './CreatorSidebar';
import { OverviewTab } from './tabs/OverviewTab';
import { BriefTab } from './tabs/BriefTab';
import { StudioLinkTab } from './tabs/StudioLinkTab';
import { TokensTab } from './tabs/TokensTab';
import { ReviewsTab } from './tabs/ReviewsTab';

export function CreatorDashboardPage() {
  const router = useRouter();
  const { project, activePackageId, setActivePackage, updateContentBrief, submitProductionPlan, reviseProductionPlan, reviews } =
    useWorkflowStore();

  const currentPackage = project.episodes.find((e) => e.id === activePackageId) || project.episodes[0];
  const [activeTab, setActiveTab] = useState<CreatorTab>('overview');

  const quotaPercent = project.allocated_tokens > 0 ? (project.consumed_tokens / project.allocated_tokens) * 100 : 0;
  const isQuotaWarning = quotaPercent >= 90;

  const latestFeedback = reviews.filter((r) => r.episode_package_id === currentPackage?.id && r.decision === 'changes_requested')[0];
  const episodeReviews = reviews.filter((r) => r.episode_package_id === currentPackage?.id);

  const activeMilestone = project.milestones?.find((m) => m.id === project.active_milestone_id) || project.milestones?.[0];

  const canEnterStudio =
    currentPackage?.status === 'QUOTA_ALLOCATED' ||
    currentPackage?.status === 'IN_PRODUCTION' ||
    currentPackage?.status === 'EPISODE_SUBMITTED' ||
    currentPackage?.status === 'COMPLIANCE_PASSED' ||
    currentPackage?.status === 'PUBLISHED';

  const statusBadge = (() => {
    switch (currentPackage?.status) {
      case 'QUOTA_ALLOCATED':
      case 'IN_PRODUCTION':
        return {
          label: '🎬 Đang Sản Xuất AI',
          className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        };
      case 'PLAN_PENDING':
        return {
          label: '⏳ Đang Chờ Phê Duyệt Quota',
          className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'CHANGES_REQUESTED':
        return {
          label: '⚠️ Yêu Cầu Hiệu Chỉnh Kịch Bản',
          className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        };
      case 'EPISODE_SUBMITTED':
        return {
          label: '📋 Chờ Thẩm Định Bản Dựng',
          className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
        };
      case 'COMPLIANCE_PASSED':
      case 'PUBLISHED':
        return {
          label: '✓ Đã Hoàn Tất & Công Chiếu',
          className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      default:
        return {
          label: '📝 Bản Thảo Kịch Bản',
          className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        };
    }
  })();

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
      <CreatorSidebar
        project={project}
        currentPackage={currentPackage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelectEpisode={setActivePackage}
        scenesCount={currentPackage.brief.scene_breakdown.length}
        canEnterStudio={canEnterStudio}
        onStudioClick={() => (canEnterStudio ? router.push(`/creator/studio/${currentPackage.id}`) : setActiveTab('studio'))}
        hasFeedback={Boolean(latestFeedback)}
        isQuotaWarning={isQuotaWarning}
      />

      <main className="flex-1 bg-[#F8FAFC] dark:bg-[#0B0C10] p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-5 transition-colors">
        {/* Top Header & Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <Link
            href="/creator/projects"
            className="text-purple-600 dark:text-purple-400 font-bold hover:underline transition flex items-center gap-1"
          >
            Tất cả project
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">{project.title}</span>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
          <span className="text-purple-600 dark:text-purple-400 font-bold">Tập {currentPackage.episode_number}</span>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
          <span className="text-slate-600 dark:text-slate-300 capitalize font-medium">{activeTab}</span>
        </div>

        {/* 1. Action Bar Ở Đầu Trang */}
        <div className="bg-white dark:bg-[#12141A] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
          {/* Top subtle accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-purple-400" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left: Episode Title & Specs */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-purple-600 text-white shadow-xs">
                  TẬP {currentPackage.episode_number}
                </span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {project.genre?.[0] || 'Phim AI'} · {currentPackage.brief.scene_breakdown.length} Cảnh Phim
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {currentPackage.title.replace(/^Tập \d+:\s*/, '')}
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-2xl">
                {currentPackage.brief.synopsis || 'Chưa có tóm tắt kịch bản cho tập phim này.'}
              </p>
            </div>

            {/* Right: Prominent Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Primary Button lớn: Mở AI Production Studio */}
              <button
                type="button"
                onClick={() => (canEnterStudio ? router.push(`/creator/studio/${currentPackage.id}`) : setActiveTab('brief'))}
                className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 active:scale-95 cursor-pointer"
              >
                <Video className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                <span>🎬 Mở AI Production Studio</span>
              </button>

              {/* Secondary Button: Xem Kịch Bản / Brief */}
              <button
                type="button"
                onClick={() => setActiveTab('brief')}
                className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer border ${
                  activeTab === 'brief'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                    : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>📄 Xem Kịch Bản / Brief</span>
              </button>

              {/* Xem trên OTT (nếu đã xuất bản) */}
              {currentPackage.status === 'PUBLISHED' && (
                <Link
                  href={`/watch/${currentPackage.id}`}
                  className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-emerald-200 dark:shadow-none"
                >
                  <Play className="w-4 h-4" /> Xem Trên OTT
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Episode Selector Bar (Horizontal Selector) */}
        <div className="bg-white dark:bg-[#161922] p-3 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Chọn tập phim thực hiện:
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Tổng số: {project.episodes.length} Tập
            </span>
          </div>

          {/* Episode Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {project.episodes.map((ep) => {
              const isSelected = ep.id === currentPackage.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => setActivePackage(ep.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/25'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'}`}>
                    Tập {ep.episode_number}
                  </span>
                  <span className="truncate max-w-[160px]">{ep.title.replace(/^Tập \d+:\s*/, '')}</span>
                  {ep.actual_tokens_used > 0 && (
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-purple-200' : 'text-slate-500 dark:text-slate-400'}`}>
                      {ep.actual_tokens_used}T
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'overview' && (
          <OverviewTab
            project={project}
            currentPackage={currentPackage}
            isQuotaWarning={isQuotaWarning}
            scenesCount={currentPackage.brief.scene_breakdown.length}
            estimatedTokens={currentPackage.brief.estimated_tokens}
            synopsis={currentPackage.brief.synopsis}
            latestFeedback={latestFeedback}
            canEnterStudio={canEnterStudio}
            onGotoBrief={() => setActiveTab('brief')}
            onGotoStudio={() => router.push(`/creator/studio/${currentPackage.id}`)}
            onGotoTokens={() => setActiveTab('tokens')}
            onGotoReviews={() => setActiveTab('reviews')}
          />
        )}

        {activeTab === 'brief' && (
          <BriefTab
            key={currentPackage.id}
            currentPackage={currentPackage}
            updateContentBrief={updateContentBrief}
            submitProductionPlan={submitProductionPlan}
            reviseProductionPlan={reviseProductionPlan}
          />
        )}

        {activeTab === 'studio' && (
          <StudioLinkTab currentPackage={currentPackage} canEnterStudio={canEnterStudio} onGotoBrief={() => setActiveTab('brief')} />
        )}

        {activeTab === 'tokens' && <TokensTab currentPackage={currentPackage} quotaPercent={quotaPercent} isQuotaWarning={isQuotaWarning} />}

        {activeTab === 'reviews' && <ReviewsTab episodeReviews={episodeReviews} />}
      </main>
    </div>
  );
}
