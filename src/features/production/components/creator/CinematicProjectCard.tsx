'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Feather, Building2, CheckCircle2, Clock, Edit3, Image as ImageIcon } from 'lucide-react';
import type { ScriptProjectItem } from './types';

interface CinematicProjectCardProps {
  project: ScriptProjectItem;
  href: string;
}

export function CinematicProjectCard({ project, href }: CinematicProjectCardProps) {
  const [imageError, setImageError] = useState(false);

  // Status configuration matching the In-house Screenwriter workflow
  const getStatusBadge = () => {
    switch (project.status) {
      case 'HANDED_OFF':
        return {
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dotClass: 'bg-emerald-400',
          label: 'ĐÃ KÝ HỢP ĐỒNG SẢN XUẤT',
        };
      case 'ADMIN_APPROVED':
        return {
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dotClass: 'bg-emerald-400',
          label: 'ADMIN ĐÃ PHÊ DUYỆT',
        };
      case 'NEGOTIATING':
        return {
          badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          dotClass: 'bg-purple-400',
          label: 'ĐANG THƯƠNG LƯỢNG VỚI STUDIO',
        };
      case 'IN_REVIEW':
        return {
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dotClass: 'bg-amber-400',
          label: 'CHỜ DUYỆT KỊCH BẢN',
        };
      case 'REVISION':
        return {
          badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          dotClass: 'bg-rose-400',
          label: 'CẦN CHỈNH SỬA PHÂN CẢNH',
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
  const completedEpisodes = project.completedScriptEpisodes ?? project.approvedEpisodes ?? 0;
  const progressPercent =
    project.totalEpisodes > 0
      ? Math.min(100, Math.round((completedEpisodes / project.totalEpisodes) * 100))
      : 0;

  const genresText = project.genreTags.slice(0, 2).join(' / ');
  const imageUrl = project.conceptArtUrl || project.posterUrl;

  return (
    <article className="group relative flex flex-col h-full rounded-2xl bg-[#111420] border border-white/[0.08] shadow-xl hover:shadow-2xl hover:border-white/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* 16:9 Concept Art / Moodboard Visual */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 overflow-hidden">
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
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500">
            <ImageIcon className="w-10 h-10 mb-2 opacity-50 text-[#E50914]" />
            <span className="text-xs font-medium">Concept Art / Moodboard</span>
          </div>
        )}

        {/* Natural gradient fade into card body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111420] via-[#111420]/50 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          {/* Top-Left: Studio Partner Status */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/60 backdrop-blur-md border border-white/15 text-slate-200 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate max-w-[130px]">
              {project.partnerStudioName || project.studioName || 'Chưa chuyển giao'}
            </span>
          </span>

          {/* Top-Right: Screenplay Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md shadow-sm ${statusConfig.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Card Body Under Visual */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-[#111420]">
        <div className="space-y-3">
          {/* Title & Short Meta Line */}
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

          {/* Assignment Line */}
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-slate-500">Định hướng bởi:</span>
            <span className="font-semibold text-slate-300">{project.assignedBy || 'Admin System'}</span>
            <span className="text-slate-600">•</span>
            <span>Ngày giao: {project.assignedDate || '02/11/2026'}</span>
          </div>

          {/* Screenplay Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Tiến độ kịch bản</span>
              <span className="font-semibold text-white text-[11px] font-mono">
                {completedEpisodes} / {project.totalEpisodes} tập đã hoàn thiện
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

        {/* Footer: Script Status Icon + Sleek Action Button */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
          {/* Status Note */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 truncate">
            {project.status === 'HANDED_OFF' || project.status === 'ADMIN_APPROVED' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : project.status === 'REVISION' ? (
              <Edit3 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span className="truncate text-[11px]">{project.notes || 'Kịch bản phân cảnh chuẩn OTT'}</span>
          </div>

          {/* Action CTA: Mở Trình Soạn Kịch Bản */}
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-[#E50914] text-red-400 hover:text-white border border-red-500/30 hover:border-[#E50914] text-xs font-semibold transition-all duration-200 group/btn shadow-xs shrink-0 cursor-pointer"
          >
            <span>Mở Trình Soạn Kịch Bản</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
