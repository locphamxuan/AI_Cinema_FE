'use client';

import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, ClipboardCheck, ShieldCheck, Zap, Film, Tv } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { WorkspaceSidebar, type SidebarNavItem } from '../shared/WorkspaceSidebar';
import { EpisodeSwitcher } from '../shared/EpisodeSwitcher';
import { reviewerGroups } from '@/features/workflow/lib/projectGroups';
import { availableBudget, summarizeFlaggedFields } from '@/features/workflow/lib/planVerdict';
import { OverviewTab } from './tabs/OverviewTab';
import { PlanReviewTab } from './tabs/PlanReviewTab';
import { AuditsTab } from './tabs/AuditsTab';
import { TokensTab } from './tabs/TokensTab';
import { PublicationTab } from './tabs/PublicationTab';
import { AllocateQuotaModal } from './modals/AllocateQuotaModal';
import { RejectPlanModal } from './modals/RejectPlanModal';
import { CreateProjectModal, type CreateProjectFormState } from './modals/CreateProjectModal';
import { toast } from '@/components/ui/Toast';

type ReviewerTab = 'overview' | 'plans' | 'audits' | 'publication' | 'tokens';

const DEFAULT_FORM: CreateProjectFormState = {
  title: '',
  assignedCreator: '',
  genre: [],
  synopsis: '',
  seasonCount: 1,
  episodesPerSeason: 5,
  episodeDurations: [30, 30, 30, 30, 30],
  budgetTokens: 3000,
  productionStartDate: '2026-09-17',
  deadline: '2026-12-31',
  releaseDate: '2027-01-15',
  milestones: [
    {
      id: 'ms-init-1',
      title: 'Cột mốc 1: Khởi tạo kịch bản & phân cảnh',
      startDate: '2026-09-17',
      deadline: '2026-10-15',
      description: 'Hoàn thành bản kịch bản chi tiết và danh sách cảnh phim.',
      status: 'in_progress',
    },
    {
      id: 'ms-init-2',
      title: 'Cột mốc 2: Sản xuất AI Video & Nộp duyệt',
      startDate: '2026-10-16',
      deadline: '2026-11-15',
      description: 'Render clip 4K và gửi Thẩm định viên kiểm định.',
      status: 'pending',
    },
  ],
};

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
  } = useWorkflowStore();

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
  const [createForm, setCreateForm] = useState<CreateProjectFormState>(DEFAULT_FORM);

  const hasSelection = projects.some((p) => p.id === activeProjectId);
  const currentPackage = hasSelection ? project.episodes.find((e) => e.id === activePackageId) || project.episodes[0] : undefined;

  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [quotaToAllocate, setQuotaToAllocate] = useState(currentPackage?.quota_allocated || 500);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const pendingPlanEpisodes = hasSelection ? project.episodes.filter((e) => e.status === 'PLAN_PENDING') : [];
  const submittedEpisodes = hasSelection
    ? project.episodes.filter((e) => e.status === 'EPISODE_SUBMITTED' || e.status === 'COMPLIANCE_PASSED')
    : [];
  const publishReadyEpisodes = hasSelection ? project.episodes.filter((e) => e.status === 'COMPLIANCE_PASSED') : [];

  const navItems: SidebarNavItem[] = [
    { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { key: 'plans', label: 'Duyệt kế hoạch', icon: ClipboardCheck, badge: pendingPlanEpisodes.length || undefined },
    { key: 'audits', label: 'Kiểm định', icon: ShieldCheck },
    { key: 'publication', label: 'Xuất bản', icon: Tv, badge: publishReadyEpisodes.length || undefined },
    { key: 'tokens', label: 'Token', icon: Zap },
  ];

  const handleSelectProject = (projectId: string) => {
    setActiveProject(projectId);
    setActiveTab('overview');
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.assignedCreator) return;

    const created = await createProject({
      title: createForm.title,
      creator_id: createForm.assignedCreator,
      genre_ids: createForm.genre,
      synopsis: createForm.synopsis,
      total_episodes: createForm.seasonCount * createForm.episodesPerSeason,
      // The backend keeps one duration cap per project, so the longest episode sets it.
      episode_duration_minutes: Math.max(...createForm.episodeDurations),
      total_budget_tokens: createForm.budgetTokens,
      production_start_date: createForm.productionStartDate,
      deadline: createForm.deadline,
      planned_release_date: createForm.releaseDate,
      milestones: createForm.milestones,
    });
    if (!created) return;

    setIsCreateProjectOpen(false);
    setCreateForm(DEFAULT_FORM);
    setActiveTab('overview');
  };

  const openRejectModal = () => {
    if (currentPackage) setRejectFeedback(summarizeFlaggedFields(project, currentPackage.brief));
    setIsRejectModalOpen(true);
  };

  const openQuotaModal = () => {
    if (!currentPackage) return;
    const estimate = currentPackage.brief?.estimated_tokens || 400;
    const avail = availableBudget(project);
    const maxAvail = avail + (currentPackage.quota_allocated || 0);
    const initialQuota = currentPackage.quota_allocated > 0
      ? currentPackage.quota_allocated
      : Math.min(estimate, Math.max(50, maxAvail));
    setQuotaToAllocate(initialQuota);
    setIsQuotaModalOpen(true);
  };

  const handleAllocateQuotaConfirm = async () => {
    if (!currentPackage) return;
    if (!(await allocateQuota(currentPackage.id, quotaToAllocate))) return;
    setIsQuotaModalOpen(false);
    toast.success(
      'Duyệt kế hoạch thành công!',
      `Đã duyệt và cấp ${quotaToAllocate.toLocaleString()} token cho ${currentPackage.title}.`
    );
  };

  const handleRequestChangesConfirm = async () => {
    if (!currentPackage || !rejectFeedback.trim()) return;
    if (!(await requestPlanChanges(currentPackage.id, rejectFeedback))) return;
    setIsRejectModalOpen(false);
    setRejectFeedback('');
    toast.info('Đã trả về bản kế hoạch', 'Yêu cầu chỉnh sửa đã được gửi đến Creator.');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden md:h-[calc(100vh-56px)]">
      <WorkspaceSidebar
        groups={reviewerGroups(projects)}
        selectedProjectId={hasSelection ? activeProjectId : undefined}
        onSelectProject={handleSelectProject}
        onCreateProject={() => setIsCreateProjectOpen(true)}
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
        onChange={(field, value) => setCreateForm((prev) => ({ ...prev, [field]: value }))}
      />
    </div>
  );
}

export default ReviewerWorkspacePage;
