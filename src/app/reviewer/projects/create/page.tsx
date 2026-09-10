'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductionHeader from '@/components/production/ProductionHeader';
import AllocateQuotaModal from '@/components/production/AllocateQuotaModal';
import RequestChangesModal from '@/components/production/RequestChangesModal';
import { useProductionStore } from '@/store/useProductionStore';
import { ProductionEpisode } from '@/types/production';

export default function ReviewerProjectCreatePage() {
  const {
    projects,
    activeProjectId,
    getProject,
    createProject,
    approveAndAllocateQuota,
    requestPlanChanges,
  } = useProductionStore();

  const currentProject = getProject();

  // Create Project Form state
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Khoa học viễn tưởng, AI Thriller');
  const [synopsis, setSynopsis] = useState('');
  const [totalEpisodes, setTotalEpisodes] = useState(5);
  const [deadline, setDeadline] = useState('2026-12-31');
  const [plannedReleaseDate, setPlannedReleaseDate] = useState('2027-01-15');
  const [totalBudgetTokens, setTotalBudgetTokens] = useState(3000);

  // Modal states
  const [selectedEpForQuota, setSelectedEpForQuota] = useState<ProductionEpisode | null>(null);
  const [selectedEpForChanges, setSelectedEpForChanges] = useState<ProductionEpisode | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createProject({
      title: title.trim(),
      genre: genre.split(',').map((g) => g.trim()),
      synopsis: synopsis.trim(),
      totalEpisodes,
      deadline,
      plannedReleaseDate,
      totalBudgetTokens,
      creatorName: 'Đạo diễn AI (Creator Team)',
      reviewerName: 'Thẩm định viên Lê Quốc Bảo (Reviewer)',
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
          scheduledReleaseDate: null,
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
                    Thể Loại (Phân tách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Khoa học viễn tưởng, Hành động..."
                    className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-ruby transition-all"
                  />
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
    </div>
  );
}
