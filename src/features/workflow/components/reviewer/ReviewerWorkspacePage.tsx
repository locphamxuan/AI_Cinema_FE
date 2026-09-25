'use client';

import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, ClipboardCheck, ShieldCheck, Zap, Film, Tv } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { WorkspaceSidebar, type SidebarNavItem } from '../shared/WorkspaceSidebar';
import { EpisodeSwitcher } from '../shared/EpisodeSwitcher';
import { MilestoneTimeline } from '../shared/MilestoneTimeline';
import { reviewerGroups } from '@/features/workflow/lib/projectGroups';
import { availableBudget, summarizeFlaggedFields } from '@/features/workflow/lib/planVerdict';
import { pendingQuotaRequest } from '@/features/workflow/lib/quota';
import { OverviewTab } from './tabs/OverviewTab';
import { PlanReviewTab } from './tabs/PlanReviewTab';
import { AuditsTab } from './tabs/AuditsTab';
import { TokensTab } from './tabs/TokensTab';
import { PublicationTab } from './tabs/PublicationTab';
import { AllocateQuotaModal } from './modals/AllocateQuotaModal';
import { RejectPlanModal } from './modals/RejectPlanModal';
import { CreateProjectModal, type CreateProjectFormState } from './modals/CreateProjectModal';
import { toast } from '@/components/ui/Toast';
import { DEFAULT_SUBTITLE_LANGUAGE } from '@/constants/languages';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';

type ReviewerTab = 'overview' | 'plans' | 'audits' | 'publication' | 'tokens';

/** yyyy-mm-dd of today shifted by some days, in local time. */
const dateFromToday = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-CA');
};

/** A fresh form: production starts today, wraps in 3 months and releases a month later. */
const defaultForm = (): CreateProjectFormState => ({
  title: '',
  assignedCreator: '',
  genre: [],
  synopsis: '',
  seasons: [[30, 30, 30, 30, 30]],
  subtitleLanguages: [DEFAULT_SUBTITLE_LANGUAGE],
  budgetTokens: 3000,
  productionStartDate: dateFromToday(0),
  deadline: dateFromToday(90),
  releaseDate: dateFromToday(120),
  milestones: [
    {
      id: 'ms-init-1',
      title: 'Kịch bản và chia cảnh',
      startDate: dateFromToday(0),
      deadline: dateFromToday(30),
      description: 'Chốt kịch bản và danh sách cảnh.',
      status: 'in_progress',
    },
    {
      id: 'ms-init-2',
      title: 'Sản xuất và gửi duyệt',
      startDate: dateFromToday(31),
      deadline: dateFromToday(60),
      description: 'Tạo clip, ghép tập và gửi Reviewer kiểm định.',
      status: 'pending',
    },
  ],
});

/**
 * Reviewer's entry point after login: left sidebar holds the film lists
 * plus a contextual nav (Duyệt phim / Kiểm định pháp lý / Ngân sách token)
 * for whichever film is selected.
 */
