import { Play } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';

export interface AuditPlayerProps {
  pkg: EpisodePackage;
}

/** Preview frame of the rendered episode with its basic technical facts underneath. */
export function AuditPlayer({ pkg }: AuditPlayerProps) {
  const facts = [`${pkg.assets.length} phân cảnh`, pkg.total_duration, '4K · 60 fps'].filter(Boolean);

  return (
    <figure className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151822]">
      <div className="relative aspect-video bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element -- external mock CDN thumbnail, not a static asset */}
        <img src={pkg.thumbnail_url} alt={`Khung hình của ${pkg.title}`} width={1280} height={720} className="w-full h-full object-cover opacity-90" />
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="w-14 h-14 rounded-full bg-black/55 text-white flex items-center justify-center">
            <Play className="w-6 h-6 ml-0.5 fill-current" />
          </span>
        </span>
      </div>
      <figcaption className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{facts.join(' · ')}</span>
      </figcaption>
    </figure>
  );
}
