'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, Building2, CheckCircle2, Clapperboard, Clock, FileCheck2, Film, FolderOpen, type LucideIcon } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import type { QueueItem, QueueStage } from '../reviewQueue';

export const STAGE_STYLE: Record<QueueStage, { badge: string; icon: LucideIcon; action: string; button: string }> = {
  MASTER_AUDIT: { badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30', icon: Clapperboard, action: 'Mở Bàn Thẩm Định', button: 'bg-[#121212] hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200' },
  SCRIPT_PENDING: { badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30', icon: FileCheck2, action: 'Thẩm Định Kịch Bản', button: 'bg-[#121212] hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200' },
  STUDIO_REVISING: { badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', icon: AlertTriangle, action: 'Xem Yêu Cầu Sửa', button: 'border border-slate-300 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200' },
  FINAL_CONFIRMED: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30', icon: CheckCircle2, action: 'Xem Tập Phim', button: 'border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  PROJECT: { badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', icon: FolderOpen, action: 'Mở Dự Án', button: 'border border-slate-300 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200' },
};

export const episodeText = (item: QueueItem) => (item.episodeNumber === null ? `${item.totalEpisodes} tập` : `Tập ${item.episodeNumber} / ${item.totalEpisodes}`);

/** One piece of the Reviewer's work: the film or script, who made it, and the way in. */
export function ReviewerQueueCard({ item }: { item: QueueItem }) {
  const style = STAGE_STYLE[item.stage];
  const Icon = style.icon;
  return (
    <article className="group relative flex flex-col h-full rounded-3xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md transition-all overflow-hidden">
      <div className="relative w-full aspect-[16/9] bg-slate-900 overflow-hidden">
        {item.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <Film className="w-10 h-10 opacity-60" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-black/75 backdrop-blur-md text-slate-800 dark:text-white">
          <Building2 className="w-3 h-3 text-slate-700 dark:text-slate-200" />
          <span className="truncate max-w-[130px]">{item.studioName}</span>
        </span>
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-black/75 backdrop-blur-md text-white border border-white/15">{episodeText(item)}</span>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white">
          <span className="font-semibold text-white/90 flex items-center gap-1">
            <Clock className="w-3 h-3 text-white/70" /> {formatDateTime(item.updatedAt)}
          </span>
          <span className="font-bold uppercase tracking-wider text-amber-300 text-[10px] truncate max-w-[50%]">{item.genre}</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
            <Icon className="w-3 h-3" aria-hidden="true" /> {item.stageLabel}
          </span>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">{item.title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Biên kịch: <strong className="text-slate-800 dark:text-slate-200">{item.creatorName}</strong>
          </p>
        </div>
        <Link href={item.href} className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all ${style.button}`}>
          {style.action} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
