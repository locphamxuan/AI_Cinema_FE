'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Play, LayoutDashboard, FileText, MessageSquare, Zap, Film } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { WorkspaceSidebar, type SidebarNavItem } from '../shared/WorkspaceSidebar';
import { EpisodeSwitcher } from '../shared/EpisodeSwitcher';
import { creatorGroups } from '@/features/workflow/lib/projectGroups';
import { OverviewTab } from './tabs/OverviewTab';
import { BriefTab } from './tabs/BriefTab';
import { StudioLinkTab } from './tabs/StudioLinkTab';
import { TokensTab } from './tabs/TokensTab';
import { ReviewsTab } from './tabs/ReviewsTab';

type CreatorTab = 'overview' | 'brief' | 'studio' | 'tokens' | 'reviews';

/**
 * Creator's entry point after login: a left sidebar listing every assigned
 * film (grouped by assigned / completed) and, once one is selected, its
 * production workspace on the right — replaces the old grid-only hub page
 * and the separate per-project dashboard route.
 */
export function CreatorWorkspacePage() {
  const router = useRouter();
  const {
    projects,
    activeProjectId,
    setActiveProject,
    project,
    activePackageId,
    setActivePackage,
    updateContentBrief,
    updateOverallScript,
    submitProductionPlan,
    reviseProductionPlan,
    reviews,
    loadProjects,
  } = useWorkflowStore();

  const [activeTab, setActiveTab] = useState<CreatorTab>('overview');

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasSelection = projects.some((p) => p.id === activeProjectId);
  const currentPackage = hasSelection ? project.episodes.find((e) => e.id === activePackageId) || project.episodes[0] : undefined;

  const quotaPercent = project.allocated_tokens > 0 ? (project.consumed_tokens / project.allocated_tokens) * 100 : 0;
  const isQuotaWarning = quotaPercent >= 90;

  const latestFeedback = currentPackage
    ? reviews.filter((r) => r.episode_package_id === currentPackage.id && r.decision === 'changes_requested')[0]
    : undefined;
  const episodeReviews = currentPackage ? reviews.filter((r) => r.episode_package_id === currentPackage.id) : [];

  const canEnterStudio =
    currentPackage?.status === 'QUOTA_ALLOCATED' ||
    currentPackage?.status === 'IN_PRODUCTION' ||
    currentPackage?.status === 'EPISODE_SUBMITTED' ||
    currentPackage?.status === 'COMPLIANCE_PASSED' ||
    currentPackage?.status === 'PUBLISHED';

  const navItems: SidebarNavItem[] = [
    { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { key: 'brief', label: 'Kịch bản', icon: FileText },
    { key: 'studio', label: 'Sản xuất', icon: Video },
    { key: 'reviews', label: 'Phản hồi', icon: MessageSquare, badge: latestFeedback ? 1 : undefined },
    { key: 'tokens', label: 'Token', icon: Zap },
  ];

  const handleSelectProject = (projectId: string) => {
    setActiveProject(projectId);
    setActiveTab('overview');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
      <WorkspaceSidebar
        groups={creatorGroups(projects)}
        selectedProjectId={hasSelection ? activeProjectId : undefined}
        onSelectProject={handleSelectProject}
        navItems={navItems}
        activeNavKey={activeTab}
        onNavSelect={(key) => setActiveTab(key as CreatorTab)}
      />

      <main className="flex-1 bg-[#F8FAFC] dark:bg-[#0B0C10] p-4 sm:p-6 lg:p-8 overflow-y-auto transition-colors">
        {!hasSelection || !currentPackage ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-20">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Chọn một phim để bắt đầu</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Danh sách phim nằm ở thanh bên trái.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{project.title} · Mùa {currentPackage.season_number}</p>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{currentPackage.title}</h1>
              </div>
              <div className="flex items-center gap-3">
                {canEnterStudio && (
                  <button
                    onClick={() => router.push(`/creator/studio/${currentPackage.id}`)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <Video className="w-4 h-4" /> Mở AI Studio
                  </button>
                )}
                {currentPackage.status === 'PUBLISHED' && (
                  <button
                    onClick={() => router.push(`/watch/${currentPackage.id}`)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <Play className="w-4 h-4" /> Xem trên OTT
                  </button>
                )}
              </div>
            </div>

            <EpisodeSwitcher episodes={project.episodes} selectedId={currentPackage.id} onSelect={setActivePackage} />

            {activeTab === 'overview' && (
              <OverviewTab
                project={project}
                currentPackage={currentPackage}
                isQuotaWarning={isQuotaWarning}
                scenesCount={currentPackage.brief.scene_breakdown.length}
                estimatedTokens={currentPackage.brief.estimated_tokens}
                synopsis={project.synopsis}
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
                overallScript={project.overall_script}
                scriptVersion={project.script_version}
                scriptReview={project.script_review}
                updateOverallScript={updateOverallScript}
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
          </div>
        )}
      </main>
    </div>
  );
}

export default CreatorWorkspacePage;
