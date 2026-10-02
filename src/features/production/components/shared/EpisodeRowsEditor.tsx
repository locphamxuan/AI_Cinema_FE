'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';

export interface EpisodeDraft {
  title: string;
  /** Minutes; the API takes seconds. No platform limit (BR-31), only the API's 12 h. */
  minutes: number;
}

export const MAX_EPISODE_MINUTES = 12 * 60;

export function emptyEpisode(n: number): EpisodeDraft {
  return { title: `Tập ${n}`, minutes: 20 };
}

export function toEpisodeInput(e: EpisodeDraft) {
  return { title: e.title.trim(), targetDurationSeconds: Math.round(e.minutes * 60) };
}

export function episodesValid(list: EpisodeDraft[]): boolean {
  return list.length > 0 && list.every((e) => e.title.trim() && e.minutes > 0 && e.minutes <= MAX_EPISODE_MINUTES);
}

/** Rows of episode title + target length, as the Reviewer plans a season. */
export function EpisodeRowsEditor({
  episodes,
  onChange,
  firstNumber = 1,
}: {
  episodes: EpisodeDraft[];
  onChange: (episodes: EpisodeDraft[]) => void;
  firstNumber?: number;
}) {
  const update = (i: number, patch: Partial<EpisodeDraft>) => onChange(episodes.map((e, j) => (j === i ? { ...e, ...patch } : e)));

  return (
    <div className="space-y-2">
      {episodes.map((ep, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-8 shrink-0 text-[11px] text-slate-500 text-right">#{firstNumber + i}</span>
          <input
            value={ep.title}
            onChange={(e) => update(i, { title: e.target.value })}
            aria-label={`Tên tập ${firstNumber + i}`}
            maxLength={255}
            className={`${fieldInputClass} py-1.5`}
          />
          <input
            type="number"
            min={1}
            max={MAX_EPISODE_MINUTES}
            value={ep.minutes}
            onChange={(e) => update(i, { minutes: Number(e.target.value) })}
            aria-label={`Thời lượng mục tiêu tập ${firstNumber + i} (phút)`}
            className={`${fieldInputClass} py-1.5 w-20 text-center`}
          />
          <span className="text-[11px] text-slate-500 shrink-0">phút</span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={episodes.length <= 1}
            onClick={() => onChange(episodes.filter((_, j) => j !== i))}
            aria-label={`Bỏ tập ${firstNumber + i}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="secondary" onClick={() => onChange([...episodes, emptyEpisode(firstNumber + episodes.length)])}>
        <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm tập
      </Button>
    </div>
  );
}
