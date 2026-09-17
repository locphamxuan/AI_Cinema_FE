'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Video, Play } from 'lucide-react';
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{project.title}</span>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
              <span className="text-ruby font-semibold">Tập {currentPackage.episode_number}</span>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
              <span className="text-slate-700 dark:text-slate-300 font-medium capitalize">{activeTab}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{currentPackage.title}</h1>
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
