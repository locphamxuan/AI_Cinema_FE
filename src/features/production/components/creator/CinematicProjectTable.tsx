'use client';

import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { STAGE_BADGE, needsWriting } from './CinematicProjectCard';
import type { ScriptProjectItem } from './scriptItems';

export function CinematicProjectTable({ projects, getHref }: { projects: ScriptProjectItem[]; getHref: (p: ScriptProjectItem) => string }) {
  return (
    <div className="w-full overflow-hidden rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-4 px-5">Dự Án</th>
              <th className="py-4 px-4">Thể Loại & Quy Mô</th>
              <th className="py-4 px-4">Kịch Bản</th>
              <th className="py-4 px-4">Studio</th>
              <th className="py-4 px-5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors">
                <td className="py-3.5 px-5">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{p.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Reviewer: {p.reviewerName}</p>
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                  {p.genreTags.slice(0, 2).join(' / ')}
                  <span className="block text-[11px] text-slate-500 font-mono">{p.totalEpisodes} tập</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${STAGE_BADGE[p.stage]}`}>{p.stageLabel}</span>
                  <span className="block mt-1 text-[11px] text-slate-500 font-mono">{p.currentVersion > 0 ? `Bản ${p.currentVersion}` : 'Chưa có bản nào'}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-300 font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate max-w-[140px]">{p.studioName ?? 'Chưa có Studio'}</span>
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <Link href={getHref(p)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-bold">
                    {needsWriting(p) ? 'Soạn Kịch Bản' : 'Xem Dự Án'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
