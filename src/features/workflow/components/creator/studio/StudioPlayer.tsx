import type { GenerationJob, GeneratedAsset } from '@/types/workflow';

export interface StudioPlayerProps {
  selectedJob?: GenerationJob;
  selectedAsset?: GeneratedAsset;
}

const FALLBACK_FRAME = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80';

/** Preview of the selected scene's rendered clip, with its basic facts underneath. */
export function StudioPlayer({ selectedJob, selectedAsset }: StudioPlayerProps) {
  const facts = selectedAsset && selectedJob
    ? [
        ['Độ phân giải', selectedAsset.resolution],
        ['Thời lượng', `${selectedAsset.duration_seconds} giây`],
        ['Dung lượng', `${selectedAsset.file_size_mb} MB`],
        ['Token đã dùng', `${selectedJob.token_cost}`],
      ]
    : [];

  return (
    <figure className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
      <div className="relative aspect-video bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element -- external mock CDN thumbnail, not a static asset */}
        <img
          src={selectedAsset?.thumbnail_url || FALLBACK_FRAME}
          alt={selectedJob ? `Khung hình của ${selectedJob.title}` : 'Chưa chọn phân cảnh'}
          width={1280}
          height={720}
          className="w-full h-full object-cover opacity-90"
        />
        <figcaption className="absolute left-3 top-3 px-2.5 py-1 rounded-md bg-black/60 text-white text-xs">
          {selectedJob ? selectedJob.title : 'Chọn một phân cảnh để xem'}
        </figcaption>
      </div>

      {facts.length > 0 && (
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 py-3 border-t border-slate-100 dark:border-white/5">
          {facts.map(([term, detail]) => (
            <div key={term}>
              <dt className="text-[11px] text-slate-500 dark:text-slate-400">{term}</dt>
              <dd className="text-sm font-medium text-slate-900 dark:text-white tabular-nums">{detail}</dd>
            </div>
          ))}
        </dl>
      )}
    </figure>
  );
}
