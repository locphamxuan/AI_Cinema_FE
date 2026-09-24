import type { EpisodePackage } from '@/types/workflow';
import { statusDotClass } from './StatusBadge';
import { episodeLabel, spansSeasons } from '@/features/workflow/lib/episodeLabel';

export interface EpisodeSwitcherProps {
  episodes: EpisodePackage[];
  selectedId?: string;
  onSelect: (episodeId: string) => void;
}

/** Row of compact episode chips ("Tập 1", or "Mùa 2 · Tập 1" when the project has several seasons) with a status dot each. */
export function EpisodeSwitcher({ episodes, selectedId, onSelect }: EpisodeSwitcherProps) {
  const multiSeason = spansSeasons(episodes);

  return (
    <div role="group" aria-label="Chọn tập phim" className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {episodes.map((ep) => {
        const isSelected = ep.id === selectedId;
        return (
          <button
            key={ep.id}
            type="button"
            onClick={() => onSelect(ep.id)}
            aria-pressed={isSelected}
            title={ep.title}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-2 border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
              isSelected
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : statusDotClass(ep.status)}`} aria-hidden="true" />
            {episodeLabel(ep, multiSeason)}
          </button>
        );
      })}
    </div>
  );
}
