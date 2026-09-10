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
    submitEpisodeForReview,
  } = useProductionStore();

  const episode = getEpisode(episodeId) || getEpisode('ep-prod-03');
  const project = getProject();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!episode || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p>Không tìm thấy tập phim trong AI Studio.</p>
      </div>
    );
  }

  // Check if Quota is Allocated
  const isUnlocked = !!episode.quota && episode.quota.allocatedTokens > 0;
  const quota = episode.quota?.allocatedTokens || 0;
  const actualUsed = episode.actualTokensUsed;
  const isQuotaExceeded = quota > 0 && actualUsed >= quota;

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

  const handleConfirmSubmit = () => {
    const res = submitEpisodeForReview(project.id, episode.id);
    if (res.success) {
      setToastMessage('Đã nộp bản dựng hoàn chỉnh lên Reviewer thành công! Chuyển trạng thái sang CONTENT_SUBMITTED.');
    } else {
      setToastMessage(`⚠️ ${res.error}`);
    }
    setTimeout(() => setToastMessage(null), 4500);
  };

  // If Not Unlocked (no quota yet)
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0C10] text-slate-900 dark:text-zinc-100 transition-colors">
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0C10] text-slate-900 dark:text-zinc-100 transition-colors">
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

        {/* Studio Control Header */}
        <div className="glass-card p-5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-neon text-white">
                Storyboard Studio
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Tiến độ: <strong>{completedScenesCount} / {episode.scenes.length} Cảnh</strong>
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Biên Tập & Tạo Clip Trí Tuệ Nhân Tạo
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
              <span>Submit Episode For Final Review</span>
            </button>
          </div>
        </div>

        {/* Scene Cards Storyboard */}
        <div className="space-y-4">
          {episode.scenes.map((scene) => (
            <SceneEditorCard
              key={scene.id}
              scene={scene}
              isQuotaExceeded={isQuotaExceeded}
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
    </div>
  );
}
