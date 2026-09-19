'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Play, LayoutDashboard, FileText, MessageSquare, Zap, Film } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { WorkspaceSidebar } from '../shared/WorkspaceSidebar';
import { OverviewTab } from './tabs/OverviewTab';
import { BriefTab } from './tabs/BriefTab';
import { StudioLinkTab } from './tabs/StudioLinkTab';
import { TokensTab } from './tabs/TokensTab';
import { ReviewsTab } from './tabs/ReviewsTab';

type CreatorTab = 'overview' | 'brief' | 'studio' | 'tokens' | 'reviews';

const TABS: { key: CreatorTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { key: 'brief', label: 'Kịch bản & phân cảnh', icon: FileText },
  { key: 'studio', label: 'Sản xuất video', icon: Video },
  { key: 'reviews', label: 'Feedback & duyệt', icon: MessageSquare },
  { key: 'tokens', label: 'Token', icon: Zap },
];

/**
 * Creator's entry point after login: a left sidebar listing every assigned
 * film (grouped by assigned / completed) and, once one is selected, its
 * production workspace on the right — replaces the old grid-only hub page
 * and the separate per-project dashboard route.
 */
export function CreatorWorkspacePage() {
  const router = useRouter();
  const { projects, activeProjectId, setActiveProject, project, activePackageId, setActivePackage, updateContentBrief, submitProductionPlan, reviseProductionPlan, reviews } =
    useWorkflowStore();

  const [activeTab, setActiveTab] = useState<CreatorTab>('overview');

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

  const handleSelectProject = (projectId: string) => {
    setActiveProject(projectId);
    setActiveTab('overview');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
      <WorkspaceSidebar title="Không gian làm việc" projects={projects} selectedProjectId={hasSelection ? activeProjectId : undefined} onSelectProject={handleSelectProject} />

      <main className="flex-1 bg-[#F8FAFC] dark:bg-[#0B0C10] p-4 sm:p-6 lg:p-8 overflow-y-auto transition-colors">
        {!hasSelection || !currentPackage ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-20">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Chọn một phim để bắt đầu</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Danh sách phim được giao nằm ở thanh bên trái.</p>
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
                    className="px-4 py-2 rounded-xl bg-ruby hover:bg-ruby-dark text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm"
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

            {/* Episode selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {project.episodes.map((ep) => {
                const isSelected = ep.id === currentPackage.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => setActivePackage(ep.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-ruby text-white border-ruby'
                        : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>
                      M{ep.season_number} · T{ep.episode_number}
                    </span>
                    <span className="truncate max-w-[160px]">{ep.title.replace(/^Tập \d+:\s*/, '')}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab strip */}
            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-white/10 overflow-x-auto scrollbar-none">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer shrink-0 ${
                    activeTab === key
                      ? 'border-ruby text-ruby'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {key === 'reviews' && latestFeedback && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                </button>
              ))}
            </div>

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
          </div>
        )}
      </main>
    </div>
  );
}

export default CreatorWorkspacePage;
