'use client';

import { useState } from 'react';
import { LayoutDashboard, ClipboardCheck, ShieldCheck, Zap, Film } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { WorkspaceSidebar } from '../shared/WorkspaceSidebar';
import { OverviewTab } from './tabs/OverviewTab';
import { PlanReviewTab } from './tabs/PlanReviewTab';
import { AuditsTab } from './tabs/AuditsTab';
import { TokensTab } from './tabs/TokensTab';
import { AllocateQuotaModal } from './modals/AllocateQuotaModal';
import { RejectPlanModal } from './modals/RejectPlanModal';
import { CreateProjectModal, type CreateProjectFormState } from './modals/CreateProjectModal';

type ReviewerTab = 'overview' | 'plans' | 'audits' | 'tokens';

const TABS: { key: ReviewerTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { key: 'plans', label: 'Duyệt kế hoạch', icon: ClipboardCheck },
  { key: 'audits', label: 'Kiểm định & pháp lý', icon: ShieldCheck },
  { key: 'tokens', label: 'Ngân sách token', icon: Zap },
];

const DEFAULT_FORM: CreateProjectFormState = {
  title: '',
  genre: ['Khoa học viễn tưởng', 'Hành động AI'],
  synopsis: '',
  seasonCount: 1,
  episodesPerSeason: 5,
  targetDurationMinutes: 30,
  budgetTokens: 3000,
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
 * Reviewer's entry point after login: same left-sidebar shell as Creator's
 * workspace (assigned / completed film lists), with a review-focused tab
 * strip on the right once a film is selected.
 */
export function ReviewerWorkspacePage() {
  const { projects, activeProjectId, setActiveProject, project, activePackageId, setActivePackage, createProject, allocateQuota, requestPlanChanges } = useWorkflowStore();

  const [activeTab, setActiveTab] = useState<ReviewerTab>('overview');

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateProjectFormState>(DEFAULT_FORM);

  const hasSelection = projects.some((p) => p.id === activeProjectId);
  const currentPackage = hasSelection ? project.episodes.find((e) => e.id === activePackageId) || project.episodes[0] : undefined;

  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [quotaToAllocate, setQuotaToAllocate] = useState(currentPackage?.quota_allocated || 500);
  const [quotaNotes, setQuotaNotes] = useState('Đạt tiêu chuẩn nội dung. Cấp phép hạn mức Token sản xuất.');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const handleSelectProject = (projectId: string) => {
    setActiveProject(projectId);
    setActiveTab('overview');
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) return;

    createProject({
      title: createForm.title,
      genre: createForm.genre.length > 0 ? createForm.genre : ['Khoa học viễn tưởng'],
      synopsis: createForm.synopsis || 'Dự án điện ảnh ứng dụng công nghệ GenAI thế hệ mới.',
      season_count: createForm.seasonCount,
      episodes_per_season: createForm.episodesPerSeason,
      target_duration_per_episode_minutes: createForm.targetDurationMinutes,
      total_budget_tokens: createForm.budgetTokens,
      deadline: createForm.deadline,
      planned_release_date: createForm.releaseDate,
      milestones: createForm.milestones,
    });

    setIsCreateProjectOpen(false);
    setCreateForm(DEFAULT_FORM);
    setActiveTab('overview');
  };

  const handleAllocateQuotaConfirm = () => {
    if (!currentPackage) return;
    allocateQuota(currentPackage.id, quotaToAllocate, quotaNotes);
    setIsQuotaModalOpen(false);
  };

  const handleRequestChangesConfirm = () => {
    if (!currentPackage || !rejectFeedback.trim()) return;
    requestPlanChanges(currentPackage.id, rejectFeedback);
    setIsRejectModalOpen(false);
    setRejectFeedback('');
  };

  const pendingPlanEpisodes = hasSelection ? project.episodes.filter((e) => e.status === 'PLAN_PENDING') : [];
  const submittedEpisodes = hasSelection
    ? project.episodes.filter((e) => e.status === 'EPISODE_SUBMITTED' || e.status === 'COMPLIANCE_PASSED')
    : [];

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
      <WorkspaceSidebar
        title="Không gian thẩm định"
        projects={projects}
        selectedProjectId={hasSelection ? activeProjectId : undefined}
        onSelectProject={handleSelectProject}
        onCreateProject={() => setIsCreateProjectOpen(true)}
      />

      <main className="flex-1 bg-[#F8FAFC] dark:bg-[#0B0C10] p-4 sm:p-6 lg:p-8 overflow-y-auto transition-colors">
        {!hasSelection || !currentPackage ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-20">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Chọn một phim để thẩm định</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Danh sách phim được giao nằm ở thanh bên trái.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Trung tâm thẩm định</p>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{project.title}</h1>
              </div>
            </div>

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
                  {key === 'plans' && pendingPlanEpisodes.length > 0 && (
                    <span className="px-1.5 py-0 rounded-full bg-amber-500 text-white text-[10px] font-bold">{pendingPlanEpisodes.length}</span>
                  )}
                </button>
              ))}
            </div>

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
              <PlanReviewTab currentPackage={currentPackage} onRequestChanges={() => setIsRejectModalOpen(true)} onAllocateQuota={() => setIsQuotaModalOpen(true)} />
            )}

            {activeTab === 'audits' && <AuditsTab project={project} />}

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
        onQuotaChange={setQuotaToAllocate}
        notes={quotaNotes}
        onNotesChange={setQuotaNotes}
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
