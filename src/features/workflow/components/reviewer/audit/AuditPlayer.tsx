import type { EpisodePackage } from '@/types/workflow';
import { ClipVideo } from '../../shared/ClipVideo';

export interface AuditPlayerProps {
  pkg: EpisodePackage;
}

/** Preview of the assembled cut (or, before one exists, the first generated clip) with its facts underneath. */
export function AuditPlayer({ pkg }: AuditPlayerProps) {
  const cut = pkg.final_cut;
  const clip = cut ? cut.stream_url : pkg.assets.find((a) => a.asset_type === 'video' && a.url)?.url;
  const facts = [`${pkg.jobs.length} cảnh`, `${pkg.assets.length} kết quả đã tạo`, pkg.total_duration].filter(Boolean);

  return (
    <figure className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151822]">
      <div className="relative aspect-video bg-black">
        {clip ? (
          <ClipVideo src={clip} subtitles={cut?.subtitles} className="w-full h-full object-contain" />
        ) : (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">Tập này chưa có clip video.</p>
        )}
      </div>
      <figcaption className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{facts.join(' · ')}</span>
        {cut && (
          <span className="flex flex-wrap items-center gap-1.5">
            {cut.qualities.map((q) => (
              <span key={q} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 font-mono text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                {q}
              </span>
            ))}
            <span className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-[10px] font-semibold text-purple-700 dark:text-purple-300">
              {cut.subtitles.length > 0 ? `CC · ${cut.subtitles.map((s) => s.label).join(', ')}` : 'Chưa có phụ đề'}
            </span>
          </span>
        )}
      </figcaption>
    </figure>
  );
}
