'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { ReviewerSidebar, type ReviewerTab } from './ReviewerSidebar';
import { OverviewTab } from './tabs/OverviewTab';
import { PlanReviewTab } from './tabs/PlanReviewTab';
import { AuditsTab } from './tabs/AuditsTab';
import { ProjectsTab } from './tabs/ProjectsTab';
import { TokensTab } from './tabs/TokensTab';
import { PublicationTab } from './tabs/PublicationTab';
import { AllocateQuotaModal } from './modals/AllocateQuotaModal';
import { RejectPlanModal } from './modals/RejectPlanModal';
import { CreateProjectModal, type CreateProjectFormState } from './modals/CreateProjectModal';
import { toast } from '@/components/ui/Toast';

const TAB_TITLES: Record<ReviewerTab, string> = {
  overview: 'Bảng Điều Khiển Thẩm Định Tổng Thể',
  plans: 'Thẩm Định Kịch Bản & Cấp AI Token Quota',
  audits: 'Kiểm Định Tuân Thủ & Pháp Lý Video',
  publication: 'Lịch Chiếu & Kế Hoạch Xuất Bản OTT',
  projects: 'Cấu Hình & Quản Lý Dự Án',
  tokens: 'Kiểm Soát Ngân Sách AI Tokens',
};

const TAB_BREADCRUMBS: Record<ReviewerTab, string> = {
  overview: 'Tổng Quan',
  plans: 'Duyệt Kế Hoạch',
  audits: 'Kiểm Định Video',
  publication: 'Lịch Chiếu & Xuất Bản',
  projects: 'Quản Lý Dự Án',
  tokens: 'Ngân Sách Tokens',
};

const DEFAULT_FORM: CreateProjectFormState = {
  title: '',
  genre: ['Khoa học viễn tưởng', 'Hành động AI'],
  synopsis: '',
  episodes: 5,
  budgetTokens: 3000,
  deadline: '2026-12-31',
  releaseDate: '2027-01-15',
  milestones: [
    {
      id: 'ms-init-1',
      title: 'Cột mốc 1: Khởi tạo kịch bản & phân cảnh',
      startDate: '2026-09-17',
      deadline: '2026-10-15',
      description: 'Hoàn thành bản kịch bản chi tiết và hệ thống prompt.',
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

export function ReviewerDashboardPage() {
  const { project, activePackageId, setActivePackage, createProject, allocateQuota, requestPlanChanges } = useWorkflowStore();

  const currentPackage = project.episodes.find((e) => e.id === activePackageId) || project.episodes[0];
  const [activeTab, setActiveTab] = useState<ReviewerTab>('overview');

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateProjectFormState>(DEFAULT_FORM);

  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [quotaToAllocate, setQuotaToAllocate] = useState(currentPackage?.quota_allocated || 500);
  const [quotaNotes, setQuotaNotes] = useState('Đạt tiêu chuẩn nội dung. Cấp phép hạn mức Token sản xuất.');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) return;

    createProject({
      title: createForm.title,
      genre: createForm.genre.length > 0 ? createForm.genre : ['Khoa học viễn tưởng'],
      synopsis: createForm.synopsis || 'Dự án điện ảnh ứng dụng công nghệ GenAI thế hệ mới.',
      total_episodes: createForm.episodes,
      total_budget_tokens: createForm.budgetTokens,
      deadline: createForm.deadline,
      planned_release_date: createForm.releaseDate,
      milestones: createForm.milestones,
    });

    setIsCreateProjectOpen(false);
    setCreateForm(DEFAULT_FORM);
    toast.success('Khởi tạo dự án thành công!', 'Dự án sản xuất phim AI mới và các cột mốc tiến độ đã được tạo.');
  };

  const handleAllocateQuotaConfirm = () => {
    if (!currentPackage) return;
    allocateQuota(currentPackage.id, quotaToAllocate, quotaNotes);
    setIsQuotaModalOpen(false);
    toast.success(
      'Đã duyệt & cấp Quota thành công!',
      `Đã phân bổ ${quotaToAllocate} AI Tokens cho Creator (Maker) bắt đầu sản xuất.`
    );
  };

  const handleRequestChangesConfirm = () => {
    if (!currentPackage || !rejectFeedback.trim()) return;
    requestPlanChanges(currentPackage.id, rejectFeedback);
    setIsRejectModalOpen(false);
    setRejectFeedback('');
    toast.info(
      'Đã gửi yêu cầu hiệu chỉnh',
      'Phản hồi chỉnh sửa kịch bản đã được gửi về cho Creator.'
    );
  };

  const pendingPlanEpisodes = project.episodes.filter((e) => e.status === 'PLAN_PENDING');
  const submittedEpisodes = project.episodes.filter((e) => e.status === 'EPISODE_SUBMITTED' || e.status === 'COMPLIANCE_PASSED');

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
      <ReviewerSidebar
        project={project}
        currentPackage={currentPackage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelectEpisode={setActivePackage}
        pendingPlanCount={pendingPlanEpisodes.length}
        submittedCount={submittedEpisodes.length}
        onCreateProject={() => setIsCreateProjectOpen(true)}
      />

      <main className="flex-1 bg-[#F9FAFB] dark:bg-[#0D0E12] p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/reviewer/projects" className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1 transition">
                <ArrowLeft className="w-3.5 h-3.5" /> Tất Cả Dự Án
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{project.title}</span>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{TAB_BREADCRUMBS[activeTab]}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{TAB_TITLES[activeTab]}</h1>
          </div>

          {(activeTab === 'projects' || activeTab === 'overview' || activeTab === 'publication') && (
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tạo Dự Án Mới
            </button>
          )}
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
          <PlanReviewTab
            currentPackage={currentPackage}
            onRequestChanges={() => setIsRejectModalOpen(true)}
            onAllocateQuota={() => setIsQuotaModalOpen(true)}
          />
        )}

        {activeTab === 'audits' && <AuditsTab project={project} />}

        {activeTab === 'publication' && <PublicationTab project={project} />}

        {activeTab === 'projects' && <ProjectsTab project={project} onCreateProject={() => setIsCreateProjectOpen(true)} />}

        {activeTab === 'tokens' && <TokensTab project={project} />}
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
