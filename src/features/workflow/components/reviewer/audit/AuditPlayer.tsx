import type { EpisodePackage } from '@/types/workflow';
import { ClipVideo } from '../../shared/ClipVideo';

export interface AuditPlayerProps {
  pkg: EpisodePackage;
}

/** Preview of the episode's first generated clip with its basic facts underneath. */
export function AuditPlayer({ pkg }: AuditPlayerProps) {
  const clip = pkg.assets.find((a) => a.asset_type === 'video' && a.url);
  const facts = [`${pkg.jobs.length} phân cảnh`, `${pkg.assets.length} kết quả sinh`, pkg.total_duration].filter(Boolean);

  return (
    <figure className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151822]">
      <div className="relative aspect-video bg-black">
        {clip ? (
          <ClipVideo src={clip.url} className="w-full h-full object-contain" />
        ) : (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">Tập này chưa có clip video.</p>
        )}
      </div>
      <figcaption className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{facts.join(' · ')}</span>
      </figcaption>
    </figure>
  );
}
