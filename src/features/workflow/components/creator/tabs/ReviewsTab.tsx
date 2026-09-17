import { MessageSquare, ShieldCheck } from 'lucide-react';
import type { ReviewLog } from '@/types/workflow';

export interface ReviewsTabProps {
  episodeReviews: ReviewLog[];
}

export function ReviewsTab({ episodeReviews }: ReviewsTabProps) {
  return (
    <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Nhật Ký Thẩm Định Của Reviewer</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Lịch sử phê duyệt và hướng dẫn chỉnh sửa từ Checker</p>
        </div>
      </div>

      {episodeReviews.length > 0 ? (
        <div className="space-y-3">
          {episodeReviews.map((rev) => (
            <div key={rev.id} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  {rev.reviewer_name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    rev.decision === 'approved'
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                      : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                  }`}
                >
                  {rev.decision === 'approved' ? 'ĐÃ PHÊ DUYỆT' : 'YÊU CẦU CHỈNH SỬA'}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-[#12141A] p-2.5 rounded-lg border border-slate-200 dark:border-white/10 leading-relaxed">
                {rev.feedback_notes}
              </p>
              {rev.quota_granted && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-mono font-medium">⚡ Quota cấp: +{rev.quota_granted} Tokens</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">Chưa có nhật ký thẩm định nào cho tập phim này.</div>
      )}
    </div>
  );
}
