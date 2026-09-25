import { useState } from 'react';
import { CheckCircle2, Edit3, AlertTriangle, X } from 'lucide-react';
import type { FieldReview, SceneReviewStatus } from '@/types/workflow';

export interface FieldReviewCardProps {
  review: FieldReview;
  onReview: (status: SceneReviewStatus, comment?: string) => void;
  header: React.ReactNode;
  children?: React.ReactNode;
  approveLabel?: string;
  /** Shows the verdict only, e.g. while the plan waits for the Creator. */
  readOnly?: boolean;
}

const TONE: Record<SceneReviewStatus, string> = {
  pending: 'bg-slate-50/70 dark:bg-white/[0.03] border-slate-200/70 dark:border-white/5',
  approved: 'bg-emerald-50/50 dark:bg-emerald-500/[0.05] border-emerald-200 dark:border-emerald-500/30',
  changes_requested: 'bg-rose-50/60 dark:bg-rose-500/[0.06] border-rose-300 dark:border-rose-500/40',
};

/**
 * One reviewable plan field (script, duration, token estimate or a scene):
 * shows its verdict and lets the Reviewer approve it or send it back with a comment (BR-39).
 */
export function FieldReviewCard({ review, onReview, header, children, approveLabel = 'Duyệt', readOnly = false }: FieldReviewCardProps) {
  const [isReworking, setIsReworking] = useState(false);
  const [comment, setComment] = useState('');

  const confirmRework = () => {
    if (!comment.trim()) return;
    onReview('changes_requested', comment.trim());
    setIsReworking(false);
    setComment('');
  };

  return (
    <div className={`p-3.5 rounded-xl border space-y-2.5 transition ${TONE[review.status]}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {header}
          {review.status === 'approved' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-3 h-3" /> Đã duyệt
            </span>
          )}
          {review.status === 'changes_requested' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-3 h-3" /> Yêu cầu làm lại
            </span>
          )}
        </div>
      </div>

      {children}

      {review.status === 'changes_requested' && review.comment && (
        <div className="text-[11px] text-rose-700 dark:text-rose-300 bg-white dark:bg-[#161922] border border-rose-200 dark:border-rose-500/30 rounded-lg p-2.5">
          <strong>Ghi chú đã gửi:</strong> {review.comment}
        </div>
      )}

      {readOnly ? null : isReworking ? (
        <div className="space-y-2 pt-1">
          <textarea
            autoFocus
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Mô tả cụ thể phần này cần sửa gì…"
            className="w-full bg-white dark:bg-[#12141A] border border-rose-300 dark:border-rose-500/40 rounded-lg p-2.5 text-[11px] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={confirmRework}
              disabled={!comment.trim()}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-[11px] font-bold transition cursor-pointer"
            >
              Gửi yêu cầu làm lại
            </button>
            <button
              onClick={() => setIsReworking(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <X className="w-3 h-3" /> Hủy
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onReview('approved')}
            disabled={review.status === 'approved'}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-default text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> {approveLabel}
          </button>
          <button
            onClick={() => setIsReworking(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Yêu cầu làm lại
          </button>
        </div>
      )}
    </div>
  );
}
