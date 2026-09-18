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

        {/* Top Hero & Project Banner */}
        <div className="glass-card p-6 sm:p-8 relative overflow-hidden border border-slate-200 dark:border-white/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ruby via-neon to-coin" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-ruby text-white uppercase tracking-wider">
                  Reviewer Dashboard
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Quy trình Phân Quyền Maker - Checker
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {currentProject?.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
                {currentProject?.synopsis}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsCreatingProject(!isCreatingProject)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-ruby to-ruby-dark hover:shadow-lg hover:shadow-ruby/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{isCreatingProject ? 'Đóng Form Dự Án' : 'Khởi Tạo Dự Án Mới'}</span>
              </button>
            </div>
          </div>

          {/* Project Budget Statistics Bar */}
          {currentProject && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-white/10 text-xs">
              <div>
                <p className="text-slate-500 dark:text-zinc-400">Tổng Ngân Sách</p>
                <p className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white">
                  {currentProject.totalBudgetTokens.toLocaleString()} Tokens
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-zinc-400">Đã Phân Bổ (Allocated)</p>
                <p className="text-base sm:text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                  {currentProject.allocatedTokens.toLocaleString()} Tokens
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-zinc-400">Thực Tế Đã Dùng</p>
                <p className="text-base sm:text-lg font-black font-mono text-neon">
                  {currentProject.consumedTokens.toLocaleString()} Tokens
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-zinc-400">Hạn Chót (Deadline)</p>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {currentProject.deadline}
                </p>
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

        {/* Token Extension Requests Banner (When Creator requests more tokens) */}
        {currentProject?.tokenExtensionRequests && currentProject.tokenExtensionRequests.some((r) => r.status === 'pending') && (
          <div className="glass-card p-5 border-2 border-amber-500/50 bg-amber-500/10 glow-coin animate-pulse space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <span className="text-xl">⚠️</span>
              <span>Có Yêu Cầu Đề Xuất Mở Rộng Token Quota Từ Creator</span>
            </div>
            {currentProject.tokenExtensionRequests.filter((r) => r.status === 'pending').map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">
                      Xin +{req.requestedTokens} Tokens
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {req.episodeTitle}
                    </h4>
                    <span className="text-xs text-slate-400">
                      bởi {req.requestedBy} • {new Date(req.requestedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 italic">
                    &quot;{req.reason}&quot;
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTokenResponse(req.id, false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-danger bg-danger/10 hover:bg-danger/20 border border-danger/30 transition-all cursor-pointer"
                  >
                    ✕ Từ chối
                  </button>
                  <button
                    onClick={() => handleTokenResponse(req.id, true)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>✓</span>
                    <span>Phê Duyệt (+{req.requestedTokens} Tokens)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section: Cột Mốc Dự Án (Project Milestones Tracker) */}
        <div className="glass-card p-6 border border-slate-200 dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🚩</span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Cột Mốc & Tiến Độ Dự Án (Project Milestones)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-zinc-300">
                  {currentProject?.milestones?.length || 0} cột mốc
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Các mốc thời gian kiểm soát tiến độ sản xuất phim AI, người chịu trách nhiệm và sản phẩm nghiệm thu
              </p>
            </div>

            <button
              onClick={() => setIsAddMilestoneOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-ruby hover:bg-ruby-dark shadow-md shadow-ruby/30 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>+</span>
              <span>Thêm Cột Mốc</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentProject?.milestones?.map((ms, idx) => {
              const isDone = ms.status === 'completed';
              const isInProgress = ms.status === 'in_progress';
              return (
                <div
                  key={ms.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                    isDone
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : isInProgress
                      ? 'bg-amber-500/5 border-amber-500/40 shadow-sm'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Mốc #{idx + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isDone
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : isInProgress
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                        }`}
                      >
                        {isDone ? '✓ Hoàn thành' : isInProgress ? '⏳ Đang làm' : 'Chờ thực hiện'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                      {ms.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                      {ms.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                      <span>Phụ trách:</span>
                      <strong className="truncate max-w-[120px]">{ms.assignedTo}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                      <span>Hạn chót:</span>
                      <strong className="font-mono text-ruby">{ms.dueDate}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                      📦 {ms.deliverable}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Bảng Chính Mô Tả Kế Hoạch Dự Án (Master Project Plan Table) */}
        <div className="glass-card p-6 border border-slate-200 dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📑</span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Bảng Kế Hoạch Dự Án Phim Tổng Thể (Master Project Plan)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Khống chế số bản draft, token hạn mức, người phụ trách, độ dài tối đa và cột mốc cho từng tập phim
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 uppercase text-[10px]">
                  <th className="py-3 px-3">Tập</th>
                  <th className="py-3 px-3">Tiêu Đề Tập Phim</th>
                  <th className="py-3 px-3">Người Phụ Trách</th>
                  <th className="py-3 px-3 text-center">Bản Draft</th>
                  <th className="py-3 px-3">Khống Chế Token Quota</th>
                  <th className="py-3 px-3">Độ Dài Tối Đa</th>
                  <th className="py-3 px-3">Trạng Thái Kế Hoạch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {currentProject?.episodes.map((ep) => {
                  const quotaVal = ep.quota?.allocatedTokens || ep.plan?.estimatedTokens || 450;
                  const isQuotaExceeded = ep.actualTokensUsed > quotaVal;
                  return (
                    <tr key={ep.id} className="hover:bg-slate-100/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-bold font-mono text-slate-900 dark:text-white">
                        Tập {ep.episodeNumber}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {ep.title}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-zinc-300">
                        {ep.assigneeName || 'Đạo diễn AI Trần Minh Huy'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-bold">
                          v1.{(ep.submissions?.length || 0) + 1}.0 ({ep.draftsCount || 1} bản)
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${isQuotaExceeded ? 'text-danger' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {ep.actualTokensUsed} / {quotaVal} Tokens
                          </span>
                          {isQuotaExceeded && (
                            <span className="text-[10px] text-danger font-bold">Vượt trần</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-zinc-300">
                        {ep.plan?.targetDuration || ep.totalDuration || '45 phút'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-zinc-300">
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
        <div className="glass-card p-6 border border-slate-200 dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🗓️</span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Kế Hoạch Phát Sóng Công Khai (Public Premiere Schedule)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Quản lý lịch phát sóng định kỳ, đặc quyền xem sớm 24h cho hội viên VIP
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {currentProject?.episodes.map((ep, idx) => {
              const releaseDate = ep.scheduledReleaseDate || `2027-01-${15 + idx * 7}`;
              const isLive = ep.status === 'PUBLISHED';
              return (
                <div
                  key={ep.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-2 ${
                    isLive
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-400">TẬP {ep.episodeNumber}</span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {ep.title}
                    </h5>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <p className="text-slate-500 dark:text-zinc-400">Lịch chiếu:</p>
                    <p className="font-mono font-bold text-ruby">{releaseDate}</p>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      VIP xem sớm 24h
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 text-[10px] font-bold">
                    {isLive ? (
                      <span className="text-emerald-500">🟢 Đang công chiếu</span>
                    ) : (
                      <span className="text-slate-400">⏳ Đã lên lịch</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Review Production Plans List (Maker-Checker Hub) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Danh Sách Kế Hoạch & Tập Phim Cần Duyệt</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-zinc-300">
                  {currentProject?.episodes.length || 0} tập
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Thẩm định kịch bản, cấp hạn ngạch Token Quota hoặc xem bản dựng do Creator gửi lên
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
                  className={`glass-card p-5 sm:p-6 border transition-all ${
                    isPlanSubmitted
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : isContentSubmitted
                      ? 'border-neon/40 bg-neon/5'
                      : isPublished
                      ? 'border-emerald-500/30'
                      : 'border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Episode Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-6 h-6 rounded bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-black text-xs flex items-center justify-center">
                          {ep.episodeNumber}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {ep.title}
                        </h3>

                        {/* State Badges */}
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase ${
                            isPublished
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : isContentSubmitted
                              ? 'bg-neon/15 text-neon border border-neon/30 animate-pulse'
                              : isPlanSubmitted
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse'
                              : isQuotaAllocated
                              ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                              : isPlanRejected || isContentRejected
                              ? 'bg-danger/15 text-danger border border-danger/30'
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
                        <span>Thời lượng: <strong>{ep.plan?.targetDuration || ep.totalDuration}</strong></span>
                        <span>•</span>
                        <span>Số cảnh: <strong>{ep.plan?.totalScenes || ep.scenes.length} Scenes</strong></span>
                        <span>•</span>
                        <span>
                          Dự trù Token: <strong className="text-amber-600 dark:text-amber-400 font-mono">{ep.plan?.estimatedTokens || 0} Tokens</strong>
                        </span>
                        {ep.quota && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Quota được cấp: <strong className="font-mono">{ep.quota.allocatedTokens} Tokens</strong>
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
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
                          >
                            Request Plan Changes
                          </button>
                          <button
                            onClick={() => setSelectedEpForQuota(ep)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Approve & Allocate AI Quota</span>
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
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition-all"
                        >
                          Xem AI Studio
                        </Link>
                      )}

                      {/* 4. If Published -> View on Catalog */}
                      {isPublished && (
                        <Link
                          href="/watch/1"
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
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
