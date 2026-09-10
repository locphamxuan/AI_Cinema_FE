'use client';

import { useState } from 'react';
import { ProductionEpisode } from '@/types/production';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: ProductionEpisode;
  onConfirm: () => void;
}

export default function SubmitReviewModal({
  isOpen,
  onClose,
  episode,
  onConfirm,
}: SubmitReviewModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onConfirm();
      setLoading(false);
      onClose();
    }, 300);
  };

  const completedScenes = episode.scenes.filter((s) => s.status === 'completed').length;
  const totalScenes = episode.scenes.length;

  return (
    <div
      className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-lg p-6 sm:p-7 animate-scale-in border border-slate-200 dark:border-white/15 relative overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon via-ruby to-amber-400" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon/15 border border-neon/30 flex items-center justify-center text-neon shrink-0 shadow-md">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Nộp Bản Dựng Lên Reviewer
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Tổng kết thông số trước khi chuyển giao tập phim cho ban kiểm duyệt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Summary Details */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2.5 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400">Tập phim:</span>
            <span className="font-bold text-slate-900 dark:text-white">{episode.title}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400">Tiến độ phân cảnh:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {completedScenes} / {totalScenes} Cảnh hoàn tất (100%)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400">Thực tế Token tiêu thụ:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">
              {episode.actualTokensUsed} / {episode.quota?.allocatedTokens || 0} Tokens
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-white/10">
            <span className="text-slate-500 dark:text-zinc-400">Trạng thái sau khi nộp:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-neon/15 text-neon border border-neon/30">
              CONTENT_SUBMITTED
            </span>
          </div>
        </div>

        {/* Actions */}
        <form onSubmit={handleSubmit} className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-neon to-neon-dark hover:shadow-lg hover:shadow-neon/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <span>Đang nộp...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Xác Nhận Nộp Bản Dựng</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
