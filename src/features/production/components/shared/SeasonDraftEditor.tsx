'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import type { NewSeasonInput } from '@/types/production';
import { formatNumber } from '../../lib/format';
import {
  DeadlineQuickFill,
  EpisodeRowsEditor,
  emptyEpisode,
  episodesValid,
  spreadDeadlines,
  toEpisodeInput,
  windowValid,
  type EpisodeDraft,
} from './EpisodeRowsEditor';

/** A season as the Reviewer plans it: price of one episode, release window and episodes (BR-37, BR-60). */
export interface SeasonDraft {
  title: string;
  /** Token paid for one episode of the season; a whole number above 0. */
  cost: number;
  windowStart: string;
  windowEnd: string;
  episodes: EpisodeDraft[];
}

const MAX_EPISODE_COST = 100_000_000;

export function emptySeason(number: number, firstEpisode = 1): SeasonDraft {
  return { title: `Mùa ${number}`, cost: 0, windowStart: '', windowEnd: '', episodes: [emptyEpisode(firstEpisode)] };
}

export function seasonCostValid(cost: number): boolean {
  return Number.isInteger(cost) && cost >= 1 && cost <= MAX_EPISODE_COST;
}

export function seasonValid(season: SeasonDraft): boolean {
  const window = { start: season.windowStart, end: season.windowEnd };
  return seasonCostValid(season.cost) && windowValid(window) && episodesValid(season.episodes, window);
}

export function toSeasonInput(season: SeasonDraft): NewSeasonInput {
  return {
    title: season.title.trim() || undefined,
    episodeProductionCost: season.cost,
    ...(season.windowStart ? { releaseStartDate: season.windowStart } : {}),
    ...(season.windowEnd ? { releaseEndDate: season.windowEnd } : {}),
    episodes: season.episodes.map(toEpisodeInput),
  };
}

/** Title, price, release window and episode rows of one season; `onRemove` shows a remove button. */
export function SeasonDraftEditor({
  season,
  number,
  firstNumber,
  onChange,
  onRemove,
}: {
  season: SeasonDraft;
  number: number;
  firstNumber: number;
  onChange: (season: SeasonDraft) => void;
  onRemove?: () => void;
}) {
  const patch = (changes: Partial<SeasonDraft>) => onChange({ ...season, ...changes });
  const window = { start: season.windowStart, end: season.windowEnd };
  const estimate = season.cost * season.episodes.length;

  return (
    <div className="rounded-xl border border-sky-100 dark:border-white/10 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={season.title}
          onChange={(e) => patch({ title: e.target.value })}
          aria-label={`Tên mùa ${number}`}
          placeholder={`Mùa ${number}`}
          className={`${fieldInputClass} py-1.5 font-semibold`}
        />
        {onRemove && (
          <Button type="button" size="sm" variant="ghost" onClick={onRemove} aria-label={`Bỏ mùa ${number}`}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField label="Đơn giá 1 tập (Token)">
          <input
            type="number"
            min={1}
            max={MAX_EPISODE_COST}
            value={season.cost || ''}
            onChange={(e) => patch({ cost: Number(e.target.value) })}
            aria-label={`Đơn giá 1 tập của mùa ${number}`}
            className={`${fieldInputClass} ${season.cost && !seasonCostValid(season.cost) ? 'border-rose-500' : ''}`}
          />
        </FormField>
        <FormField label="Phát hành từ ngày">
          <input
            type="date"
            value={season.windowStart}
            onChange={(e) => patch({ windowStart: e.target.value })}
            aria-label={`Mùa ${number} phát hành từ`}
            className={fieldInputClass}
          />
        </FormField>
        <FormField label="Đến ngày">
          <input
            type="date"
            min={season.windowStart || undefined}
            value={season.windowEnd}
            onChange={(e) => patch({ windowEnd: e.target.value })}
            aria-label={`Mùa ${number} phát hành đến`}
            className={`${fieldInputClass} ${windowValid(window) ? '' : 'border-rose-500'}`}
          />
        </FormField>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        Dự trù kinh phí mùa = đơn giá × số tập = <strong>{formatNumber(estimate)} Token</strong>. Cấp phí ở tab Phí sản xuất sau khi tạo dự án.
      </p>

      <DeadlineQuickFill
        onApply={(first, gap) => {
          const days = spreadDeadlines(first, gap, season.episodes.length);
          patch({ episodes: season.episodes.map((ep, i) => ({ ...ep, deadline: days[i] })) });
        }}
      />
      <EpisodeRowsEditor
        episodes={season.episodes}
        firstNumber={firstNumber}
        window={window}
        onChange={(episodes) => patch({ episodes })}
      />
    </div>
  );
}
