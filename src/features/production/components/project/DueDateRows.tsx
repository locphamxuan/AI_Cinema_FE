'use client';

import { fieldInputClass } from '@/components/ui/FormField';
import { getTodayDateString } from '@/lib/dateUtils';
import type { Episode } from '@/types/production';
import { formatDay, toDateInput } from '../../lib/format';

/** A due date the API accepts: not in the past and not after the Reviewer's milestone (YYYY-MM-DD compares as text). */
export function dueDateFits(dueDate: string, episode: Pick<Episode, 'milestoneDate'>): boolean {
  const milestone = toDateInput(episode.milestoneDate);
  return dueDate >= getTodayDateString() && (!milestone || dueDate <= milestone);
}

export function DueDateRows({ episodes, dates, onChange }: { episodes: Episode[]; dates: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const min = getTodayDateString();
  return (
    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
      {episodes.map((ep) => {
        const value = dates[ep.id] ?? '';
        const late = !!value && !dueDateFits(value, ep);
        return (
          <label key={ep.id} className="flex items-center justify-between gap-3 text-xs">
            <span className="min-w-0">
              <span className="block text-slate-700 dark:text-slate-200 truncate">
                #{ep.episodeNumber} {ep.title}
              </span>
              <span className={`block text-[11px] ${late ? 'text-rose-600' : 'text-slate-500'}`}>
                Mốc Reviewer: {formatDay(ep.milestoneDate)}
                {late && ' — hạn phải trong khoảng hôm nay tới mốc'}
              </span>
            </span>
            <input
              type="date"
              min={min}
              max={toDateInput(ep.milestoneDate) || undefined}
              value={value}
              onChange={(e) => onChange({ ...dates, [ep.id]: e.target.value })}
              className={`${fieldInputClass} py-1 w-40 shrink-0 ${late ? 'border-rose-500' : ''}`}
              aria-label={`Hạn giao tập ${ep.episodeNumber}`}
            />
          </label>
        );
      })}
    </div>
  );
}
