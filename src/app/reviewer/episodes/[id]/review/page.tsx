'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import ProductionHeader from '@/components/production/ProductionHeader';
import QuotaGaugeBar from '@/components/production/QuotaGaugeBar';
import FeedbackHistory from '@/components/production/FeedbackHistory';
import RequestChangesModal from '@/components/production/RequestChangesModal';
import CompliancePublishModal from '@/components/production/CompliancePublishModal';
import { useProductionStore } from '@/store/useProductionStore';
import { ComplianceMetadata, Scene } from '@/types/production';

export default function EpisodeReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const episodeId = resolvedParams.id;

  const {
    getEpisode,
    getProject,
    requestContentChanges,
    approveContent,
    verifyComplianceAndPublish,
    reviewScene,
  } = useProductionStore();

  const episode = getEpisode(episodeId) || getEpisode('ep-prod-02');
  const project = getProject();

  const [isRequestChangesOpen, setIsRequestChangesOpen] = useState(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [selectedSceneForFeedback, setSelectedSceneForFeedback] = useState<Scene | null>(null);
  const [sceneFeedbackText, setSceneFeedbackText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!episode || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-bold">Không tìm thấy tập phim cần thẩm định.</p>
          <Link href="/reviewer/projects/create" className="text-ruby underline text-sm mt-2 inline-block">
            Quay lại trang quản lý dự án
          </Link>
        </div>
      </div>
    );
  }

  // 100% Scenes Approved Enforcement
  const unapprovedScenes = episode.scenes.filter((s) => s.reviewStatus !== 'approved');
  const allScenesApproved = episode.scenes.length > 0 && unapprovedScenes.length === 0;

  const handleApproveScene = (sceneId: string) => {
    reviewScene(project.id, episode.id, sceneId, 'approved');
    setToastMessage(`Đã phê duyệt phân cảnh! (${episode.scenes.filter((s) => s.id !== sceneId ? s.reviewStatus === 'approved' : true).length}/${episode.scenes.length} cảnh hoàn tất)`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenSceneFeedback = (scene: Scene) => {
    setSelectedSceneForFeedback(scene);
    setSceneFeedbackText(scene.reviewFeedback || '');
  };

  const handleSubmitSceneFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSceneForFeedback || !sceneFeedbackText.trim()) return;

    reviewScene(project.id, episode.id, selectedSceneForFeedback.id, 'changes_requested', sceneFeedbackText.trim());
    setSelectedSceneForFeedback(null);
    setSceneFeedbackText('');
    setToastMessage('Đã lưu góp ý và chuyển trạng thái cảnh sang "Cần chỉnh sửa"!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmChanges = (feedback: string) => {
    requestContentChanges(project.id, episode.id, feedback);
    setToastMessage('Đã trả bản dựng về cho Creator kèm yêu cầu chỉnh sửa!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApproveContentOnly = () => {
    if (!allScenesApproved) {
      setToastMessage('⚠️ Không thể nghiệm thu! Vui lòng duyệt 100% phân cảnh trước.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    approveContent(project.id, episode.id);
    setIsComplianceOpen(true);
  };

  const handleConfirmPublish = (complianceData: ComplianceMetadata, scheduledDate: string) => {
    verifyComplianceAndPublish(project.id, episode.id, complianceData, scheduledDate);
    setToastMessage('Chúc mừng! Tập phim đã được xuất bản chính thức lên nền tảng!');
    setTimeout(() => setToastMessage(null), 5000);
  };

  const isPublished = episode.status === 'PUBLISHED';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-zinc-100 transition-colors">
      <ProductionHeader
        title={`Thẩm Định: ${episode.title}`}
        subtitle="Split-view thẩm định video, kiểm định Luật AI & Xuất bản"
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

        {/* Milestone & Deadline Tracker Banner */}
        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-100/60 to-slate-200/40 dark:from-white/[0.02] dark:to-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ruby/15 border border-ruby/30 flex items-center justify-center text-ruby shrink-0 shadow-md">
              <span className="text-lg">🚩</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Tiến Độ Theo Cột Mốc:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-ruby text-white">
                  Cột Mốc 2: Dựng Phim & Kỹ Xảo
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                Dự án: {project.title} • Hạn Chót Nghiệm Thu: <span className="text-ruby">{project.deadline || '2026-10-15'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="text-right text-xs">
              <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Tình trạng duyệt cảnh:</span>
              <strong className={allScenesApproved ? 'text-emerald-500 font-mono' : 'text-amber-500 font-mono'}>
                {episode.scenes.length - unapprovedScenes.length} / {episode.scenes.length} Cảnh Đã Duyệt ({allScenesApproved ? '100%' : `${Math.round(((episode.scenes.length - unapprovedScenes.length) / episode.scenes.length) * 100)}%`})
              </strong>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-slate-200 dark:bg-white/10">
              {allScenesApproved ? '✅' : '⏳'}
            </div>
          </div>
        </div>

        {/* Top Summary Bar & Status */}
        <div className="glass-card p-5 sm:p-6 border border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase bg-ruby text-white">
                Thẩm Định Phim AI
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Chính sách áp dụng: <strong>{project.appliedPolicy?.name || 'Luật AI 2025'}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {episode.title}
            </h1>
          </div>

          {/* Action Decision Buttons */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            {!isPublished ? (
              <>
                <button
                  onClick={() => setIsRequestChangesOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-danger bg-danger/10 hover:bg-danger/20 border border-danger/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Request Content Changes</span>
                </button>

                <div className="flex flex-col items-end">
                  <button
                    onClick={handleApproveContentOnly}
                    disabled={!allScenesApproved}
                    className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Approve Content & Kiểm Định Pháp Lý</span>
                  </button>
                  {!allScenesApproved && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Còn {unapprovedScenes.length} cảnh chưa duyệt. Cần duyệt 100% cảnh để mở khóa!</span>
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>ĐÃ XUẤT BẢN LÊN SÀN (PUBLISHED)</span>
                </span>
                <Link
                  href="/watch/1"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-ruby hover:bg-ruby-dark shadow-md shadow-ruby/30 transition-all"
                >
                  Xem Trên Nền Tảng
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Split-View Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Nửa Trái: Trình Phát Video Bản Dựng Hoàn Chỉnh (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-card overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg">
              {/* Video Player Mock Header */}
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold">Bản Dựng Final Master 4K</span>
                </div>
                <span className="font-mono text-zinc-400">Thời lượng: {episode.totalDuration}</span>
              </div>

              {/* Video Player Screen */}
              <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80"
                  alt="Draft Video"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />

                {/* AI Law Compliance Watermark Badge in Video */}
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white flex items-center gap-1.5 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-ruby" />
                  <span>AI CONTENT LABEL • ĐIỀU 44 LUẬT AI</span>
                </div>

                {/* Play Button Simulation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-ruby/90 text-white flex items-center justify-center shadow-2xl shadow-ruby/50 group-hover:scale-110 transition-transform cursor-pointer">
                    <svg className="w-7 h-7 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Video Controls Bar Simulation */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between text-white text-xs">
                  <span className="font-mono">00:00 / {episode.totalDuration}</span>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold">4K UHD</span>
                    <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold">Dolby Atmos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Quota Consumption Visual Bar */}
            <QuotaGaugeBar
              usedTokens={episode.actualTokensUsed}
              allocatedTokens={episode.quota?.allocatedTokens || 450}
              episodeTitle={`Thực tế tiêu thụ: ${episode.actualTokensUsed} / ${episode.quota?.allocatedTokens || 450} Tokens`}
            />

            {/* Submissions History (Bản Nộp Từ Creator) */}
            {episode.submissions && episode.submissions.length > 0 && (
              <div className="glass-card p-5 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📦</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Lịch Sử Bản Dựng Đã Nộp (Draft Submissions)
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {episode.submissions.length} phiên bản
                  </span>
                </div>

                <div className="space-y-2">
                  {episode.submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-neon/15 text-neon font-mono">
                            {sub.versionNumber}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {sub.submittedBy}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-zinc-300 italic text-[11px] mt-1">
                          &quot;{sub.changeSummary}&quot;
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] text-slate-500">
                        <span>{sub.totalScenes} Cảnh</span>
                        <span>•</span>
                        <span>{sub.totalTokensSpent} Tokens</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nửa Phải: Thẩm Định Từng Phân Cảnh & Kịch Bản Chi Tiết (Col 5) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Storyboard Scene Breakdown with Individual Scene Approvals */}
            <div className="glass-card p-5 border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Thẩm Định Phân Cảnh (Per-Scene Review)</span>
                </h3>
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                  {episode.scenes.length} Scenes
                </span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {episode.scenes.map((scene) => {
                  const isSceneApproved = scene.reviewStatus === 'approved';
                  const isSceneRejected = scene.reviewStatus === 'changes_requested';

                  return (
                    <div
                      key={scene.id}
                      className={`p-3.5 rounded-xl border space-y-2.5 text-xs transition-all ${
                        isSceneApproved
                          ? 'bg-emerald-500/5 border-emerald-500/30'
                          : isSceneRejected
                          ? 'bg-danger/5 border-danger/30'
                          : 'bg-slate-100/80 dark:bg-white/[0.03] border-slate-200 dark:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Cảnh #{scene.sceneNumber}: {scene.title}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isSceneApproved ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <span>✓</span>
                              <span>Đã Duyệt</span>
                            </span>
                          ) : isSceneRejected ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-danger/15 text-danger border border-danger/30 flex items-center gap-1">
                              <span>⚠️</span>
                              <span>Y/C Sửa</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 dark:bg-white/10 text-slate-500">
                              Chờ Duyệt
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-600 dark:text-zinc-300 italic text-[11px] line-clamp-2">
                        &quot;{scene.prompt}&quot;
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200/50 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10">
                            {scene.videoModel.split('(')[0]}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono">
                            {scene.durationSec}s
                          </span>
                          <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                            {scene.tokenCost} Tokens
                          </span>
                        </div>

                        {/* Review actions per scene */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenSceneFeedback(scene)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 dark:text-zinc-300 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-all cursor-pointer"
                          >
                            💬 Góp Ý
                          </button>
                          {!isSceneApproved ? (
                            <button
                              type="button"
                              onClick={() => handleApproveScene(scene.id)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>✓</span>
                              <span>Duyệt Cảnh</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => reviewScene(project.id, episode.id, scene.id, 'pending')}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
                              title="Thu hồi phê duyệt cảnh này"
                            >
                              Thu hồi
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Scene feedback text display */}
                      {scene.reviewFeedback && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
                          <strong>Ghi chú kiểm định:</strong> {scene.reviewFeedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback & Interaction History */}
            <div className="glass-card p-5 border border-slate-200 dark:border-white/10">
              <FeedbackHistory feedbacks={episode.plan?.feedbackHistory || []} />
            </div>
          </div>
        </div>
      </main>

      {/* Scene Feedback Modal */}
      {selectedSceneForFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-card p-6 border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">💬</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Góp Ý Phân Cảnh #{selectedSceneForFeedback.sceneNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSceneForFeedback(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSceneFeedback} className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {selectedSceneForFeedback.title}
                </p>
                <p className="text-[11px] text-slate-500 italic mb-3">
                  Prompt: &quot;{selectedSceneForFeedback.prompt}&quot;
                </p>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Nội dung yêu cầu chỉnh sửa / góp ý chi tiết:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ví dụ: Ánh sáng cảnh này hơi tối, cần điều chỉnh lại prompt góc máy cận và tăng độ tương phản..."
                  value={sceneFeedbackText}
                  onChange={(e) => setSceneFeedbackText(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedSceneForFeedback(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-ruby hover:bg-ruby-dark shadow-md shadow-ruby/30 transition-all cursor-pointer"
                >
                  Lưu Góp Ý & Yêu Cầu Sửa Cảnh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <RequestChangesModal
        isOpen={isRequestChangesOpen}
        onClose={() => setIsRequestChangesOpen(false)}
        type="content"
        targetTitle={episode.title}
        onConfirm={handleConfirmChanges}
      />

      <CompliancePublishModal
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
        episode={episode}
        onConfirm={handleConfirmPublish}
      />
    </div>
  );
}