export function ReviewerWorkspacePage() {
  const {
    projects,
    activeProjectId,
    setActiveProject,
    project,
    activePackageId,
    setActivePackage,
    createProject,
    allocateQuota,
    requestPlanChanges,
    loadProjects,
    maxEpisodeMinutes,
  } = useWorkflowStore();
  const can = useCan();

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mainRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<ReviewerTab>('overview');

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab, activePackageId]);

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateProjectFormState>(defaultForm);

  const hasSelection = projects.some((p) => p.id === activeProjectId);
  const currentPackage = hasSelection ? project.episodes.find((e) => e.id === activePackageId) || project.episodes[0] : undefined;

  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [quotaToAllocate, setQuotaToAllocate] = useState(0);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const pendingPlanEpisodes = hasSelection ? project.episodes.filter((e) => e.status === 'PLAN_PENDING') : [];
  const submittedEpisodes = hasSelection
    ? project.episodes.filter((e) => e.status === 'EPISODE_SUBMITTED' || e.status === 'COMPLIANCE_PASSED')
    : [];
  const publishReadyEpisodes = hasSelection ? project.episodes.filter((e) => e.status === 'COMPLIANCE_PASSED') : [];
  const quotaRequestCount = hasSelection ? project.episodes.filter((e) => pendingQuotaRequest(e)).length : 0;

  const navItems: SidebarNavItem[] = [
    { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { key: 'plans', label: 'Duyệt kế hoạch', icon: ClipboardCheck, badge: pendingPlanEpisodes.length || undefined },
    { key: 'audits', label: 'Kiểm định', icon: ShieldCheck },
    { key: 'publication', label: 'Xuất bản', icon: Tv, badge: publishReadyEpisodes.length || undefined },
    { key: 'tokens', label: 'Token', icon: Zap, badge: quotaRequestCount || undefined },
  ];

  const handleSelectProject = (projectId: string) => {
    setActiveProject(projectId);
    setActiveTab('overview');
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.assignedCreator) return;
    if (maxEpisodeMinutes !== null && createForm.seasons.flat().some((minutes) => minutes > maxEpisodeMinutes)) {
      toast.error('Có tập dài hơn mức cho phép', `Mỗi tập tối đa ${maxEpisodeMinutes} phút. Giảm thời lượng các tập được đánh dấu đỏ rồi thử lại.`);
      return;
    }

    const created = await createProject({
      title: createForm.title,
      creator_id: createForm.assignedCreator,
      genre_ids: createForm.genre,
      subtitle_languages: createForm.subtitleLanguages,
      synopsis: createForm.synopsis,
      episodes: createForm.seasons.flatMap((durations, s) => durations.map((minutes) => ({ season_number: s + 1, duration_minutes: minutes }))),
      total_budget_tokens: createForm.budgetTokens,
      production_start_date: createForm.productionStartDate,
      deadline: createForm.deadline,
      planned_release_date: createForm.releaseDate,
      milestones: createForm.milestones,
    });
    if (!created) return;

    setIsCreateProjectOpen(false);
    setCreateForm(defaultForm());
    setActiveTab('overview');
  };

  const openRejectModal = () => {
    if (currentPackage) setRejectFeedback(summarizeFlaggedFields(currentPackage.brief));
    setIsRejectModalOpen(true);
  };

  const openQuotaModal = () => {
    if (!currentPackage) return;
    // Start from what is already granted, else the Creator's estimate, never more than the budget left.
    const estimate = currentPackage.brief.estimated_tokens;
    const maxAvail = availableBudget(project) + currentPackage.quota_allocated;
    const initialQuota = currentPackage.quota_allocated > 0
      ? currentPackage.quota_allocated
      : Math.min(estimate > 0 ? estimate : maxAvail, maxAvail);
    setQuotaToAllocate(initialQuota);
    setIsQuotaModalOpen(true);
  };

  const handleAllocateQuotaConfirm = async () => {
    if (!currentPackage) return;
    if (!(await allocateQuota(currentPackage.id, quotaToAllocate))) return;
    setIsQuotaModalOpen(false);
    toast.success(
      'Đã duyệt kế hoạch',
      `Đã duyệt và cấp ${quotaToAllocate.toLocaleString()} token cho ${currentPackage.title}.`
    );
  };

  const handleRequestChangesConfirm = async () => {
    if (!currentPackage || !rejectFeedback.trim()) return;
    if (!(await requestPlanChanges(currentPackage.id, rejectFeedback))) return;
    setIsRejectModalOpen(false);
    setRejectFeedback('');
    toast.info('Đã trả kế hoạch về', 'Creator sẽ thấy các ghi chú của bạn.');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden md:h-[calc(100vh-56px)]">
      <WorkspaceSidebar
        groups={reviewerGroups(projects)}
        selectedProjectId={hasSelection ? activeProjectId : undefined}
        onSelectProject={handleSelectProject}
        onCreateProject={can(PERMISSION.PROJECT_MANAGE) ? () => setIsCreateProjectOpen(true) : undefined}
        navItems={navItems}
        activeNavKey={activeTab}
        onNavSelect={(key) => {
          const newTab = key as ReviewerTab;
          setActiveTab(newTab);
          if (newTab === 'plans') {
            const pending = project.episodes.filter((e) => e.status === 'PLAN_PENDING');
            if (pending.length > 0 && (!currentPackage || currentPackage.status !== 'PLAN_PENDING')) {
              setActivePackage(pending[0].id);
            }
          }
        }}
      />

      <main ref={mainRef} className="flex-1 bg-[#F8FAFC] dark:bg-[#0B0C10] p-4 sm:p-6 lg:p-8 overflow-y-auto transition-colors">
        {!hasSelection || !currentPackage ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-20">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Chọn một phim để xem</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Danh sách phim nằm ở thanh bên trái.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <MilestoneTimeline milestones={project.milestones ?? []} productionStart={project.production_start_date} />

            {(activeTab === 'plans' || activeTab === 'audits') && (
              <EpisodeSwitcher episodes={project.episodes} selectedId={currentPackage.id} onSelect={setActivePackage} />
            )}

            {activeTab === 'overview' && (
              <OverviewTab
                project={project}
                pendingPlanCount={pendingPlanEpisodes.length}
                submittedCount={submittedEpisodes.length}
                onReviewPlan={(episodeId) => {
                  setActivePackage(episodeId);
                  setActiveTab('plans');
                }}
              />
            )}

            {activeTab === 'plans' && (
              <PlanReviewTab currentPackage={currentPackage} onRequestChanges={openRejectModal} onAllocateQuota={openQuotaModal} />
            )}

            {activeTab === 'audits' && <AuditsTab project={project} />}

            {activeTab === 'publication' && <PublicationTab project={project} />}

            {activeTab === 'tokens' && <TokensTab project={project} />}
          </div>
        )}
      </main>

      <AllocateQuotaModal
        open={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onConfirm={handleAllocateQuotaConfirm}
        currentPackage={currentPackage}
        quota={quotaToAllocate}
        availableBudget={availableBudget(project)}
        onQuotaChange={setQuotaToAllocate}
      />

      <RejectPlanModal
        open={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRequestChangesConfirm}
        feedback={rejectFeedback}
        onFeedbackChange={setRejectFeedback}
      />

      <CreateProjectModal
        open={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSubmit={handleCreateProjectSubmit}
        form={createForm}
        maxEpisodeMinutes={maxEpisodeMinutes}
        onChange={(field, value) => setCreateForm((prev) => ({ ...prev, [field]: value }))}
      />
    </div>
  );
}

export default ReviewerWorkspacePage;
