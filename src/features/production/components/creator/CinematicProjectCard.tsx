'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Sparkles, ArrowRight, ShieldCheck, Film, Building2 } from 'lucide-react';
import type { StudioProjectItem } from './types';

interface CinematicProjectCardProps {
  project: StudioProjectItem;
  href: string;
}

export function CinematicProjectCard({ project, href }: CinematicProjectCardProps) {
  const [imageError, setImageError] = useState(false);

  // Soft Badge status config with pastel tones in light mode & neon in dark mode
  const getStatusBadge = () => {
    switch (project.status) {
      case 'PUBLISHED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#10B981]/15 dark:text-[#34D399] dark:border-[#10B981]/30',
          dot: 'bg-emerald-600 dark:bg-[#10B981]',
          label: 'Đang phát hành OTT',
        };
      case 'IN_REVIEW':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#F59E0B]/15 dark:text-[#FBBF24] dark:border-[#F59E0B]/30',
          dot: 'bg-amber-600 dark:bg-[#F59E0B]',
          label: 'Chờ kiểm định Điều 44',
        };
      case 'REVISION':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#E50914]/15 dark:text-[#F87171] dark:border-[#E50914]/30',
          dot: 'bg-rose-600 dark:bg-[#E50914]',
          label: 'Cần sửa đổi bản dựng',
        };
      case 'DRAFT':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30',
          dot: 'bg-slate-500 dark:bg-slate-400',
          label: 'Bản nháp kịch bản',
        };
    }
  };

  const statusConfig = getStatusBadge();
  const progressPercent = project.totalEpisodes > 0 
    ? Math.min(100, Math.round((project.approvedEpisodes / project.totalEpisodes) * 100))
    : 0;

  return (
    <article className="group relative flex flex-col h-full rounded-2xl bg-white dark:bg-[#131722] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md dark:hover:border-white/20 dark:hover:shadow-2xl dark:hover:shadow-[#E50914]/10 transition-all duration-300 overflow-hidden">
      {/* 16:9 Cinematic Poster */}
      <div className="relative w-full aspect-[16/9] bg-slate-900 overflow-hidden rounded-t-2xl">
        {!imageError && project.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.posterUrl}
            alt={project.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-slate-400">
            <Film className="w-10 h-10 mb-2 opacity-40 text-indigo-400 dark:text-[#E50914]" />
            <span className="text-xs font-medium">Poster Dự Án Phim</span>
          </div>
        )}

        {/* Ambient Dark Gradient Vignette for visual harmony */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-black/65 backdrop-blur-md text-white border border-white/15 shadow-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-[#E50914]" />
            AI CINEMA
          </span>
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border backdrop-blur-md shadow-xs flex items-center gap-1.5 ${statusConfig.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </div>

        {/* Bottom Poster Info (Studio / Total Ep) */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between z-10 pointer-events-none text-[11px] text-slate-200">
          {project.studioName && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 font-medium">
              <Building2 className="w-3 h-3 text-amber-400" />
              {project.studioName}
            </span>
          )}
          <span className="ml-auto px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 font-bold text-white">
            {project.totalEpisodes} Tập
          </span>
        </div>
      </div>

      {/* Card Content Body: Clean Modern Light Mode / Dark Mode */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-white dark:bg-[#131722] rounded-b-2xl">
        <div className="space-y-3">
          {/* Tags row: Genre tags & AI Tools */}
          <div className="flex flex-wrap items-center gap-1.5">
            {project.genreTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.06]"
              >
                {tag}
              </span>
            ))}
            {project.aiTools.map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-[#8B5CF6]/15 text-indigo-700 dark:text-[#C4B5FD] border border-indigo-100 dark:border-[#8B5CF6]/30"
              >
                <Sparkles className="w-2.5 h-2.5 text-indigo-500 dark:text-[#A78BFA]" />
                {tool}
              </span>
            ))}
          </div>

          {/* Title & Tagline */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#E50914] transition-colors line-clamp-1">
              {project.title}
            </h2>
            {project.tagline && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {project.tagline}
              </p>
            )}
          </div>

          {/* Compliance Status info */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{project.complianceBadge.label}</span>
          </div>

          {/* Production Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Tiến độ mùa & tập</span>
              <span className="font-semibold text-slate-800 dark:text-white text-[11px]">
                {project.approvedEpisodes} / {project.totalEpisodes} Tập đã duyệt
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 dark:from-[#E50914] dark:via-[#F59E0B] dark:to-[#10B981] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400" title="Thời gian cập nhật">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px]">{project.lastUpdatedText}</span>
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-600 dark:bg-white/[0.06] dark:hover:bg-[#E50914] dark:text-white dark:border-white/[0.1] dark:hover:border-[#E50914] text-xs font-semibold transition-all duration-200 group/btn shadow-xs"
          >
            <span>Quản Lý Dự Án & Tập Phim</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
