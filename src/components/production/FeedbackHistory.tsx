'use client';

import { FeedbackItem } from '@/types/production';
import { formatDate } from '@/lib/utils';

interface FeedbackHistoryProps {
  feedbacks: FeedbackItem[];
  title?: string;
}

export default function FeedbackHistory({ feedbacks, title = 'Lịch Sử Trao Đổi Maker - Checker' }: FeedbackHistoryProps) {
  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-center text-xs text-slate-500 dark:text-zinc-400">
        Chưa có lịch sử phản hồi nào cho tập phim này.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          {title} ({feedbacks.length})
        </h4>
      </div>

      <div className="space-y-2.5">
        {feedbacks.map((item) => {
          const isReviewer = item.role === 'reviewer';
          const isRejection = item.type === 'plan_changes' || item.type === 'content_changes';

          return (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                isRejection
                  ? 'bg-amber-500/10 border-amber-500/30 text-slate-900 dark:text-amber-100'
                  : isReviewer
                  ? 'bg-ruby/5 dark:bg-ruby/10 border-ruby/25 text-slate-900 dark:text-zinc-100'
                  : 'bg-neon/5 dark:bg-neon/10 border-neon/25 text-slate-900 dark:text-zinc-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      isReviewer
                        ? 'bg-ruby text-white'
                        : 'bg-neon text-white'
                    }`}
                  >
                    {isReviewer ? 'Reviewer' : 'Creator'}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    {item.author}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {formatDate(item.createdAt, true)}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-700 dark:text-zinc-300 whitespace-pre-line">
                {item.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
