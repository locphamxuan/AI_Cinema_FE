'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, Edit3, Image as ImageIcon, Building2 } from 'lucide-react';
import type { ScriptProjectItem } from './types';

interface CinematicProjectTableProps {
  projects: ScriptProjectItem[];
  getHref: (p: ScriptProjectItem) => string;
}

export function CinematicProjectTable({ projects, getHref }: CinematicProjectTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-4 px-5">Dự Án Kịch Bản</th>
              <th className="py-4 px-4">Thể Loại & Quy Mô</th>
              <th className="py-4 px-4">Tiến Độ Kịch Bản</th>
              <th className="py-4 px-4">Trạng Thái Thẩm Định</th>
              <th className="py-4 px-4">Studio Tiếp Nhận</th>
              <th className="py-4 px-5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
            {projects.map((p) => {
              const completedEpisodes = p.completedScriptEpisodes ?? p.approvedEpisodes ?? 0;
              const progressPercent =
                p.totalEpisodes > 0
                  ? Math.min(100, Math.round((completedEpisodes / p.totalEpisodes) * 100))
                  : 0;

              return (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Script Project Name & Concept Art */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-200 dark:border-white/10">
                        {p.conceptArtUrl || p.posterUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.conceptArtUrl || p.posterUrl}
                            alt={p.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>Định hướng:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{p.assignedBy || 'Admin System'}</span>
                        </p>
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
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.06]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {p.totalEpisodes} Tập phân cảnh
                      </span>
                    </div>
                  </td>

                  {/* Script Progress */}
                  <td className="py-3.5 px-4 min-w-[140px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-900 dark:text-white font-mono">
                          {completedEpisodes} / {p.totalEpisodes} Tập
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono">{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#FFDD00] dark:bg-amber-400"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Review Status */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-white border border-slate-200 dark:border-white/10">
                        {p.statusLabel}
                      </span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {p.status === 'HANDED_OFF' || p.status === 'ADMIN_APPROVED' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        ) : p.status === 'REVISION' ? (
                          <Edit3 className="w-3 h-3 text-rose-500 shrink-0" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                        <span className="truncate max-w-[150px]">{p.notes || 'Kịch bản phân cảnh chuẩn OTT'}</span>
                      </p>
                    </div>
                  </td>

                  {/* Studio Partner */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-300 text-xs">
                      <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate max-w-[140px] font-semibold">
                        {p.partnerStudioName || p.studioName || 'Chưa chuyển giao'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {p.contractStatus || 'Chờ đàm phán'}
                    </p>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={getHref(p)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <span>Soạn Kịch Bản</span>
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
