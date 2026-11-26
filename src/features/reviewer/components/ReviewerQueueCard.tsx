'use client';

import Link from 'next/link';
import { formatDateTime } from '@/lib/format';
import type { QueueItem, QueueStage } from '../reviewQueue';

export const STAGE_STYLE: Record<QueueStage, { badge: string; action: string; button: string }> = {
  MASTER_AUDIT: { badge: 'bg-viz-1/10 text-violet-800 border-viz-1/30 dark:text-violet-200', action: 'Mở trang duyệt phim', button: 'bg-primary hover:bg-primary/90 text-primary-foreground' },
  SCRIPT_PENDING: { badge: 'bg-viz-2/10 text-amber-800 border-viz-2/30 dark:text-amber-200', action: 'Duyệt kịch bản', button: 'bg-primary hover:bg-primary/90 text-primary-foreground' },
  STUDIO_REVISING: { badge: 'bg-viz-5/10 text-pink-800 border-viz-5/30 dark:text-pink-200', action: 'Xem yêu cầu sửa', button: 'border border-input hover:bg-muted/60 text-foreground' },
  FINAL_CONFIRMED: { badge: 'bg-viz-3/10 text-teal-800 border-viz-3/30 dark:text-teal-200', action: 'Xem tập phim', button: 'border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  PROJECT: { badge: 'bg-slate-100 text-secondary-foreground border-slate-200 dark:bg-slate-800 dark:border-slate-700', action: 'Mở dự án', button: 'border border-input hover:bg-muted/60 text-secondary-foreground' },
};

export const episodeText = (item: QueueItem) => (item.episodeNumber === null ? `${item.totalEpisodes} tập` : `Tập ${item.episodeNumber} / ${item.totalEpisodes}`);

/** One piece of the Reviewer's work: the film or script, who made it, and the way in. */
export function ReviewerQueueCard({ item }: { item: QueueItem }) {
  const style = STAGE_STYLE[item.stage];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-xs ring-1 ring-foreground/10 transition-shadow hover:shadow-md">
      <div className="relative w-full aspect-[16/9] bg-slate-900 overflow-hidden">
        {item.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Chưa có ảnh bìa</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-card backdrop-blur-md text-foreground">
          <span className="truncate max-w-[130px]">{item.studioName}</span>
        </span>
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] tabular-nums font-bold bg-black/75 backdrop-blur-md text-white border border-white/15">{episodeText(item)}</span>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white">
          <span className="font-semibold text-white/90 flex items-center gap-1">
            {formatDateTime(item.updatedAt)}
          </span>
          <span className="font-bold text-amber-300 text-[10px] truncate max-w-[50%]">{item.genre}</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
            {item.stageLabel}
          </span>
          <h3 className="line-clamp-1 font-display text-base font-semibold text-foreground">{item.title}</h3>
          <p className="text-xs text-muted-foreground">
            Biên kịch: <strong className="text-foreground">{item.creatorName}</strong>
          </p>
        </div>
        <Link href={item.href} className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all ${style.button}`}>
          {style.action}
        </Link>
      </div>
    </article>
  );
}
