'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Film, Building2 } from 'lucide-react';
import type { StudioProjectItem } from './types';

interface CinematicProjectTableProps {
  projects: StudioProjectItem[];
  getHref: (p: StudioProjectItem) => string;
}

export function CinematicProjectTable({ projects, getHref }: CinematicProjectTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[#131722] border border-white/[0.08] shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-4 px-5">Tác Phẩm & Studio</th>
              <th className="py-4 px-4">Thể Loại & Tool AI</th>
              <th className="py-4 px-4">Tiến Độ Tập</th>
              <th className="py-4 px-4">Trạng Thái & Điều 44</th>
              <th className="py-4 px-4">Cập Nhật</th>
              <th className="py-4 px-5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {projects.map((p) => {
              const progressPercent = p.totalEpisodes > 0 
                ? Math.min(100, Math.round((p.approvedEpisodes / p.totalEpisodes) * 100))
                : 0;

              return (
                <tr
                  key={p.id}
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Movie & Studio */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-[#0A0D14] shrink-0 border border-white/10">
                        {p.posterUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.posterUrl}
                            alt={p.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Film className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm group-hover:text-red-400 transition-colors truncate">
                          {p.title}
                        </p>
                        {p.studioName && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-[#F59E0B]" />
                            {p.studioName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Genre & AI Tools */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap gap-1">
                        {p.genreTags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.05] text-slate-300 border border-white/[0.06]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {p.aiTools.slice(0, 2).map((tool) => (
                          <span
                            key={tool}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-[#A78BFA]" />
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Episode Progress */}
                  <td className="py-3.5 px-4 min-w-[140px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white">
                          {p.approvedEpisodes} / {p.totalEpisodes} Tập
                        </span>
                        <span className="text-slate-400">{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#E50914]"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status & Compliance */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/[0.06] text-white border border-white/10">
                        {p.statusLabel}
                      </span>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{p.complianceBadge.label}</span>
                      </p>
                    </div>
                  </td>

                  {/* Updated */}
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {p.lastUpdatedText}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={getHref(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-gradient-to-r hover:from-[#E50914] hover:to-[#8B5CF6] text-white border border-white/[0.1] hover:border-transparent text-xs font-semibold transition-all duration-200 shadow-xs"
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
