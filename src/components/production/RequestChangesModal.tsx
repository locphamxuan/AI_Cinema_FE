'use client';

import { useState } from 'react';

interface RequestChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'plan' | 'content';
  targetTitle: string;
  onConfirm: (feedback: string) => void;
}

export default function RequestChangesModal({
  isOpen,
  onClose,
  type,
  targetTitle,
  onConfirm,
}: RequestChangesModalProps) {
  const defaultFeedback =
    type === 'plan'
      ? 'Yêu cầu điều chỉnh kế hoạch: Mức dự trù Token vượt quá định mức cho phép. Vui lòng tối ưu lại số lượng cảnh và rút gọn thời lượng.'
      : 'Yêu cầu điều chỉnh phân cảnh: Cảnh 2 có hiện tượng lệch khẩu hình lồng tiếng và hiệu ứng ánh sáng chưa đạt chuẩn 4K HDR. Vui lòng render lại.';

  const [feedback, setFeedback] = useState(defaultFeedback);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setLoading(true);
    setTimeout(() => {
      onConfirm(feedback.trim());
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
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-danger" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 shadow-md">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {type === 'plan' ? 'Yêu Cầu Sửa Kế Hoạch Sản Xuất' : 'Yêu Cầu Sửa Đổi Bản Dựng'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Gửi phản hồi chi tiết về cho Creator: <strong className="text-slate-700 dark:text-zinc-300">{targetTitle}</strong>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Nội dung yêu cầu chỉnh sửa (Feedback sẽ gửi trực tiếp đến Creator)
            </label>
            <textarea
              rows={4}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Nhập chi tiết các cảnh cần chỉnh sửa, lỗi khẩu hình, ánh sáng hoặc dự toán token..."
              className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
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
              disabled={loading || !feedback.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Đang gửi phản hồi...' : 'Gửi Yêu Cầu Chỉnh Sửa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
