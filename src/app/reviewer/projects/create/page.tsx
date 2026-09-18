'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductionHeader from '@/components/production/ProductionHeader';
import AllocateQuotaModal from '@/components/production/AllocateQuotaModal';
import RequestChangesModal from '@/components/production/RequestChangesModal';
import { useProductionStore } from '@/store/useProductionStore';
import { ProductionEpisode, AIPolicy, ProjectMilestone } from '@/types/production';
import { mockAIPolicies } from '@/mocks/productionMock';

const PRESET_GENRE_TAGS = [
  'Khoa học viễn tưởng',
  'Hành động AI',
  'Cyberpunk',
  'Kinh dị Tâm lý',
  'Giả tưởng Không gian',
  'Hoạt hình 3D AI',
  'Trinh thám Siêu thực',
  'Xã hội Tương lai',
];

export default function ReviewerProjectCreatePage() {
  const {
    projects,
    activeProjectId,
    getProject,
    createProject,
    approveAndAllocateQuota,
    requestPlanChanges,
    addMilestone,
    removeMilestone,
    setProjectPolicy,
    respondToTokenExtension,
  } = useProductionStore();

  const currentProject = getProject();

  // Create Project Form state
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Khoa học viễn tưởng',
    'Cyberpunk',
    'AI Thriller',
  ]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [totalEpisodes, setTotalEpisodes] = useState(5);
  const [deadline, setDeadline] = useState('2026-12-31');
  const [plannedReleaseDate, setPlannedReleaseDate] = useState('2027-01-15');
  const [totalBudgetTokens, setTotalBudgetTokens] = useState(3000);
  const [selectedPolicy, setSelectedPolicy] = useState<AIPolicy>(mockAIPolicies[0]);

  // Milestone Modal State
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('2026-10-15');
  const [newMilestoneAssignee, setNewMilestoneAssignee] = useState('Creator Team');
  const [newMilestoneDeliverable, setNewMilestoneDeliverable] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');

  // Modal states
  const [selectedEpForQuota, setSelectedEpForQuota] = useState<ProductionEpisode | null>(null);
  const [selectedEpForChanges, setSelectedEpForChanges] = useState<ProductionEpisode | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Tag helper
  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createProject({
      title: title.trim(),
      genre: selectedTags,
      synopsis: synopsis.trim(),
      totalEpisodes,
      deadline,
      plannedReleaseDate,
      totalBudgetTokens,
      creatorName: 'Đạo diễn AI (Creator Team)',
      reviewerName: 'Thẩm định viên Lê Quốc Bảo (Reviewer)',
      appliedPolicy: selectedPolicy,
      milestones: [
        {
          id: `ms-${Date.now()}-1`,
          title: 'Cột mốc 1: Kịch bản & Phân cảnh mẫu',
          description: 'Hoàn thiện kịch bản và phân cảnh cho 5 tập.',
          dueDate: deadline,
          status: 'in_progress',
          assignedTo: 'Đạo diễn AI & Creator Team',
          deliverable: 'Kịch bản tổng quan & Prompt mẫu',
        },
      ],
      episodes: [
        {
          id: `ep-${Date.now()}-1`,
          projectId: '',
          episodeNumber: 1,
          title: 'Tập 1: Khởi Đầu Mới',
          status: 'PLAN_SUBMITTED',
          totalDuration: '45 phút',
          actualTokensUsed: 0,
          videoDraftUrl: '',
          quota: null,
          compliance: null,
          scheduledReleaseDate: plannedReleaseDate,
          draftsCount: 1,
          assigneeName: 'Trần Minh Huy (Creator)',
          scenes: [],
          plan: {
            id: `plan-${Date.now()}-1`,
            projectId: '',
            episodeId: `ep-${Date.now()}-1`,
            overviewScript: 'Kịch bản tổng quan đang chờ Reviewer duyệt...',
            totalScenes: 4,
            targetDuration: '45 phút',
            estimatedTokens: 450,
            storyboardSummary: '4 cảnh chính',
            sceneBreakdown: [],
            feedbackHistory: [],
          },
        },
      ],
    });

    setIsCreatingProject(false);
    setSuccessToast('Đã khởi tạo dự án phim thành công!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleConfirmQuota = (amount: number, notes?: string) => {
    if (!selectedEpForQuota || !currentProject) return;
    approveAndAllocateQuota(currentProject.id, selectedEpForQuota.id, amount, notes);
    setSuccessToast(`Đã cấp thành công ${amount} AI Tokens cho ${selectedEpForQuota.title}!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleConfirmPlanChanges = (feedback: string) => {
    if (!selectedEpForChanges || !currentProject) return;
    requestPlanChanges(currentProject.id, selectedEpForChanges.id, feedback);
    setSuccessToast(`Đã gửi yêu cầu chỉnh sửa kế hoạch cho ${selectedEpForChanges.title}!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !currentProject) return;

    addMilestone(currentProject.id, {
      title: newMilestoneTitle.trim(),
      dueDate: newMilestoneDueDate,
      assignedTo: newMilestoneAssignee.trim(),
      deliverable: newMilestoneDeliverable.trim() || 'Sản phẩm hoàn thiện theo mốc',
      description: newMilestoneDesc.trim() || 'Thực hiện đúng tiến độ quy định',
      status: 'pending',
    });

    setIsAddMilestoneOpen(false);
    setNewMilestoneTitle('');
    setNewMilestoneDeliverable('');
    setNewMilestoneDesc('');
    setSuccessToast('Đã thêm cột mốc mới thành công!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleTokenResponse = (requestId: string, approve: boolean) => {
    if (!currentProject) return;
    respondToTokenExtension(
      currentProject.id,
      requestId,
      approve,
      approve ? 'Reviewer đã chấp thuận bổ sung Token Quota.' : 'Không đồng ý cấp thêm Quota do vượt ngân sách.'
    );
    setSuccessToast(approve ? 'Đã duyệt cấp thêm Token cho Creator!' : 'Đã từ chối đề xuất mở rộng Token.');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Quota & budget calculations for Executive Command Center
  const totalBudget = currentProject?.totalBudgetTokens || 3000;
  const allocatedBudget = currentProject?.allocatedTokens || 0;
  const consumedBudget = currentProject?.consumedTokens || 0;
  const unallocatedBudget = Math.max(0, totalBudget - allocatedBudget);
  const consumedPct = Math.min(100, Math.round((consumedBudget / (totalBudget || 1)) * 100));
  const allocatedRemainingPct = Math.max(0, Math.round(((allocatedBudget - consumedBudget) / (totalBudget || 1)) * 100));
  const unallocatedPct = Math.max(0, 100 - consumedPct - allocatedRemainingPct);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-zinc-100 transition-colors">
      <ProductionHeader
        title="Quản Lý Kế Hoạch & Cấp Quota"
        subtitle="Dành cho Content Reviewer (Checker / Quản lý)"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Toast Notification */}
        {successToast && (
          <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-500/30 flex items-center gap-2 animate-bounce-in">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successToast}</span>
          </div>
        )}

        {/* Top Hero & Project Command Center */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-b from-white via-slate-50/70 to-white dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950/80 backdrop-blur-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/30">
          {/* Top Decorative Shimmer */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ruby via-neon to-coin" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-ruby/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-coin/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-ruby text-white shadow-md shadow-ruby/25">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Reviewer Command Center
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10">
                  <span>⚖️</span>
                  <span>{currentProject?.appliedPolicy?.code || 'LUẬT AI & NĐ 142'}</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Quy trình Phân Quyền Thẩm Định Maker - Checker
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {currentProject?.title}
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
                  {currentProject?.synopsis}
                </p>
              </div>

              {/* Genre & Metadata Pills */}
              {currentProject?.genre && currentProject.genre.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {currentProject.genre.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-200/70 dark:bg-white/5 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/5"
                    >
                      #{g}
                    </span>
                  ))}
                  <span className="text-xs text-slate-400 dark:text-zinc-500 ml-2">
                    Tổng: <strong className="text-slate-700 dark:text-zinc-300">{currentProject.totalEpisodes || 5} tập phim</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setIsCreatingProject(!isCreatingProject)}
                className="px-5 py-2.5 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-ruby to-ruby-dark hover:shadow-lg hover:shadow-ruby/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCreatingProject ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                </svg>
                <span>{isCreatingProject ? 'Đóng Form Dự Án' : 'Khởi Tạo Dự Án Mới'}</span>
              </button>
            </div>
          </div>

          {/* Project Budget & Quota Command Cards */}
          {currentProject && (
            <div className="relative z-10 mt-8 pt-6 border-t border-slate-200/80 dark:border-white/10 space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Tổng Ngân Sách */}
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Tổng Hạn Ngạch Dự Án</span>
                    <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-zinc-300">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                    {totalBudget.toLocaleString()} <span className="text-xs font-sans font-semibold text-slate-500 dark:text-zinc-400">Tokens</span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-500">
                    Ngân sách tối đa toàn bộ phim
                  </p>
                </div>

                {/* 2. Đã Phân Bổ (Allocated) */}
                <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/35 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Đã Phân Bổ (Allocated)</span>
                    <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-xl sm:text-2xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400">
                    {allocatedBudget.toLocaleString()} <span className="text-xs font-sans font-semibold text-amber-600/70 dark:text-amber-400/70">Tokens</span>
                  </p>
                  <p className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-400/80">
                    {Math.round((allocatedBudget / (totalBudget || 1)) * 100)}% tổng ngân sách đã cấp
                  </p>
                </div>

                {/* 3. Thực Tế Đã Dùng (Consumed) */}
                <div className="p-4 rounded-2xl bg-sky-500/5 dark:bg-neon/10 border border-sky-500/20 dark:border-neon/30 hover:border-sky-500/40 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-sky-700 dark:text-neon">Thực Tế Đã Render</span>
                    <div className="w-7 h-7 rounded-xl bg-sky-500/20 dark:bg-neon/20 text-sky-600 dark:text-neon flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-xl sm:text-2xl font-black font-mono tracking-tight text-sky-600 dark:text-neon">
                    {consumedBudget.toLocaleString()} <span className="text-xs font-sans font-semibold text-sky-600/70 dark:text-neon/70">Tokens</span>
                  </p>
                  <p className="mt-1 text-[11px] text-sky-700/80 dark:text-zinc-400">
                    {consumedPct}% đã tiêu hao cho các tập
                  </p>
                </div>

                {/* 4. Hạn Chót (Deadline) */}
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Hạn Chót Toàn Dự Án</span>
                    <div className="w-7 h-7 rounded-xl bg-ruby/10 text-ruby flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                    {currentProject.deadline}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-500">
                    Phát hành: {currentProject.plannedReleaseDate || '2027-01-15'}
                  </p>
                </div>
              </div>

              {/* Segmented Token Utilization Progress Meter */}
              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <span>Thanh Đo Lường Phân Bổ Hạn Ngạch (Quota Utilization)</span>
                  </span>
                  <span className="font-mono text-slate-500 dark:text-zinc-400 text-[11px]">
                    Còn khả dụng: <strong className="text-emerald-600 dark:text-emerald-400">{unallocatedBudget.toLocaleString()} Tokens</strong>
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden flex p-0.5 gap-0.5">
                  <div
                    style={{ width: `${consumedPct}%` }}
                    className="h-full rounded-l-full bg-gradient-to-r from-sky-500 to-neon transition-all duration-500"
                    title={`Thực tế đã dùng: ${consumedBudget} Tokens (${consumedPct}%)`}
                  />
                  <div
                    style={{ width: `${allocatedRemainingPct}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                    title={`Đã cấp nhưng chưa dùng hết: ${allocatedBudget - consumedBudget} Tokens (${allocatedRemainingPct}%)`}
                  />
                  <div
                    style={{ width: `${unallocatedPct}%` }}
                    className="h-full rounded-r-full bg-slate-300 dark:bg-white/15 transition-all duration-500"
                    title={`Dự phòng chưa phân bổ: ${unallocatedBudget} Tokens (${unallocatedPct}%)`}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-zinc-400 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 dark:bg-neon" />
                    <span>Đã dùng: <strong>{consumedBudget} ({consumedPct}%)</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Đã cấp chưa dùng: <strong>{allocatedBudget - consumedBudget} ({allocatedRemainingPct}%)</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/20" />
                    <span>Dự trữ chưa phân bổ: <strong>{unallocatedBudget} ({unallocatedPct}%)</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 1: Create Project Form (Collapsible) */}
        {isCreatingProject && (
          <div className="glass-card p-6 sm:p-7 border border-ruby/30 animate-scale-in">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-ruby" />
              <span>Form Khởi Tạo Dự Án Phim AI Mới</span>
            </h2>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Tên Dự Án Phim
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Kỷ Nguyên Siêu Trí Tuệ 2088..."
                    className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-ruby transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Thể Loại Phim (Dạng Tag)
                  </label>
                  {/* Selected Tags Display */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-ruby/15 text-ruby border border-ruby/30"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className="hover:text-white hover:bg-ruby rounded-full w-3.5 h-3.5 flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Preset Tags Suggestions */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {PRESET_GENRE_TAGS.map((preset) => {
                      const isSelected = selectedTags.includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleToggleTag(preset)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                            isSelected
                              ? 'bg-ruby text-white font-bold'
                              : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-zinc-300 hover:bg-slate-300 dark:hover:bg-white/15'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {preset}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Tag Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                      placeholder="Nhập tag tùy chỉnh..."
                      className="flex-1 bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-white"
                    >
                      Thêm Tag
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Policy Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Quy Định AI Áp Dụng (AI Policy)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {mockAIPolicies.map((pol) => {
                    const isSelected = selectedPolicy.id === pol.id;
                    return (
                      <div
                        key={pol.id}
                        onClick={() => setSelectedPolicy(pol)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-ruby bg-ruby/5 dark:bg-ruby/10 shadow-sm'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] font-bold text-ruby">
                            {pol.code}
                          </span>
                          {isSelected && <span className="text-xs text-ruby font-bold">✓ Áp dụng</span>}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                          {pol.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                          {pol.description}
                        </p>
                        <div className="mt-2 text-[10px] text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                          <span>Điểm tối thiểu: {pol.minModerationScore}%</span>
                          <span>•</span>
                          <span>Watermark: {pol.watermarkRequired ? 'Bắt buộc' : 'Không'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Tóm Tắt Cốt Truyện (Synopsis)
                </label>
                <textarea
                  rows={3}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Mô tả bối cảnh, mâu thuẫn trung tâm và thông điệp bộ phim..."
                  className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-ruby transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Số Tập Dự Kiến
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={totalEpisodes}
                    onChange={(e) => setTotalEpisodes(Number(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Tổng Token Hạn Ngạch
                  </label>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={totalBudgetTokens}
                    onChange={(e) => setTotalBudgetTokens(Number(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-bold font-mono text-amber-600 dark:text-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Hạn Chót Sản Xuất
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Ngày Phát Hành Dự Kiến
                  </label>
                  <input
                    type="date"
                    value={plannedReleaseDate}
                    onChange={(e) => setPlannedReleaseDate(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-ruby hover:bg-ruby-dark shadow-md shadow-ruby/30 transition-all cursor-pointer"
                >
                  Lưu & Khởi Tạo Dự Án
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Token Extension Requests Studio Memo */}
        {currentProject?.tokenExtensionRequests && currentProject.tokenExtensionRequests.some((r) => r.status === 'pending') && (
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/5 dark:from-amber-500/15 dark:via-slate-900/60 dark:to-slate-900/90 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-amber-500/5 space-y-4">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600" />
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                </span>
                <span className="uppercase tracking-wider text-xs font-black">Yêu Cầu Đề Xuất Cấp Thêm Token Quota Từ Creator</span>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Đang chờ phê duyệt
              </span>
            </div>

            {currentProject.tokenExtensionRequests.filter((r) => r.status === 'pending').map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-amber-500/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black font-mono bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/30">
                      +{req.requestedTokens} Tokens
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {req.episodeTitle}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/20" />
                      Gửi bởi: <strong className="text-slate-700 dark:text-zinc-300">{req.requestedBy}</strong>
                      <span>•</span>
                      <span>{new Date(req.requestedAt).toLocaleDateString('vi-VN')}</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 text-xs text-slate-700 dark:text-zinc-300 italic flex items-start gap-2">
                    <span className="text-amber-500 font-serif text-lg leading-none">“</span>
                    <span className="leading-relaxed">{req.reason}</span>
                    <span className="text-amber-500 font-serif text-lg leading-none">”</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleTokenResponse(req.id, false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 transition-all cursor-pointer"
                  >
                    ✕ Từ chối
                  </button>
                  <button
                    onClick={() => handleTokenResponse(req.id, true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Phê Duyệt (+{req.requestedTokens} Tokens)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section: Cột Mốc Dự Án (Project Milestones Pipeline) */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-ruby/10 text-ruby flex items-center justify-center font-bold text-sm">
                  🚩
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Lộ Trình Cột Mốc & Tiến Độ Dự Án (Milestones Pipeline)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10">
                  {currentProject?.milestones?.length || 0} cột mốc
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 pl-10">
                Kiểm soát tiến độ sản xuất phim AI, người chịu trách nhiệm và tiêu chuẩn nghiệm thu từng giai đoạn
              </p>
            </div>

            <button
              onClick={() => setIsAddMilestoneOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-ruby to-ruby-dark hover:shadow-lg hover:shadow-ruby/30 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Thêm Cột Mốc</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentProject?.milestones?.map((ms, idx) => {
              const isDone = ms.status === 'completed';
              const isInProgress = ms.status === 'in_progress';
              return (
                <div
                  key={ms.id}
                  className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                    isDone
                      ? 'bg-emerald-500/[0.04] border-emerald-500/30 hover:border-emerald-500/50 shadow-sm'
                      : isInProgress
                      ? 'bg-amber-500/[0.05] border-amber-500/40 hover:border-amber-500/60 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-slate-50/70 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Step Number & Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                            : isInProgress
                            ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-zinc-400'
                        }`}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
                          Giai đoạn {idx + 1}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                          isDone
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : isInProgress
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-slate-200/70 dark:bg-white/10 text-slate-500 dark:text-zinc-400'
                        }`}
                      >
                        {isDone ? '✓ Hoàn thành' : isInProgress ? '⚡ Đang làm' : '⏳ Chờ đến'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                        {ms.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {ms.description}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                      <span className="text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Phụ trách:
                      </span>
                      <strong className="truncate max-w-[130px] font-semibold text-slate-800 dark:text-zinc-200">
                        {ms.assignedTo}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Hạn chót:
                      </span>
                      <strong className={`font-mono text-xs ${
                        isInProgress
                          ? 'text-amber-600 dark:text-amber-400 font-bold'
                          : isDone
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-700 dark:text-zinc-300'
                      }`}>
                        {ms.dueDate}
                      </strong>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[10px] text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 truncate">
                      <span>📦</span>
                      <span className="truncate font-medium">{ms.deliverable}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Bảng Chính Mô Tả Kế Hoạch Dự Án (Master Project Plan Table) */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-neon flex items-center justify-center font-bold text-sm">
                  📑
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Bảng Kế Hoạch Dự Án Phim Tổng Thể (Master Project Plan)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 pl-10">
                Khống chế số bản draft, token hạn mức, người phụ trách, độ dài tối đa và cột mốc cho từng tập phim
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4 font-bold">Tập</th>
                  <th className="py-3.5 px-4 font-bold">Tiêu Đề Tập Phim</th>
                  <th className="py-3.5 px-4 font-bold">Người Phụ Trách</th>
                  <th className="py-3.5 px-4 font-bold text-center">Bản Draft</th>
                  <th className="py-3.5 px-4 font-bold min-w-[200px]">Khống Chế Token Quota</th>
                  <th className="py-3.5 px-4 font-bold">Độ Dài Tối Đa</th>
                  <th className="py-3.5 px-4 font-bold">Trạng Thái Kế Hoạch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {currentProject?.episodes.map((ep) => {
                  const quotaVal = ep.quota?.allocatedTokens || ep.plan?.estimatedTokens || 450;
                  const isQuotaExceeded = ep.actualTokensUsed > quotaVal;
                  const usagePct = Math.min(100, Math.round((ep.actualTokensUsed / (quotaVal || 1)) * 100));
                  return (
                    <tr key={ep.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-bold font-mono text-slate-900 dark:text-white">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10 inline-flex items-center justify-center text-xs">
                          {ep.episodeNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {ep.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-300">
                        {ep.assigneeName || 'Đạo diễn AI Trần Minh Huy'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-zinc-300 font-bold text-[11px]">
                          v1.{(ep.submissions?.length || 0) + 1}.0 ({ep.draftsCount || 1} bản)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={`font-mono font-bold ${isQuotaExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {ep.actualTokensUsed} / {quotaVal} Tokens
                            </span>
                            {isQuotaExceeded ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                Vượt trần
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                                {usagePct}%
                              </span>
                            )}
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                            <div
                              style={{ width: `${usagePct}%` }}
                              className={`h-full rounded-full transition-all ${
                                isQuotaExceeded
                                  ? 'bg-rose-500'
                                  : usagePct > 80
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-300 font-medium">
                        {ep.plan?.targetDuration || ep.totalDuration || '45 phút'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10">
                          {ep.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Kế Hoạch Phát Hành Công Khai (Public Release Schedule) */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                  🗓️
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Kế Hoạch Phát Sóng Công Khai (Public Premiere Schedule)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 pl-10">
                Quản lý lịch phát sóng định kỳ, đặc quyền xem sớm 24h cho hội viên VIP
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {currentProject?.episodes.map((ep, idx) => {
              const releaseDate = ep.scheduledReleaseDate || `2027-01-${15 + idx * 7}`;
              const isLive = ep.status === 'PUBLISHED';
              return (
                <div
                  key={ep.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                    isLive
                      ? 'bg-emerald-500/[0.07] border-emerald-500/40 shadow-sm'
                      : 'bg-slate-50/70 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-slate-400 dark:text-zinc-500">
                        TẬP {ep.episodeNumber}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        ⭐ VIP -24h
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {ep.title}
                    </h5>
                  </div>

                  <div className="space-y-1 text-[11px] pt-2 border-t border-slate-200/80 dark:border-white/10">
                    <p className="text-slate-400 dark:text-zinc-500 text-[10px]">Lịch công chiếu:</p>
                    <p className="font-mono font-bold text-xs text-ruby">{releaseDate}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 text-[10px] font-bold">
                    {isLive ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Đang công chiếu
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                        <span>⏳</span>
                        <span>Đã lên lịch</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Review Production Plans List (Maker-Checker Hub) */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-ruby/10 text-ruby flex items-center justify-center font-bold text-sm">
                  🎬
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Danh Sách Kế Hoạch & Tập Phim Cần Thẩm Định</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-zinc-300">
                    {currentProject?.episodes.length || 0} tập
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 pl-10">
                Thẩm định kịch bản, cấp hạn ngạch Token Quota hoặc xem bản dựng do Creator gửi lên theo chu trình Maker-Checker
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currentProject?.episodes.map((ep) => {
              const isPlanSubmitted = ep.status === 'PLAN_SUBMITTED';
              const isPlanRejected = ep.status === 'PLAN_REJECTED';
              const isQuotaAllocated = ep.status === 'QUOTA_ALLOCATED' || ep.status === 'PRODUCING';
              const isContentSubmitted = ep.status === 'CONTENT_SUBMITTED';
              const isContentRejected = ep.status === 'CONTENT_REJECTED';
              const isCompliancePending = ep.status === 'COMPLIANCE_PENDING';
              const isPublished = ep.status === 'PUBLISHED';

              return (
                <div
                  key={ep.id}
                  className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition-all backdrop-blur-xl shadow-lg shadow-slate-900/5 ${
                    isPlanSubmitted
                      ? 'border-amber-500/40 bg-amber-500/[0.04] ring-1 ring-amber-500/20'
                      : isContentSubmitted
                      ? 'border-ruby/40 bg-ruby/[0.04] ring-1 ring-ruby/20'
                      : isPublished
                      ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
                      : 'border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/70'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Episode Info */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs flex items-center justify-center font-mono">
                          {ep.episodeNumber}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {ep.title}
                        </h3>

                        {/* State Badges */}
                        <span
                          className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                            isPublished
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : isContentSubmitted
                              ? 'bg-ruby/15 text-ruby border border-ruby/30'
                              : isPlanSubmitted
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : isQuotaAllocated
                              ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                              : isPlanRejected || isContentRejected
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          {ep.status}
                        </span>
                      </div>

                      {/* Script overview */}
                      <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed max-w-4xl">
                        {ep.plan?.overviewScript || 'Chưa có mô tả kịch bản.'}
                      </p>

                      {/* Specs pills */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                        <span className="inline-flex items-center gap-1">
                          <span>⏱️</span>
                          <span>Thời lượng: <strong className="text-slate-700 dark:text-zinc-300">{ep.plan?.targetDuration || ep.totalDuration}</strong></span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <span>🎬</span>
                          <span>Số cảnh: <strong className="text-slate-700 dark:text-zinc-300">{ep.plan?.totalScenes || ep.scenes.length} Scenes</strong></span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <span>🪙</span>
                          <span>
                            Dự trù Token: <strong className="text-amber-600 dark:text-amber-400 font-mono">{ep.plan?.estimatedTokens || 0} Tokens</strong>
                          </span>
                        </span>
                        {ep.quota && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <span>✅</span>
                              <span>Quota được cấp: <strong className="font-mono">{ep.quota.allocatedTokens} Tokens</strong></span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions Hub (Maker-Checker Buttons) */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      {/* 1. If Plan is Submitted -> Reviewer can Request Changes OR Allocate Quota */}
                      {isPlanSubmitted && (
                        <>
                          <button
                            onClick={() => setSelectedEpForChanges(ep)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
                          >
                            Yêu Cầu Chỉnh Sửa
                          </button>
                          <button
                            onClick={() => setSelectedEpForQuota(ep)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Duyệt & Cấp AI Quota</span>
                          </button>
                        </>
                      )}

                      {/* 2. If Content is Submitted -> Reviewer goes to Split-view Thẩm Định */}
                      {isContentSubmitted && (
                        <Link
                          href={`/reviewer/episodes/${ep.id}/review`}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-ruby to-ruby-dark hover:shadow-lg hover:shadow-ruby/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Thẩm Định Bản Dựng (Split-view)</span>
                        </Link>
                      )}

                      {/* 3. If Quota is Allocated -> View status or Link to studio */}
                      {isQuotaAllocated && (
                        <Link
                          href={`/creator/episodes/${ep.id}/studio`}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition-all"
                        >
                          Xem AI Studio
                        </Link>
                      )}

                      {/* 4. If Published -> View on Catalog */}
                      {isPublished && (
                        <Link
                          href="/watch/1"
                          className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                        >
                          Đang Công Chiếu (Xem Phim)
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedEpForQuota && currentProject && (
        <AllocateQuotaModal
          isOpen={!!selectedEpForQuota}
          onClose={() => setSelectedEpForQuota(null)}
          episode={selectedEpForQuota}
          project={currentProject}
          onConfirm={handleConfirmQuota}
        />
      )}

      {selectedEpForChanges && (
        <RequestChangesModal
          isOpen={!!selectedEpForChanges}
          onClose={() => setSelectedEpForChanges(null)}
          type="plan"
          targetTitle={selectedEpForChanges.title}
          onConfirm={handleConfirmPlanChanges}
        />
      )}

      {/* Add Milestone Modal */}
      {isAddMilestoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-card p-6 border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚩</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Thêm Cột Mốc Tiến Độ Mới
                </h3>
              </div>
              <button
                onClick={() => setIsAddMilestoneOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Tên Cột Mốc <span className="text-ruby">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cột mốc 3: Hoàn thiện kỹ xảo AI & Âm thanh"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Hạn Chót (Due Date) <span className="text-ruby">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Người Chịu Trách Nhiệm
                  </label>
                  <input
                    type="text"
                    value={newMilestoneAssignee}
                    onChange={(e) => setNewMilestoneAssignee(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Sản Phẩm Đầu Ra / Nghiệm Thu (Deliverable)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 5 cảnh video 4K, bản âm thanh Dolby 5.1"
                  value={newMilestoneDeliverable}
                  onChange={(e) => setNewMilestoneDeliverable(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Mô Tả & Yêu Cầu Cần Đạt
                </label>
                <textarea
                  rows={2}
                  placeholder="Chi tiết công việc và tiêu chí thẩm định chất lượng theo mốc..."
                  value={newMilestoneDesc}
                  onChange={(e) => setNewMilestoneDesc(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddMilestoneOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-ruby hover:bg-ruby-dark shadow-md shadow-ruby/30 transition-all cursor-pointer"
                >
                  Lưu Cột Mốc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
