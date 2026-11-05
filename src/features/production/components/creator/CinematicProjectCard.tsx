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

  // Status badge config with semantic colors
  const getStatusBadge = () => {
    switch (project.status) {
      case 'PUBLISHED':
        return {
          bg: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30',
          dot: 'bg-[#10B981]',
          label: 'Đang phát hành OTT',
        };
      case 'IN_REVIEW':
        return {
          bg: 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30',
          dot: 'bg-[#F59E0B]',
          label: 'Chờ kiểm định Điều 44',
        };
      case 'REVISION':
        return {
          bg: 'bg-[#E50914]/15 text-[#F87171] border-[#E50914]/30',
          dot: 'bg-[#E50914]',
          label: 'Cần sửa đổi bản dựng',
        };
      case 'DRAFT':
      default:
        return {
          bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
          dot: 'bg-slate-400',
          label: 'Bản nháp kịch bản',
        };
    }
  };

  const statusConfig = getStatusBadge();
  const progressPercent = project.totalEpisodes > 0 
    ? Math.min(100, Math.round((project.approvedEpisodes / project.totalEpisodes) * 100))
    : 0;

  return (
    <article className="group relative flex flex-col h-full rounded-2xl bg-[#131722] border border-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-[#E50914]/10 transition-all duration-300 overflow-hidden">
      {/* 16:9 Cinematic Poster with dark cinematic overlay */}
      <div className="relative w-full aspect-[16/9] bg-[#0A0D14] overflow-hidden">
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
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1E2433] to-[#0A0D14] text-slate-500">
            <Film className="w-10 h-10 mb-2 opacity-40 text-[#E50914]" />
            <span className="text-xs font-medium">Poster Dự Án Phim</span>
          </div>
        )}

        {/* Ambient Dark Gradient Vignette for visual harmony */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-[#131722]/30 to-black/60 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-black/65 backdrop-blur-md text-white border border-white/10 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
            AI CINEMA
          </span>
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border backdrop-blur-md shadow-sm flex items-center gap-1.5 ${statusConfig.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </div>

        {/* Bottom Poster Info (Studio / Total Ep) */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between z-10 pointer-events-none text-[11px] text-slate-300">
          {project.studioName && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 font-medium">
              <Building2 className="w-3 h-3 text-[#F59E0B]" />
              {project.studioName}
            </span>
          )}
          <span className="ml-auto px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 font-bold text-white">
            {project.totalEpisodes} Tập
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          {/* Tags row: Genre tags & AI Tools */}
          <div className="flex flex-wrap items-center gap-1.5">
            {project.genreTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.05] text-slate-300 border border-white/[0.06]"
              >
                {tag}
              </span>
            ))}
            {project.aiTools.map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30"
              >
                <Sparkles className="w-2.5 h-2.5 text-[#A78BFA]" />
                {tool}
              </span>
            ))}
          </div>

          {/* Title */}
          <div>
            <h2 className="text-lg font-bold text-white group-hover:text-[#E50914] transition-colors line-clamp-1">
              {project.title}
            </h2>
            {project.tagline && (
              <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {project.tagline}
              </p>
            )}
          </div>

          {/* Compliance Status info */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{project.complianceBadge.label}</span>
          </div>

          {/* Production Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Tiến độ mùa & tập</span>
              <span className="font-semibold text-white text-[11px]">
                {project.approvedEpisodes} / {project.totalEpisodes} Tập đã duyệt
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#E50914] via-[#F59E0B] to-[#10B981] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400" title="Thời gian cập nhật">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">{project.lastUpdatedText}</span>
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#E50914] text-white hover:text-white border border-white/[0.1] hover:border-[#E50914] text-xs font-semibold transition-all duration-200 group/btn shadow-xs"
          >
            <span>Quản Lý Dự Án & Tập Phim</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
