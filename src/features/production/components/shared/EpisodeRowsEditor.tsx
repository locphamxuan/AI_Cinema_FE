'use client';

import { useState } from 'react';
import { CalendarRange, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { getTodayDateString } from '@/lib/dateUtils';
import { addDays } from '../../lib/format';

export interface EpisodeDraft {
  title: string;
  /** Minutes; the API takes seconds. No platform limit (BR-31), only the API's 12 h. */
  minutes: number;
  /** YYYY-MM-DD: when the episode must be done; the studio due date cannot be later. */
  milestone: string;
}

export const MAX_EPISODE_MINUTES = 12 * 60;

export function emptyEpisode(n: number, milestone = ''): EpisodeDraft {
  return { title: `Tập ${n}`, minutes: 20, milestone };
}

export function toEpisodeInput(e: EpisodeDraft) {
  return { title: e.title.trim(), targetDurationSeconds: Math.round(e.minutes * 60), milestoneDate: e.milestone };
}

/** A milestone is required and cannot be in the past (YYYY-MM-DD compares as text). */
export const milestoneValid = (milestone: string) => !!milestone && milestone >= getTodayDateString();

export function episodesValid(list: EpisodeDraft[]): boolean {
  return (
    list.length > 0 &&
    list.every((e) => e.title.trim() && e.minutes > 0 && e.minutes <= MAX_EPISODE_MINUTES && milestoneValid(e.milestone))
  );
}

/** Milestones `gapDays` apart starting on `first`, one per episode. */
export function spreadMilestones(first: string, gapDays: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDays(first, i * gapDays));
}

/** Rows of episode title + target length + milestone, as the Reviewer plans a season. */
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
  const today = getTodayDateString();
  const addEpisode = () => {
    const last = episodes[episodes.length - 1]?.milestone;
    onChange([...episodes, emptyEpisode(firstNumber + episodes.length, last ? addDays(last, 7) : '')]);
  };

  return (
    <div className="space-y-2">
      {episodes.map((ep, i) => (
        <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <span className="w-8 shrink-0 text-[11px] text-slate-500 text-right">#{firstNumber + i}</span>
          <input
            value={ep.title}
            onChange={(e) => update(i, { title: e.target.value })}
            aria-label={`Tên tập ${firstNumber + i}`}
            maxLength={255}
            className={`${fieldInputClass} py-1.5 min-w-0 flex-1`}
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
          <input
            type="date"
            min={today}
            value={ep.milestone}
            onChange={(e) => update(i, { milestone: e.target.value })}
            aria-label={`Mốc hoàn thành tập ${firstNumber + i}`}
            title="Mốc hoàn thành — hạn studio không được trễ hơn"
            className={`${fieldInputClass} py-1.5 w-40 ${ep.milestone && !milestoneValid(ep.milestone) ? 'border-rose-500' : ''}`}
          />
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
      <Button type="button" size="sm" variant="secondary" onClick={addEpisode}>
        <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm tập
      </Button>
    </div>
  );
}

/** Fills every milestone at once: the first episode on a day, each next one `gap` days later. */
export function MilestoneQuickFill({ onApply }: { onApply: (first: string, gapDays: number) => void }) {
  const [first, setFirst] = useState('');
  const [gap, setGap] = useState(7);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 dark:bg-white/5 px-3 py-2 text-[11px] text-slate-600 dark:text-slate-300">
      <CalendarRange className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Điền nhanh mốc: tập đầu</span>
      <input
        type="date"
        min={getTodayDateString()}
        value={first}
        onChange={(e) => setFirst(e.target.value)}
        aria-label="Mốc của tập đầu tiên"
        className={`${fieldInputClass} py-1 w-40`}
      />
      <span>, mỗi tập sau cách</span>
      <input
        type="number"
        min={0}
        max={365}
        value={gap}
        onChange={(e) => setGap(Number(e.target.value))}
        aria-label="Số ngày giữa hai mốc"
        className={`${fieldInputClass} py-1 w-16 text-center`}
      />
      <span>ngày</span>
      <Button type="button" size="sm" variant="secondary" disabled={!milestoneValid(first) || gap < 0} onClick={() => onApply(first, gap)}>
        Áp dụng
      </Button>
    </div>
  );
}
