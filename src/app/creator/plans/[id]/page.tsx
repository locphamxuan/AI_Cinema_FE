'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import ProductionHeader from '@/components/production/ProductionHeader';
import FeedbackHistory from '@/components/production/FeedbackHistory';
import { useProductionStore } from '@/store/useProductionStore';
import { ScenePlan } from '@/types/production';

export default function CreatorPlanEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const episodeId = resolvedParams.id;

  const { getEpisode, getProject, submitProductionPlan } = useProductionStore();
  const episode = getEpisode(episodeId) || getEpisode('ep-prod-04');
  const project = getProject();

  const isRejected = episode?.status === 'PLAN_REJECTED';
  const latestRejectionFeedback = episode?.plan?.feedbackHistory.find(
    (fb) => fb.type === 'plan_changes' && fb.role === 'reviewer'
  );

  // Form states
  const [overviewScript, setOverviewScript] = useState(
    episode?.plan?.overviewScript ||
      'Cuộc thương lượng trực tiếp giữa tiến sĩ Minh Anh và AI AURA tại không gian ảo siêu thực.'
  );
  const [targetDuration, setTargetDuration] = useState(episode?.plan?.targetDuration || '45 phút');
  const [estimatedTokens, setEstimatedTokens] = useState<number>(
    isRejected ? 480 : episode?.plan?.estimatedTokens || 500
  );
  const [scenes, setScenes] = useState<ScenePlan[]>(
    episode?.plan?.sceneBreakdown && episode.plan.sceneBreakdown.length > 0
      ? episode.plan.sceneBreakdown
      : [
          {
            sceneNumber: 1,
            title: 'Bước Vào Chiều Không Gian Ảo',
            description: 'Cổng truyền ý thức mở ra với cấu trúc đa chiều.',
            targetDurationSec: 25,
            estimatedTokens: 90,
            visualPrompt: 'Mind upload portal, hyper-dimensional geometry, neon cyan reflections',
            audioPrompt: 'Ethereal binaural waves with ambient synthesizer',
          },
          {
            sceneNumber: 2,
            title: 'Tòa Tháp Pha Lê Ý Thức',
            description: 'Đối thoại tại trung tâm kiến trúc pha lê dữ liệu tối giản.',
            targetDurationSec: 30,
            estimatedTokens: 110,
            visualPrompt: 'Crystal tower of consciousness, surreal ambient lighting, 4K HDR',
            audioPrompt: 'Echoing philosophic dialogue between human and AI',
          },
          {
            sceneNumber: 3,
            title: 'Hiệp Ước Nhận Thức Tương Lai',
            description: 'Khái niệm cộng sinh được hình thành.',
            targetDurationSec: 20,
            estimatedTokens: 80,
            visualPrompt: 'Holographic golden particles intertwining with human DNA',
            audioPrompt: 'Warm cinematic crescendo',
          },
        ]
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!episode || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p>Không tìm thấy thông tin kế hoạch tập phim.</p>
      </div>
    );
  }

  const handleAddScene = () => {
    const nextNum = scenes.length + 1;
    const newScenePlan: ScenePlan = {
      sceneNumber: nextNum,
      title: `Phân Cảnh Mới #${nextNum}`,
      description: 'Mô tả tóm tắt nội dung cảnh...',
      targetDurationSec: 20,
      estimatedTokens: 80,
      visualPrompt: 'Cinematic lighting, 4K resolution, photorealistic',
      audioPrompt: 'Voiceover & ambient SFX',
    };
    setScenes([...scenes, newScenePlan]);
  };

  const handleRemoveScene = (index: number) => {
    setScenes(scenes.filter((_, i) => i !== index));
  };

  const handleSceneChange = (index: number, field: keyof ScenePlan, value: unknown) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], [field]: value };
    setScenes(updated);
  };

  const calculatedTotalTokens = scenes.reduce((sum, s) => sum + s.estimatedTokens, 0);

  const handleSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    submitProductionPlan(project.id, episode.id, {
      overviewScript,
      targetDuration,
      estimatedTokens: calculatedTotalTokens || estimatedTokens,
      totalScenes: scenes.length,
      sceneBreakdown: scenes,
    });

    setToastMessage('Đã nộp kế hoạch sản xuất lên Reviewer thành công! Trạng thái: PLAN_SUBMITTED.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-zinc-100 transition-colors">
      <ProductionHeader
        title={`Lập Kế Hoạch: ${episode.title}`}
        subtitle="Dành cho Content Creator (Maker / Đạo diễn AI)"
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

        {/* Rejection Feedback Box (Prominent Orange Alert) */}
        {isRejected && latestRejectionFeedback && (
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-slate-900 dark:text-amber-100 space-y-2 animate-bounce-in shadow-lg shadow-amber-500/10">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm uppercase tracking-wider">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Phản Hồi Yêu Cầu Chỉnh Sửa Từ Reviewer ({latestRejectionFeedback.author})</span>
            </div>

            <p className="text-xs sm:text-sm font-medium leading-relaxed bg-white/60 dark:bg-black/30 p-3.5 rounded-xl border border-amber-500/20">
              {latestRejectionFeedback.content}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-amber-200/70">
              Vui lòng điều chỉnh lại phân cảnh & dự trù Token dưới đây, sau đó bấm &quot;Nộp Lại Kế Hoạch Sản Xuất&quot;.
            </p>
          </div>
        )}

        {/* Plan Header Form */}
        <form onSubmit={handleSubmitPlan} className="space-y-6">
          <div className="glass-card p-6 sm:p-7 border border-slate-200 dark:border-white/10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase bg-neon text-white">
                  Màn Hình 2.1
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  Kế Hoạch Sản Xuất: {episode.title}
                </h1>
              </div>

              {/* Status Pill */}
              <span className="px-3 py-1 rounded-xl text-xs font-black uppercase bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-zinc-300 self-start sm:self-auto">
                Trạng thái: {episode.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Kịch Bản Tổng Quan (Overview Script)
                </label>
                <textarea
                  rows={3}
                  required
                  value={overviewScript}
                  onChange={(e) => setOverviewScript(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-neon transition-all resize-none"
                  placeholder="Nhập kịch bản tóm tắt phân cảnh..."
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Thời Lượng Mục Tiêu
                  </label>
                  <input
                    type="text"
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Tổng Token Dự Trù (Tự tính từ các cảnh)
                  </label>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-zinc-400 font-medium">Ước tính:</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                      {calculatedTotalTokens} Tokens
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Scene Breakdown List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Phân Rã Chi Tiết Các Cảnh (Scene Breakdown)</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-zinc-300">
                    {scenes.length} Cảnh
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Khai báo prompt hình ảnh, âm thanh và dự toán token từng cảnh
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddScene}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 dark:bg-white/15 hover:bg-slate-900 dark:hover:bg-white/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Thêm Cảnh Mới</span>
              </button>
            </div>

            <div className="space-y-4">
              {scenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="glass-card p-5 border border-slate-200 dark:border-white/10 space-y-3 relative"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded bg-neon/15 text-neon font-black text-xs flex items-center justify-center shrink-0">
                        #{scene.sceneNumber}
                      </span>
                      <input
                        type="text"
                        value={scene.title}
                        onChange={(e) => handleSceneChange(idx, 'title', e.target.value)}
                        className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white bg-transparent outline-none focus:border-b focus:border-neon flex-1"
                        placeholder="Tên phân cảnh..."
                      />
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Dự toán:</span>
                        <input
                          type="number"
                          min={10}
                          value={scene.estimatedTokens}
                          onChange={(e) => handleSceneChange(idx, 'estimatedTokens', Number(e.target.value))}
                          className="w-16 bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 text-center outline-none"
                        />
                        <span className="text-[10px] text-slate-400">Tokens</span>
                      </div>

                      {scenes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveScene(idx)}
                          className="text-slate-400 hover:text-danger p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        Visual Prompt Dự Kiến
                      </label>
                      <textarea
                        rows={2}
                        value={scene.visualPrompt}
                        onChange={(e) => handleSceneChange(idx, 'visualPrompt', e.target.value)}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-xs text-slate-900 dark:text-white outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        Audio / Voice Prompt & Dialogue
                      </label>
                      <textarea
                        rows={2}
                        value={scene.audioPrompt}
                        onChange={(e) => handleSceneChange(idx, 'audioPrompt', e.target.value)}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-xs text-slate-900 dark:text-white outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Bar */}
          <div className="glass-card p-5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-zinc-400">
              Tổng ngân sách kịch bản: <strong className="text-amber-600 dark:text-amber-400 font-mono text-sm">{calculatedTotalTokens} Tokens</strong> ({scenes.length} phân cảnh).
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-neon to-neon-dark hover:shadow-xl hover:shadow-neon/40 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>{isRejected ? 'Nộp Lại Kế Hoạch Đã Sửa Đổi' : 'Submit Production Plan'}</span>
            </button>
          </div>
        </form>

        {/* Feedback History Bottom Section */}
        <div className="glass-card p-5 border border-slate-200 dark:border-white/10">
          <FeedbackHistory feedbacks={episode.plan?.feedbackHistory || []} />
        </div>
      </main>
    </div>
  );
}
