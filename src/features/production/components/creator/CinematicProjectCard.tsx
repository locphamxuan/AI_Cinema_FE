'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Image as ImageIcon } from 'lucide-react';
import { SCRIPT_STEPS, type ScriptProjectItem } from './scriptItems';

export const STAGE_BADGE: Record<ScriptProjectItem['stage'], string> = {
  HANDED_OFF: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  NEGOTIATING: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
  ADMIN_REVIEW: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
  IN_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  REVISION: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

export const needsWriting = (item: ScriptProjectItem) => item.stage === 'DRAFT' || item.stage === 'REVISION';

/** One project given to the Creator: where its script stands and the way into the script tab. */
export function CinematicProjectCard({ project, href }: { project: ScriptProjectItem; href: string }) {
  const percent = Math.round((project.step / SCRIPT_STEPS) * 100);
  return (
    <article className="group relative flex flex-col h-full rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all overflow-hidden">
      <div className="relative w-full aspect-[16/9] bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {project.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.posterUrl} alt={`Poster ${project.title}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <ImageIcon className="w-10 h-10 opacity-50 text-amber-500" aria-hidden="true" />
          </div>
        )}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-black/75 backdrop-blur-md text-slate-800 dark:text-white">
            <Building2 className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate max-w-[110px]">{project.studioName ?? 'Chưa có Studio'}</span>
          </span>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border backdrop-blur-md ${STAGE_BADGE[project.stage]}`}>{project.stageLabel}</span>
        </div>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{project.title}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              {project.genreTags.slice(0, 2).join(' / ')} • {project.totalEpisodes} tập
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Reviewer: <span className="font-semibold text-slate-800 dark:text-slate-200">{project.reviewerName}</span>
          </p>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Tiến độ kịch bản</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{project.currentVersion > 0 ? `Bản ${project.currentVersion}` : 'Chưa có bản nào'}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
              <div className="h-full rounded-full bg-[#FFDD00] dark:bg-amber-400 transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex justify-end">
          <Link href={href} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-bold">
            {needsWriting(project) ? 'Soạn Kịch Bản' : 'Xem Dự Án'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
