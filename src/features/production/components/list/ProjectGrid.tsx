'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Film } from 'lucide-react';
import type { MovieStatus, ProjectSummary } from '@/types/production';
import { MOVIE_STATUS } from '../../lib/labels';
import { formatDateTime } from '@/lib/format';
import { productionPaths, type ProductionBase } from '../../lib/routes';
import { StatusPill } from '@/components/data/ui';

const STATUS_GRADIENTS: Record<MovieStatus, string> = {
  DRAFT: 'from-slate-600 via-slate-700 to-slate-800',
  ASSIGNED: 'from-blue-600 via-sky-600 to-slate-900',
  IN_PRODUCTION: 'from-sky-700 via-cyan-600 to-sky-900',
  UNDER_REVISION: 'from-amber-600 via-orange-600 to-slate-900',
  COMPLETED: 'from-emerald-600 via-teal-600 to-slate-900',
  CANCELLED: 'from-rose-700 via-red-800 to-slate-950',
};

const STRIPES = 'repeating-linear-gradient(45deg, transparent, transparent 16px, white 16px, white 18px)';

/** The project poster, or a gradient by status when there is none or it fails to load. */
function ProjectPoster({ title, posterUrl, status }: { title: string; posterUrl: string | null; status: MovieStatus }) {
  const [loadError, setLoadError] = useState(false);

  if (posterUrl && !loadError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={posterUrl}
        alt={title}
        onError={() => setLoadError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
    );
  }

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${STATUS_GRADIENTS[status]} flex items-center justify-center`}>
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: STRIPES }} />
      <div className="relative w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 shadow-lg">
        <Film className="w-7 h-7 text-white/80" aria-hidden="true" />
      </div>
    </div>
  );
}

/** Poster cards of the projects; a Creator sees who reviews each one, the others who creates it. */
export function ProjectGrid({ projects, base }: { projects: ProjectSummary[]; base: ProductionBase }) {
  const isCreator = base === '/creator';
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {projects.map((p) => {
        const inCharge = (isCreator ? p.reviewer : p.creator)?.fullName ?? null;
        return (
          <li key={p.id}>
            <Link
              href={productionPaths.project(base, p.id)}
              className="group flex flex-col h-full rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-card hover:border-sky-400/60 dark:hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/10 dark:hover:shadow-sky-900/30 transition-all duration-300 overflow-hidden"
            >
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                <ProjectPoster title={p.title} posterUrl={p.posterUrl} status={p.status} />
                <div className="absolute top-3 left-3 z-10 rounded-full bg-background/90 shadow-sm backdrop-blur-sm">
                  <StatusPill {...MOVIE_STATUS[p.status]} />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex items-center justify-between z-10">
                  <span className="text-white text-[11px] font-bold px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 shadow-sm">
                    {p._count.episodes} tập
                  </span>
                  <span
                    title="Cập nhật lần cuối"
                    className="text-white text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 shadow-md flex items-center gap-1.5"
                  >
                    {formatDateTime(p.lastActivityAt)}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-sky-700 dark:group-hover:text-sky-500 transition-colors">
                  {p.title}
                </h2>
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  {p.studio && (
                    <p className="flex items-center gap-2">
                      <span className="truncate font-medium">{p.studio.name}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="w-4 h-4 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-500 font-bold flex items-center justify-center text-xs shrink-0"
                    >
                      {inCharge?.charAt(0) ?? '?'}
                    </span>
                    <span className="truncate">
                      {isCreator ? 'Reviewer: ' : 'Creator: '}
                      <b className="font-semibold">{inCharge ?? 'Chưa giao'}</b>
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
