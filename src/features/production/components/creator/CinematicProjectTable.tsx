'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Film, Building2 } from 'lucide-react';
import type { StudioProjectItem } from './types';

interface CinematicProjectTableProps {
  projects: StudioProjectItem[];
  getHref: (p: StudioProjectItem) => string;
}

export function CinematicProjectTable({ projects, getHref }: CinematicProjectTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/[0.08] shadow-sm dark:shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-4 px-5">Tác Phẩm & Studio</th>
              <th className="py-4 px-4">Thể Loại & Quy Mô</th>
              <th className="py-4 px-4">Tiến Độ Phát Hành</th>
              <th className="py-4 px-4">Trạng Thái & Điều 44</th>
              <th className="py-4 px-4">Cập Nhật</th>
              <th className="py-4 px-5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
            {projects.map((p) => {
              const progressPercent = p.totalEpisodes > 0 
                ? Math.min(100, Math.round((p.approvedEpisodes / p.totalEpisodes) * 100))
                : 0;

              return (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Movie & Studio */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200 dark:border-white/10">
                        {p.posterUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.posterUrl}
                            alt={p.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Film className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-red-400 transition-colors truncate">
                          {p.title}
                        </p>
                        {p.studioName && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-amber-500" />
                            {p.studioName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Genre & Episodes */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap gap-1">
                        {p.genreTags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.06]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {p.totalEpisodes} Tập
                      </span>
                    </div>
                  </td>

                  {/* Episode Progress */}
                  <td className="py-3.5 px-4 min-w-[140px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-900 dark:text-white font-mono">
                          {p.approvedEpisodes} / {p.totalEpisodes} Tập
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono">{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 dark:from-[#E50914] dark:via-[#F59E0B] dark:to-[#10B981]"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status & Compliance */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-white border border-slate-200 dark:border-white/10">
                        {p.statusLabel}
                      </span>
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[160px]">Đạt kiểm định Điều 44</span>
                      </p>
                    </div>
                  </td>

                  {/* Updated */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                    {p.lastUpdatedText}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={getHref(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-600 dark:bg-red-600/10 dark:hover:bg-[#E50914] dark:text-red-400 dark:hover:text-white dark:border-red-500/30 text-xs font-semibold transition-all duration-200 shadow-xs"
                    >
                      <span>Quản lý</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
