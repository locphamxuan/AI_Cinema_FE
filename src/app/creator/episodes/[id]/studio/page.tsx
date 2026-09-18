'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import ProductionHeader from '@/components/production/ProductionHeader';
import QuotaGaugeBar from '@/components/production/QuotaGaugeBar';
import SceneEditorCard from '@/components/production/SceneEditorCard';
import SubmitReviewModal from '@/components/production/SubmitReviewModal';
import { useProductionStore } from '@/store/useProductionStore';

export default function CreatorStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const episodeId = resolvedParams.id;

  const {
    getEpisode,
    getProject,
    updateScene,
    addScene,
    removeScene,
    generateSceneVideo,
    reorderScenes,
    requestTokenExtension,
    submitEpisodeDraft,
    submitEpisodeForReview,
  } = useProductionStore();

  const episode = getEpisode(episodeId) || getEpisode('ep-prod-03');
  const project = getProject();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [requestedTokens, setRequestedTokens] = useState(150);
  const [tokenReason, setTokenReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!episode || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p>Không tìm thấy tập phim trong AI Studio.</p>
      </div>
    );
  }

  // Duration calculation
  const totalDurationSec = episode.scenes.reduce((acc, s) => acc + (s.durationSec || 0), 0);
  const maxDurationSec = episode.maxDurationSec || 2700; // default 45 mins (2700s)
  const isDurationExceeded = totalDurationSec > maxDurationSec;

  const formatMinSec = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if Quota is Allocated
  const isUnlocked = !!episode.quota && episode.quota.allocatedTokens > 0;
  const quota = episode.quota?.allocatedTokens || 0;
  const actualUsed = episode.actualTokensUsed;
  const isQuotaExceeded = quota > 0 && actualUsed >= quota;

  // Pending token extensions for this episode
  const pendingTokenReqs = project.tokenExtensionRequests?.filter(
    (r) => r.episodeId === episode.id && r.status === 'pending'
  ) || [];

  // Add new blank scene
  const handleAddNewScene = () => {
    const nextNum = episode.scenes.length + 1;
    addScene(project.id, episode.id, {
      sceneNumber: nextNum,
      title: `Phân Cảnh Mới #${nextNum}`,
      prompt: 'Cinematic wide angle, high contrast lighting, photorealistic 8K render',
      dialogue: 'Nhân vật: "Mô tả lời thoại mới..."',
      voiceModel: 'ElevenLabs Pro (Minh Anh - Vietnamese Female Warm)',
      videoModel: 'CinemaGen v3.2 (4K Photoreal)',
      durationSec: 15,
      tokenCost: 65,
      thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
    });
  };

  // Move scene up or down
  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= episode.scenes.length) return;
    reorderScenes(project.id, episode.id, index, targetIndex);
  };

  // Token Extension Request Submit
  const handleRequestTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenReason.trim()) return;

    requestTokenExtension(
      project.id,
      episode.id,
      requestedTokens,
      tokenReason.trim()
    );

    setIsTokenModalOpen(false);
    setTokenReason('');
    setToastMessage(`Đã gửi yêu cầu xin thêm ${requestedTokens} Tokens tới Reviewer!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Confirm Submit Episode to Reviewer
  const handleConfirmSubmit = () => {
    // 1. Create formal draft submission entity
    submitEpisodeDraft(
      project.id,
      episode.id,
      'Bản dựng hoàn chỉnh đã render đầy đủ các phân cảnh, kiểm tra độ dài và chuẩn chất lượng AI.'
    );

    // 2. Change status to CONTENT_SUBMITTED
    const res = submitEpisodeForReview(project.id, episode.id);
    if (res.success) {
      setToastMessage('Đã nộp bản dựng (Draft Submission) lên Reviewer thành công! Chuyển trạng thái sang CONTENT_SUBMITTED.');
    } else {
      setToastMessage(`⚠️ ${res.error}`);
    }
    setTimeout(() => setToastMessage(null), 4500);
  };

  // If Not Unlocked (no quota yet)
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-zinc-100 transition-colors">
        <ProductionHeader
          title={`AI Studio: ${episode.title}`}
          subtitle="Studio Biên Tập & Sinh Video AI"
        />

        <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-500 mx-auto flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Studio Đang Bị Khóa
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Tập phim này chưa được Reviewer phê duyệt kế hoạch và cấp hạn ngạch Token Quota. Vui lòng nộp hoặc chờ Reviewer phân bổ Quota trước khi bắt đầu sinh video AI.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <Link
              href={`/creator/plans/${episode.id}`}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-neon hover:bg-neon-dark shadow-md shadow-neon/30 transition-all"
            >
              Xem Kế Hoạch Sản Xuất
            </Link>
            <Link
              href="/reviewer/projects/create"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 transition-all"
            >
              Chuyển Sang Reviewer Để Cấp Quota
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const completedScenesCount = episode.scenes.filter((s) => s.status === 'completed').length;
  const isAllCompleted = episode.scenes.length > 0 && completedScenesCount === episode.scenes.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-zinc-100 transition-colors">
      <ProductionHeader
        title={`AI Studio: ${episode.title}`}
        subtitle="Studio Biên Tập & Sinh Video AI"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-500/30 flex items-center gap-2 animate-bounce-in">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Sticky Gauge Bar */}
        <QuotaGaugeBar
          usedTokens={actualUsed}
          allocatedTokens={quota}
          episodeTitle={`AI Studio • ${episode.title}`}
        />

        {/* Studio Info & Duration Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Duration Control Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDurationExceeded
              ? 'bg-danger/10 border-danger/40 text-danger'
              : 'glass-card border-slate-200 dark:border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                ⏱️ Kiểm Soát Độ Dài Tập Phim
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                isDurationExceeded ? 'bg-danger text-white' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}>
                {isDurationExceeded ? 'Vượt Giới Hạn' : 'Trong Tiêu Chuẩn'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                {formatMinSec(totalDurationSec)}
              </span>
              <span className="text-xs font-bold text-slate-400">
                / Tối đa {formatMinSec(maxDurationSec)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isDurationExceeded ? 'bg-danger' : 'bg-gradient-to-r from-neon to-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (totalDurationSec / maxDurationSec) * 100)}%` }}
              />
            </div>
            {isDurationExceeded && (
              <p className="text-[11px] font-bold mt-1 text-danger">
                ⚠️ Độ dài vượt mức khống chế! Hãy rút ngắn thời lượng các phân cảnh.
              </p>
            )}
          </div>

          {/* AI Policy & Project Plan Quick Link */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-500 dark:text-zinc-400">📜 Chính Sách AI Áp Dụng</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-neon/15 text-neon">
                  {project.appliedPolicy?.code || 'LUAT-AI-2025'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 line-clamp-1">
                {project.appliedPolicy?.name || 'Luật AI & Bản Quyền Số 2025'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Kiểm duyệt an toàn: &ge; {project.appliedPolicy?.minModerationScore || 95}% • Watermark: Bắt buộc
              </p>
            </div>

            <button
              onClick={() => setIsProjectDrawerOpen(true)}
              className="text-xs font-bold text-neon hover:text-neon-dark text-left mt-2 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem Tóm Tắt & Kế Hoạch Dự Án</span>
              <span>&rarr;</span>
            </button>
          </div>

          {/* Token Extension Actions Card */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-500 dark:text-zinc-400">⚡ Hạn Mức & Đề Xuất Token</span>
                {pendingTokenReqs.length > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-white animate-pulse">
                    Đang Chờ Duyệt +{pendingTokenReqs[0].requestedTokens}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 dark:text-zinc-300">
                <span>Còn lại: </span>
                <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                  {Math.max(0, quota - actualUsed)} Tokens
                </strong>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nếu phát sinh phân cảnh phức tạp, bạn có thể gửi đề xuất xin thêm quota.
              </p>
            </div>

            <button
              onClick={() => setIsTokenModalOpen(true)}
              className="mt-2 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <span>💡 Xin Đề Xuất Mở Rộng Token</span>
            </button>
          </div>
        </div>

        {/* Studio Control Header */}
        <div className="glass-card p-5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-neon text-white">
                Storyboard Studio
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Tiến độ: <strong>{completedScenesCount} / {episode.scenes.length} Cảnh hoàn tất</strong>
              </span>
              {episode.draftsCount ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-zinc-400">
                  Draft v{episode.draftsCount}
                </span>
              ) : null}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Biên Tập, Sinh Video AI & Sắp Xếp Phân Cảnh
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAddNewScene}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Thêm Phân Cảnh</span>
            </button>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              disabled={!isAllCompleted}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-neon to-neon-dark hover:shadow-lg hover:shadow-neon/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Nộp Bản Dựng Cho Reviewer</span>
            </button>
          </div>
        </div>

        {/* Scene Cards Storyboard with Reordering */}
        <div className="space-y-4">
          {episode.scenes.map((scene, idx) => (
            <SceneEditorCard
              key={scene.id}
              scene={scene}
              isQuotaExceeded={isQuotaExceeded}
              canMoveUp={idx > 0}
              canMoveDown={idx < episode.scenes.length - 1}
              onMoveUp={() => handleMoveScene(idx, 'up')}
              onMoveDown={() => handleMoveScene(idx, 'down')}
              onUpdate={(id, updates) => updateScene(project.id, episode.id, id, updates)}
              onGenerate={(id) => generateSceneVideo(project.id, episode.id, id)}
              onDelete={episode.scenes.length > 1 ? (id) => removeScene(project.id, episode.id, id) : undefined}
            />
          ))}
        </div>
      </main>

      {/* Submit Modal */}
      <SubmitReviewModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        episode={episode}
        onConfirm={handleConfirmSubmit}
      />

      {/* Token Extension Request Modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-card p-6 border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Xin Đề Xuất Mở Rộng Token Quota
                </h3>
              </div>
              <button
                onClick={() => setIsTokenModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestTokenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Số lượng Tokens yêu cầu thêm <span className="text-ruby">*</span>
                </label>
                <input
                  type="number"
                  min={50}
                  step={50}
                  required
                  value={requestedTokens}
                  onChange={(e) => setRequestedTokens(Number(e.target.value))}
                  className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-sm font-bold font-mono text-amber-600 dark:text-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Lý do đề xuất mở rộng <span className="text-ruby">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ví dụ: Phân cảnh đại chiến cần render lại độ phân giải 4K 60fps với CinemaGen Turbo để đạt độ chân thực cao hơn..."
                  value={tokenReason}
                  onChange={(e) => setTokenReason(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsTokenModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer"
                >
                  Gửi Yêu Cầu Cho Reviewer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Info & Policy Drawer Modal */}
      {isProjectDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-card p-6 border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Kế Hoạch & Thông Số Dự Án Phim
                </h3>
              </div>
              <button
                onClick={() => setIsProjectDrawerOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Project Overview */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">{project.title}</h4>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(project.genre) ? (
                  project.genre.map((g) => (
                    <span key={g} className="px-2 py-0.5 rounded text-[10px] font-bold bg-ruby/10 text-ruby border border-ruby/30">
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ruby/10 text-ruby border border-ruby/30">
                    {project.genre}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                {project.synopsis}
              </p>
            </div>

            {/* Applied AI Policy */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Chính Sách Kiểm Duyệt AI:
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-neon text-white">
                  {project.appliedPolicy?.code || 'LUAT-AI-2025'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {project.appliedPolicy?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {project.appliedPolicy?.description}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-zinc-300 pt-1">
                <span>• Tiêu chuẩn an toàn: &ge; <strong>{project.appliedPolicy?.minModerationScore}%</strong></span>
                <span>• Dán nhãn AI (Watermark): <strong>{project.appliedPolicy?.watermarkRequired ? 'Bắt buộc' : 'Không'}</strong></span>
              </div>
            </div>

            {/* Milestones list */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Cột Mốc Tiến Độ Của Dự Án
              </h4>
              <div className="space-y-2">
                {project.milestones?.map((m, idx) => (
                  <div key={m.id} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">Mốc {idx + 1}: {m.title}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">Hạn chót: {m.dueDate} • Phụ trách: {m.assignedTo}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      m.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : m.status === 'in_progress'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsProjectDrawerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

