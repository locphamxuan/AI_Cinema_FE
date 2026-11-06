'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle, Clock, Building2, Film } from 'lucide-react';
import type { StudioProjectItem } from './types';

interface CinematicProjectCardProps {
  project: StudioProjectItem;
  href: string;
}

export function CinematicProjectCard({ project, href }: CinematicProjectCardProps) {
  const [imageError, setImageError] = useState(false);

  // Status configuration matching Cinematic Obsidian Dark Mode specifications
  const getStatusBadge = () => {
    switch (project.status) {
      case 'PUBLISHED':
        return {
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dotClass: 'bg-emerald-400',
          label: 'ĐÃ LÊN SÓNG OTT',
        };
      case 'IN_REVIEW':
        return {
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dotClass: 'bg-amber-400',
          label: 'CHỜ KIỂM ĐỊNH ĐIỀU 44',
        };
      case 'REVISION':
        return {
          badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          dotClass: 'bg-rose-400',
          label: 'CẦN SỬA ĐỔI BẢN DỰNG',
        };
      case 'DRAFT':
      default:
        return {
          badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
          dotClass: 'bg-slate-400',
          label: 'BẢN NHÁP KỊCH BẢN',
        };
    }
  };

  const statusConfig = getStatusBadge();
  const progressPercent =
    project.totalEpisodes > 0
      ? Math.min(100, Math.round((project.approvedEpisodes / project.totalEpisodes) * 100))
      : 0;

  const genresText = project.genreTags.slice(0, 2).join(' • ');

  return (
    <article className="group relative flex flex-col h-full rounded-2xl bg-[#121622] border border-white/[0.08] shadow-xl hover:shadow-2xl hover:border-white/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* 16:9 Cinematic Poster */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 overflow-hidden">
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
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500">
            <Film className="w-10 h-10 mb-2 opacity-50 text-[#E50914]" />
            <span className="text-xs font-medium">Poster Dự Án Phim</span>
          </div>
        )}

        {/* Natural gradient fade into the card body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-[#121622]/40 to-transparent pointer-events-none" />

        {/* Top Badges (No ugly black AI Cinema banner) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          {/* Top-Left: Partner Studio Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/60 backdrop-blur-md border border-white/15 text-slate-200 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{project.studioName || 'Studio Partner'}</span>
          </span>

          {/* Top-Right: Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md shadow-sm ${statusConfig.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Card Body Under Poster */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-[#121622]">
        <div className="space-y-3">
          {/* Title & Short Meta Line (No crowded AI tags, no long synopsis) */}
          <div>
            <h2 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
              {project.title}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>{genresText}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-semibold">{project.totalEpisodes} Tập</span>
            </div>
          </div>

          {/* Distribution Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Tiến độ phân phối</span>
              <span className="font-semibold text-white text-[11px] font-mono">
                {project.approvedEpisodes} / {project.totalEpisodes} tập đã phát hành
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

        {/* Footer: Compliance Badge + Sleek Action Button */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
          {/* Compliance Check Status */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Đạt kiểm định Điều 44</span>
          </div>

          {/* Action CTA */}
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-[#E50914] text-red-400 hover:text-white border border-red-500/30 hover:border-[#E50914] text-xs font-semibold transition-all duration-200 group/btn shadow-xs shrink-0"
          >
            <span>Quản Lý Phim</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
