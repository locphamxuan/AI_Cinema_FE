import { Film, BadgeCheck } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';

export interface AuditPlayerProps {
  pkg: EpisodePackage;
  certificationId?: string;
}

export function AuditPlayer({ pkg, certificationId }: AuditPlayerProps) {
  return (
    <div className="bg-white dark:bg-[#161922] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
      <div className="relative aspect-video bg-black flex items-center justify-center group">
        {/* eslint-disable-next-line @next/next/no-img-element -- external mock CDN thumbnail, not a static asset */}
        <img src={pkg.thumbnail_url} alt={pkg.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white">
          <BadgeCheck className="w-4 h-4 text-emerald-400" />
          <span>AI Watermark ID: {certificationId || 'AI-VN-2026-CINEMA-1042'}</span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/80">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-ruby text-white text-[11px] font-bold">4K HDR</span>
            <span>60 FPS</span>
            <span>H.265 / HEVC</span>
          </div>
          <div>Thời lượng: {pkg.total_duration}</div>
        </div>

        <div className="absolute w-16 h-16 rounded-full bg-ruby/90 flex items-center justify-center text-white shadow-lg cursor-pointer transform group-hover:scale-110 transition">
          <Film className="w-7 h-7 ml-0.5" />
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Video Draft Render hoàn tất ({pkg.assets.length} Phân cảnh)</span>
        </div>
        <span>Tỷ lệ khung hình: 16:9 Cinema DCI</span>
      </div>
    </div>
  );
}
