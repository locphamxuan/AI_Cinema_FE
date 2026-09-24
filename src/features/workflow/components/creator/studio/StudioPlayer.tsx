import type { GenerationJob, GeneratedAsset } from '@/types/workflow';
import { ClipVideo } from '../../shared/ClipVideo';

export interface StudioPlayerProps {
  selectedJob?: GenerationJob;
  selectedAsset?: GeneratedAsset;
}

/** Preview of the selected scene's generated clip, with its basic facts underneath. */
export function StudioPlayer({ selectedJob, selectedAsset }: StudioPlayerProps) {
  const facts = selectedAsset && selectedJob
    ? [
        ['Model', selectedAsset.model],
        ['Thời lượng', selectedAsset.duration_seconds !== null ? `${selectedAsset.duration_seconds} giây` : '—'],
        ['Số mục', `${selectedJob.generation_steps.length}`],
        ['Token đã dùng', `${selectedJob.token_cost}`],
      ]
    : [];
  const isVideo = selectedAsset?.asset_type === 'video' && selectedAsset.url;

  return (
    <figure className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
      <div className="relative aspect-video bg-black">
        {isVideo ? (
          <ClipVideo src={selectedAsset.url} className="w-full h-full object-contain" />
        ) : (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
            {selectedJob ? 'Phân cảnh chưa có clip video.' : 'Chọn một phân cảnh để xem.'}
          </p>
        )}
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
