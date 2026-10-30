'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { getTodayDateString } from '@/lib/dateUtils';
import type { NewEpisodeInput } from '@/types/production';
import { addDays } from '../../lib/format';

export interface EpisodeDraft {
  title: string;
  /** Minutes; the API takes seconds. No platform limit (BR-31), only the API's 12 h. */
  minutes: number;
  /** YYYY-MM-DD: the day the studio must deliver the episode. */
  deadline: string;
  /** YYYY-MM-DD, optional: when the episode is expected out (BR-60). */
  releaseDate: string;
}

/** The release window of the season the episodes belong to (YYYY-MM-DD, empty = open). */
export interface ReleaseWindowDraft {
  start: string;
  end: string;
}

export const MAX_EPISODE_MINUTES = 12 * 60;

export function emptyEpisode(n: number, deadline = ''): EpisodeDraft {
  return { title: `Tập ${n}`, minutes: 20, deadline, releaseDate: '' };
}

export function toEpisodeInput(e: EpisodeDraft): NewEpisodeInput {
  return {
    title: e.title.trim(),
    targetDurationSeconds: Math.round(e.minutes * 60),
    deliveryDeadline: e.deadline,
    ...(e.releaseDate ? { expectedReleaseDate: e.releaseDate } : {}),
  };
}

/** A deadline is required and cannot be in the past (YYYY-MM-DD compares as text). */
export const deadlineValid = (deadline: string) => !!deadline && deadline >= getTodayDateString();

/** An expected release date lies in the season window and not before the deadline; empty is fine (BR-60). */
export function releaseDateValid(releaseDate: string, deadline: string, window: ReleaseWindowDraft): boolean {
  if (!releaseDate) return true;
  if (deadline && releaseDate < deadline) return false;
  return !((window.start && releaseDate < window.start) || (window.end && releaseDate > window.end));
}

export function windowValid({ start, end }: ReleaseWindowDraft): boolean {
  return !start || !end || start <= end;
}

export function episodesValid(list: EpisodeDraft[], window: ReleaseWindowDraft = { start: '', end: '' }): boolean {
  return (
    list.length > 0 &&
    list.every(
      (e) =>
        e.title.trim() &&
        e.minutes > 0 &&
        e.minutes <= MAX_EPISODE_MINUTES &&
        deadlineValid(e.deadline) &&
        releaseDateValid(e.releaseDate, e.deadline, window),
    )
  );
}

/** Deadlines `gapDays` apart starting on `first`, one per episode. */
export function spreadDeadlines(first: string, gapDays: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDays(first, i * gapDays));
}

