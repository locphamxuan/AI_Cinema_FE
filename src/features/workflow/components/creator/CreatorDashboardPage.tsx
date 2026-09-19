'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Video, Play, Milestone } from 'lucide-react';
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

  if (!currentPackage) return null;

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

      <main className="flex-1 bg-[#F8FAFC] dark:bg-[#0B0C10] p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 transition-colors">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            {/* Top Bar Breadcrumb: Tất cả project / Cyber Saigon 2077 / Tập 3 */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1 flex-wrap">
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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {currentPackage.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {canEnterStudio && (
              <Link
                href={`/creator/studio/${currentPackage.id}`}
                className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-purple-200 dark:shadow-none cursor-pointer"
              >
                <Video className="w-4 h-4" /> Mở AI Studio
              </Link>
            )}
            {currentPackage.status === 'PUBLISHED' && (
              <Link
                href={`/watch/${currentPackage.id}`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-emerald-200 dark:shadow-none"
              >
                <Play className="w-4 h-4" /> Xem Trên OTT
              </Link>
            )}
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
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-purple-200' : 'text-amber-600 dark:text-amber-400'}`}>
                      {ep.actual_tokens_used}T
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Milestone Banner */}
        {activeMilestone && (
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-400/30 shrink-0">
                <Milestone className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-purple-300">
                  <span>📍 Cột mốc tiến độ dự án đang chọn thực hiện</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-purple-400/20 text-purple-200 border border-purple-400/30">
                    Thời gian: {activeMilestone.startDate ? `${activeMilestone.startDate} ➔ ${activeMilestone.deadline}` : activeMilestone.deadline}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5">{activeMilestone.title}</h3>
                {activeMilestone.description && (
                  <p className="text-xs text-purple-200/80 mt-0.5 line-clamp-1">{activeMilestone.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0 text-xs">
              <span className="text-[11px] text-purple-200">Trạng thái:</span>
              <span
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                  activeMilestone.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : activeMilestone.status === 'in_progress'
                    ? 'bg-purple-500/30 text-purple-200 border-purple-400/40'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600'
                }`}
              >
                {activeMilestone.status === 'completed'
                  ? 'Đã hoàn thành ✓'
                  : activeMilestone.status === 'in_progress'
                  ? 'Đang thực hiện'
                  : 'Chưa thực hiện'}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <OverviewTab
            project={project}
            currentPackage={currentPackage}
            isQuotaWarning={isQuotaWarning}
            scenesCount={currentPackage.brief.scene_breakdown.length}
            estimatedTokens={currentPackage.brief.estimated_tokens}
            latestFeedback={latestFeedback}
            canEnterStudio={canEnterStudio}
            onGotoBrief={() => setActiveTab('brief')}
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
