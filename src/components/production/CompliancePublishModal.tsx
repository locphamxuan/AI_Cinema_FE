'use client';

import { useState } from 'react';
import { ProductionEpisode, ComplianceMetadata } from '@/types/production';

interface CompliancePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: ProductionEpisode;
  onConfirm: (complianceData: ComplianceMetadata, scheduledDate: string) => void;
}

export default function CompliancePublishModal({
  isOpen,
  onClose,
  episode,
  onConfirm,
}: CompliancePublishModalProps) {
  const [article44, setArticle44] = useState(true);
  const [decree142, setDecree142] = useState(true);
  const [watermark, setWatermark] = useState(true);
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [isPublishNow, setIsPublishNow] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!article44 || !decree142) return;

    setLoading(true);
    const complianceData: ComplianceMetadata = {
      aiLawArticle44Verified: article44,
      decree142LabelAttached: decree142,
      aiWatermarkEnabled: watermark,
      certificationId: `AI-VN-2026-CINEMA-0984-EP${episode.episodeNumber}`,
      moderationScore: 99.4,
      aiContentPercentage: 100,
      verifiedBy: 'Hội đồng Thẩm định Đạo đức AI & Reviewer Lê Quốc Bảo',
      verifiedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onConfirm(complianceData, isPublishNow ? new Date().toISOString() : new Date(scheduledDate).toISOString());
      setLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-xl p-6 sm:p-8 animate-scale-in border border-slate-200 dark:border-white/15 relative overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ruby via-neon to-emerald-500" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-ruby to-ruby-dark text-white flex items-center justify-center shrink-0 shadow-lg shadow-ruby/30">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Trạm Kiểm Soát Tuân Thủ & Xuất Bản
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Thẩm định pháp lý AI & Đưa <strong className="text-ruby font-bold">{episode.title}</strong> lên nền tảng
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
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Legal Compliance Checklist */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Bộ Tiêu Chuẩn Pháp Lý Bắt Buộc
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                ĐIỂM ĐẠO ĐỨC: 99.4/100
              </span>
            </div>

            {/* Check 1 */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={article44}
                onChange={(e) => setArticle44(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-ruby focus:ring-ruby accent-ruby cursor-pointer"
              />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  Tuân thủ Điều 44 - Luật Trí tuệ Nhân tạo 2025
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Xác nhận nội dung không vi phạm bản quyền và đã qua bộ lọc đạo đức AI quốc gia.
                </p>
              </div>
            </label>

            {/* Check 2 */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={decree142}
                onChange={(e) => setDecree142(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-ruby focus:ring-ruby accent-ruby cursor-pointer"
              />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  Dán nhãn nhận diện AI theo Nghị định 142/2026/NĐ-CP
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Hiển thị thông báo &quot;100% nội dung sinh bởi AI&quot; trong 5 giây đầu video.
                </p>
              </div>
            </label>

            {/* Check 3 */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={watermark}
                onChange={(e) => setWatermark(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-ruby focus:ring-ruby accent-ruby cursor-pointer"
              />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  Kích hoạt Watermark số AI Cinema bản quyền
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Gắn mã xác thực chống sao chép và deepfake vào từng khung hình.
                </p>
              </div>
            </label>
          </div>

          {/* Schedule or Publish Now */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Lịch Xuất Bản Phim
            </h4>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsPublishNow(true)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isPublishNow
                    ? 'bg-ruby text-white border-ruby shadow-md shadow-ruby/20'
                    : 'bg-white dark:bg-white/5 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-white/10'
                }`}
              >
                Công Chiếu Ngay Lập Tức
              </button>
              <button
                type="button"
                onClick={() => setIsPublishNow(false)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  !isPublishNow
                    ? 'bg-ruby text-white border-ruby shadow-md shadow-ruby/20'
                    : 'bg-white dark:bg-white/5 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-white/10'
                }`}
              >
                Đặt Lịch Công Chiếu (Schedule)
              </button>
            </div>

            {!isPublishNow && (
              <div className="pt-2 animate-fade-in">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                  Chọn ngày & giờ phát sóng:
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
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
              disabled={loading || !article44 || !decree142}
              className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-ruby via-ruby-dark to-black hover:shadow-xl hover:shadow-ruby/40 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <span>Đang xuất bản lên hệ thống...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Publish Film To Platform</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