/** Rows of episode title, target length, delivery deadline and expected release date, as the Reviewer plans a season. */
export function EpisodeRowsEditor({
  episodes,
  onChange,
  firstNumber = 1,
  window = { start: '', end: '' },
}: {
  episodes: EpisodeDraft[];
  onChange: (episodes: EpisodeDraft[]) => void;
  firstNumber?: number;
  window?: ReleaseWindowDraft;
}) {
  const update = (i: number, patch: Partial<EpisodeDraft>) => onChange(episodes.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const today = getTodayDateString();
  const addEpisode = () => {
    const last = episodes[episodes.length - 1]?.deadline;
    onChange([...episodes, emptyEpisode(firstNumber + episodes.length, last ? addDays(last, 7) : '')]);
  };

  return (
    <div className="space-y-2">
      <div aria-hidden="true" className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="w-8 shrink-0 text-right">#</span>
        <span style={{ flex: '1 1 10rem', minWidth: '7rem' }}>Tên tập</span>
        <span style={{ flex: '0 0 6.5rem' }}>Thời lượng</span>
        <span style={{ flex: '0 0 9.5rem' }}>Hạn giao Studio</span>
        <span style={{ flex: '0 0 9.5rem' }}>Dự kiến phát hành</span>
        <span className="w-8 shrink-0" />
      </div>
      {episodes.map((ep, i) => (
        <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <span className="w-8 shrink-0 text-[11px] text-slate-500 text-right">#{firstNumber + i}</span>
          <input
            value={ep.title}
            onChange={(e) => update(i, { title: e.target.value })}
            aria-label={`Tên tập ${firstNumber + i}`}
            maxLength={255}
            className={`${fieldInputClass} py-1.5 min-w-0 flex-1`}
            style={{ width: 'auto', flex: '1 1 10rem', minWidth: '7rem' }}
          />
          <input
            type="number"
            min={1}
            max={MAX_EPISODE_MINUTES}
            value={ep.minutes}
            onChange={(e) => update(i, { minutes: Number(e.target.value) })}
            aria-label={`Thời lượng mục tiêu tập ${firstNumber + i} (phút)`}
            className={`${fieldInputClass} py-1.5 w-20 text-center`}
            style={{ width: '4.5rem', flex: '0 0 4.5rem' }}
          />
          <span className="text-[11px] text-slate-500 shrink-0">phút</span>
          <input
            type="date"
            min={today}
            value={ep.deadline}
            onChange={(e) => update(i, { deadline: e.target.value })}
            aria-label={`Hạn giao tập ${firstNumber + i}`}
            title="Hạn giao - studio phải giao tập này trước ngày này"
            className={`${fieldInputClass} py-1.5 ${ep.deadline && !deadlineValid(ep.deadline) ? 'border-rose-500' : ''}`}
            style={{ width: '9.5rem', flex: '0 0 9.5rem' }}
          />
          <input
            type="date"
            min={ep.deadline || today}
            value={ep.releaseDate}
            onChange={(e) => update(i, { releaseDate: e.target.value })}
            aria-label={`Ngày dự kiến phát hành tập ${firstNumber + i}`}
            title="Ngày dự kiến phát hành - trong khoảng phát hành của mùa, không trước hạn giao"
            className={`${fieldInputClass} py-1.5 ${releaseDateValid(ep.releaseDate, ep.deadline, window) ? '' : 'border-rose-500'}`}
            style={{ width: '9.5rem', flex: '0 0 9.5rem' }}
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
      <p className="text-[11px] text-slate-500 pl-10">Hạn giao Studio: ngày Studio phải giao tập (bắt buộc). Dự kiến phát hành: ngày tập dự kiến lên sóng, nằm trong khoảng phát hành của mùa, không trước hạn giao (không bắt buộc).</p>
      <Button type="button" size="sm" variant="secondary" onClick={addEpisode}>
        Thêm tập
      </Button>
    </div>
  );
}

/** Fills every delivery deadline at once: the first episode on a day, each next one `gap` days later. */
export function DeadlineQuickFill({ onApply }: { onApply: (first: string, gapDays: number) => void }) {
  const [first, setFirst] = useState('');
  const [gap, setGap] = useState(7);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 dark:bg-white/5 px-3 py-2 text-[11px] text-slate-600 dark:text-slate-300">
      <span>Điền nhanh hạn giao: tập đầu</span>
      <input
        type="date"
        min={getTodayDateString()}
        value={first}
        onChange={(e) => setFirst(e.target.value)}
        aria-label="Hạn giao của tập đầu tiên"
        className={`${fieldInputClass} py-1 w-40`}
      />
      <span>, mỗi tập sau cách</span>
      <input
        type="number"
        min={0}
        max={365}
        value={gap}
        onChange={(e) => setGap(Number(e.target.value))}
        aria-label="Số ngày giữa hai hạn giao"
        className={`${fieldInputClass} py-1 w-16 text-center`}
      />
      <span>ngày</span>
      <Button type="button" size="sm" variant="secondary" disabled={!deadlineValid(first) || gap < 0} onClick={() => onApply(first, gap)}>
        Áp dụng
      </Button>
    </div>
  );
}
