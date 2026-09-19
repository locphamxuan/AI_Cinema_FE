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
          label: 'Đang Sản Xuất AI',
          dotColor: 'bg-indigo-500 animate-pulse',
          className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
        };
      case 'PLAN_PENDING':
        return {
          label: 'Chờ Phê Duyệt Quota',
          dotColor: 'bg-amber-500',
          className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
        };
      case 'CHANGES_REQUESTED':
        return {
          label: 'Yêu Cầu Hiệu Chỉnh',
          dotColor: 'bg-rose-500',
          className: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
        };
      case 'EPISODE_SUBMITTED':
        return {
          label: 'Chờ Thẩm Định Bản Dựng',
          dotColor: 'bg-sky-500',
          className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
        };
      case 'COMPLIANCE_PASSED':
      case 'PUBLISHED':
        return {
          label: 'Đã Hoàn Tất & Công Chiếu',
          dotColor: 'bg-emerald-500',
          className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
        };
      default:
        return {
          label: 'Bản Thảo Kịch Bản',
          dotColor: 'bg-slate-400',
          className: 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-white/10',
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

      <main className="flex-1 bg-[#F9FAFB] dark:bg-[#0D0E12] p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-5 transition-colors">
        {/* Top Header & Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <Link
            href="/creator/projects"
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline transition flex items-center gap-1"
          >
            Tất cả project
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">{project.title}</span>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Tập {currentPackage.episode_number}</span>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
          <span className="text-slate-700 dark:text-slate-300 capitalize font-medium">{activeTab}</span>
        </div>

        {/* 1. Action Bar Ở Đầu Trang */}
        <div className="bg-white dark:bg-[#151822] rounded-xl p-4.5 border border-slate-200/80 dark:border-white/10 shadow-xs relative overflow-hidden">
          {/* Top subtle accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-600" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Episode Title & Specs */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-indigo-600 text-white shadow-xs">
                  TẬP {currentPackage.episode_number}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${statusBadge.className}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                  {statusBadge.label}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {project.genre?.[0] || 'Phim AI'} · {currentPackage.brief.scene_breakdown.length} Cảnh Phim
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {currentPackage.title.replace(/^Tập \d+:\s*/, '')}
              </h1>

              <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 max-w-2xl">
                {currentPackage.brief.synopsis || 'Chưa có tóm tắt kịch bản cho tập phim này.'}
              </p>
            </div>

            {/* Right: Prominent Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Primary Button lớn: Mở AI Production Studio */}
              <button
                type="button"
                onClick={() => (canEnterStudio ? router.push(`/creator/studio/${currentPackage.id}`) : setActiveTab('brief'))}
                className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Mở AI Production Studio</span>
              </button>

              {/* Secondary Button: Xem Kịch Bản / Brief */}
              <button
                type="button"
                onClick={() => setActiveTab('brief')}
                className={`px-3.5 py-2.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition cursor-pointer border ${
                  activeTab === 'brief'
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 font-semibold'
                    : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Kịch Bản / Brief</span>
              </button>

              {/* Xem trên OTT (nếu đã xuất bản) */}
              {currentPackage.status === 'PUBLISHED' && (
                <Link
                  href={`/watch/${currentPackage.id}`}
                  className="px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Xem Trên OTT</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Episode Selector Bar (Horizontal Selector) */}
        <div className="bg-white dark:bg-[#151822] p-3 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Chọn tập phim thực hiện:
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Tổng số: {project.episodes.length} Tập
            </span>
          </div>

          {/* Episode Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {project.episodes.map((ep) => {
              const isSelected = ep.id === currentPackage.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => setActivePackage(ep.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs font-semibold'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-slate-400'}`}>
                    Tập {ep.episode_number}
                  </span>
                  <span className="truncate max-w-[160px]">{ep.title.replace(/^Tập \d+:\s*/, '')}</span>
                  {ep.actual_tokens_used > 0 && (
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
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
