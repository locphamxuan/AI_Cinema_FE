'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, Clock, Edit3, Image as ImageIcon } from 'lucide-react';
import type { ScriptProjectItem } from './types';

interface CinematicProjectCardProps {
  project: ScriptProjectItem;
  href: string;
}

export function CinematicProjectCard({ project, href }: CinematicProjectCardProps) {
  const [imageError, setImageError] = useState(false);

  // Status configuration matching the warm, friendly creator system
  const getStatusBadge = () => {
    switch (project.status) {
      case 'HANDED_OFF':
        return {
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
          dotClass: 'bg-emerald-500',
          label: 'ĐÃ KÝ HỢP ĐỒNG SẢN XUẤT',
        };
      case 'ADMIN_APPROVED':
        return {
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
          dotClass: 'bg-emerald-500',
          label: 'ADMIN ĐÃ PHÊ DUYỆT',
        };
      case 'NEGOTIATING':
        return {
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
          dotClass: 'bg-purple-500',
          label: 'ĐANG THƯƠNG LƯỢNG VỚI STUDIO',
        };
      case 'IN_REVIEW':
        return {
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
          dotClass: 'bg-amber-500',
          label: 'CHỜ DUYỆT KỊCH BẢN',
        };
      case 'REVISION':
        return {
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
          dotClass: 'bg-rose-500',
          label: 'CẦN CHỈNH SỬA PHÂN CẢNH',
        };
      case 'DRAFT':
      default:
        return {
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          dotClass: 'bg-slate-400',
          label: 'BẢN NHÁP KỊCH BẢN',
        };
    }
  };

  const statusConfig = getStatusBadge();
  const completedEpisodes = project.completedScriptEpisodes ?? project.approvedEpisodes ?? 0;
  const progressPercent =
    project.totalEpisodes > 0
      ? Math.min(100, Math.round((completedEpisodes / project.totalEpisodes) * 100))
      : 0;

  const genresText = project.genreTags.slice(0, 2).join(' / ');
  const imageUrl = project.conceptArtUrl || project.posterUrl;

  return (
    <article className="group relative flex flex-col h-full rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* 16:9 Concept Art / Moodboard Visual */}
      <div className="relative w-full aspect-[16/9] bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {!imageError && imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`Concept art cho ${project.title}`}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400">
            <ImageIcon className="w-10 h-10 mb-2 opacity-50 text-amber-500" />
            <span className="text-xs font-medium">Concept Art / Moodboard</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          {/* Top-Left: Studio Partner Status */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-black/75 backdrop-blur-md border border-slate-200/60 dark:border-white/15 text-slate-800 dark:text-slate-200 shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate max-w-[130px]">
              {project.partnerStudioName || project.studioName || 'Chưa chuyển giao'}
            </span>
          </span>

          {/* Top-Right: Screenplay Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md shadow-xs ${statusConfig.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Card Body Under Visual */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          {/* Title & Short Meta Line */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
              {project.title}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>{genresText}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{project.totalEpisodes} Tập</span>
            </div>
          </div>

          {/* Assignment Line */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>Định hướng bởi:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{project.assignedBy || 'Admin System'}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>Ngày giao: {project.assignedDate || '02/11/2026'}</span>
          </div>

          {/* Screenplay Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Tiến độ kịch bản</span>
              <span className="font-semibold text-slate-900 dark:text-white text-[11px] font-mono">
                {completedEpisodes} / {project.totalEpisodes} tập đã hoàn thiện
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#FFDD00] dark:bg-amber-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer: Script Status Icon + Buy Me a Coffee style pill action button */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between gap-2">
          {/* Status Note */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {project.status === 'HANDED_OFF' || project.status === 'ADMIN_APPROVED' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : project.status === 'REVISION' ? (
              <Edit3 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className="truncate text-[11px]">{project.notes || 'Kịch bản phân cảnh chuẩn OTT'}</span>
          </div>

          {/* Action CTA: Mở Trình Soạn Kịch Bản */}
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition-all group/btn shadow-xs shrink-0 cursor-pointer"
          >
            <span>Soạn Kịch Bản</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
