'use client';

import { useState } from 'react';
import { Scene } from '@/types/production';

interface SceneEditorCardProps {
  scene: Scene;
  isQuotaExceeded: boolean;
  onUpdate: (sceneId: string, updates: Partial<Scene>) => void;
  onGenerate: (sceneId: string) => Promise<{ success: boolean; error?: string }>;
  onDelete?: (sceneId: string) => void;
}

const VOICE_MODELS = [
  'ElevenLabs Pro (Minh Anh - Vietnamese Female Warm)',
  'ElevenLabs Pro (Kỹ Sư Vũ - Vietnamese Male Deep)',
  'ElevenLabs Pro (AURA Synthetic Female)',
  'ElevenLabs Pro (Đặc Vụ Lâm - Male Action)',
];

const VIDEO_MODELS = [
  'CinemaGen v3.2 (4K Photoreal)',
  'CinemaGen Turbo v2.1 (Fast Render)',
  'NeuralFilm Ultra HDR (Cinema 60fps)',
];

export default function SceneEditorCard({
  scene,
  isQuotaExceeded,
  onUpdate,
  onGenerate,
  onDelete,
}: SceneEditorCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (isQuotaExceeded) {
      setGenError('Hạn ngạch AI Token đã chạm giới hạn!');
      return;
    }

    setGenError(null);
    setIsGenerating(true);
    const res = await onGenerate(scene.id);
    if (!res.success) {
      setGenError(res.error || 'Lỗi sinh clip AI');
    }
    setIsGenerating(false);
  };

  const isCompleted = scene.status === 'completed';
  const isRendering = scene.status === 'rendering';

  return (
    <div
      className={`glass-card p-4 sm:p-5 transition-all border ${
        isCompleted
          ? 'border-emerald-500/30 shadow-md shadow-emerald-500/5'
          : isRendering
          ? 'border-neon/40 shadow-md shadow-neon/10'
          : 'border-slate-200 dark:border-white/10'
      }`}
    >
      {/* Scene Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-black text-xs flex items-center justify-center shrink-0">
            #{scene.sceneNumber}
          </span>
          <input
            type="text"
            value={scene.title}
            onChange={(e) => onUpdate(scene.id, { title: e.target.value })}
            className="text-sm font-bold text-slate-900 dark:text-white bg-transparent outline-none focus:border-b focus:border-ruby transition-all"
            placeholder="Tên phân cảnh..."
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <span className="font-mono text-slate-500 dark:text-zinc-400">
            {scene.durationSec}s • <strong className="text-amber-600 dark:text-amber-400 font-mono">{scene.tokenCost} Tokens</strong>
          </span>

          <span
            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              isCompleted
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : isRendering
                ? 'bg-neon/15 text-neon border border-neon/30 animate-pulse'
                : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-zinc-400'
            }`}
          >
            {isCompleted ? '✓ Hoàn Tất' : isRendering ? 'Đang Render' : 'Chưa Render'}
          </span>

          {onDelete && (
            <button
              onClick={() => onDelete(scene.id)}
              className="text-slate-400 hover:text-danger p-1 transition-colors"
              title="Xóa cảnh này"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Visual Prompt & Dialogue */}
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
              Visual Prompt (Mô tả hình ảnh & góc máy AI)
            </label>
            <textarea
              rows={3}
              value={scene.prompt}
              onChange={(e) => onUpdate(scene.id, { prompt: e.target.value })}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all resize-none"
              placeholder="Nhập prompt chi tiết góc máy, ánh sáng, chuyển động..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
              Lời Thoại Nhân Vật & SFX
            </label>
            <input
              type="text"
              value={scene.dialogue}
              onChange={(e) => onUpdate(scene.id, { dialogue: e.target.value })}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-neon transition-all"
              placeholder="Nhập lời thoại hoặc ghi chú âm thanh..."
            />
          </div>
        </div>

        {/* Right Column: Model Selectors & Preview / Render Action */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                Model Giọng Nói (Voice AI)
              </label>
              <select
                value={scene.voiceModel}
                onChange={(e) => onUpdate(scene.id, { voiceModel: e.target.value })}
                className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer shadow-sm"
              >
                {VOICE_MODELS.map((v) => (
                  <option key={v} value={v} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {v.split('(')[0].trim()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                Model Video AI
              </label>
              <select
                value={scene.videoModel}
                onChange={(e) => onUpdate(scene.id, { videoModel: e.target.value })}
                className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer shadow-sm"
              >
                {VIDEO_MODELS.map((m) => (
                  <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {m.split('(')[0].trim()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Render Status / Progress Bar or Action */}
          <div>
            {isRendering ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-neon">
                  <span className="flex items-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang render CinemaGen AI...
                  </span>
                  <span>{scene.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon to-ruby transition-all duration-300"
                    style={{ width: `${scene.progress}%` }}
                  />
                </div>
              </div>
            ) : isCompleted ? (
              <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="flex items-center gap-2">
                  <img
                    src={scene.thumbnailUrl}
                    alt={scene.title}
                    className="w-14 h-9 rounded-lg object-cover border border-emerald-500/30"
                  />
                  <div className="text-[11px]">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">Clip AI đã sẵn sàng</p>
                    <p className="text-slate-500 dark:text-zinc-400">4K 60fps • {scene.durationSec}s</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isQuotaExceeded || isGenerating}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-700 dark:text-zinc-300 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-all cursor-pointer"
                >
                  Render Lại
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isQuotaExceeded || isGenerating}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-neon to-neon-dark hover:shadow-lg hover:shadow-neon/30 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Sinh Clip Phân Cảnh AI (-{scene.tokenCost} Tokens)</span>
              </button>
            )}

            {genError && (
              <p className="text-[11px] text-danger font-medium mt-1.5 animate-fade-in">
                ⚠️ {genError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
