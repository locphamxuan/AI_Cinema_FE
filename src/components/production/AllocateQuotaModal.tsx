'use client';

import { useState } from 'react';
import { ProductionEpisode, Project } from '@/types/production';

interface AllocateQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: ProductionEpisode;
  project: Project;
  onConfirm: (quotaAmount: number, notes?: string) => void;
}

export default function AllocateQuotaModal({
  isOpen,
  onClose,
  episode,
  project,
  onConfirm,
}: AllocateQuotaModalProps) {
  const defaultQuota = episode.plan?.estimatedTokens || 450;
  const [quotaAmount, setQuotaAmount] = useState<number>(defaultQuota);
  const [notes, setNotes] = useState<string>('Phê duyệt kế hoạch sản xuất. Đã cấp hạn ngạch tiêu chuẩn.');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const projectRemainingTokens = project.totalBudgetTokens - project.allocatedTokens;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onConfirm(quotaAmount, notes);
      setLoading(false);
      onClose();
    }, 300);
  };

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
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-ruby" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-md">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Phê Duyệt & Cấp AI Token Quota
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Phân bổ hạn ngạch ngân sách sinh video AI cho tập phim
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

        {/* Episode Plan Summary Card */}
        <div className="mb-5 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400">Tập phim:</span>
            <span className="font-bold text-slate-900 dark:text-white">{episode.title}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400">Thời lượng dự kiến:</span>
            <span className="font-bold text-slate-900 dark:text-white">{episode.plan?.targetDuration || '45 phút'} ({episode.plan?.totalScenes || 0} Cảnh)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400">Creator ước tính:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
              {episode.plan?.estimatedTokens || 0} Tokens
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-white/10">
            <span className="text-slate-500 dark:text-zinc-400">Ngân sách dự án khả dụng:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {projectRemainingTokens.toLocaleString()} / {project.totalBudgetTokens.toLocaleString()} Tokens
            </span>
          </div>
        </div>

        {/* Quota Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Số lượng Token Hạn Ngạch cấp chính thức
            </label>
            <div className="relative">
              <input
                type="number"
                min={10}
                max={projectRemainingTokens}
                required
                value={quotaAmount}
                onChange={(e) => setQuotaAmount(Number(e.target.value))}
                className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <span className="absolute right-4 top-2.5 text-xs font-bold text-slate-400 dark:text-zinc-500">
                AI Tokens
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Ghi chú phản hồi cho Creator (Tuỳ chọn)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập hướng dẫn hoặc lưu ý cho Creator..."
              className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || quotaAmount <= 0}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Đang cấp Quota...' : 'Xác Nhận & Cấp Quota AI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
