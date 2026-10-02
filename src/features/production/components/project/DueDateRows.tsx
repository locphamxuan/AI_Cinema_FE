'use client';

import { getTodayDateString } from '@/lib/dateUtils';
import type { Episode } from '@/types/production';
import { formatDay, toDateInput } from '../../lib/format';

/** The Reviewer's deadline of an episode can be handed to a studio: set, and not already past. */
export function deadlineUsable(episode: Pick<Episode, 'milestoneDate'>): boolean {
  const deadline = toDateInput(episode.milestoneDate);
  return !!deadline && deadline >= getTodayDateString();
}

/** Read-only: the studio is due on the deadline the Reviewer set for each episode (BR-38). */
export function DeadlineList({ episodes }: { episodes: Episode[] }) {
  return (
    <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1 text-xs">
      {episodes.map((ep) => {
        const usable = deadlineUsable(ep);
        return (
          <li key={ep.id} className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-slate-700 dark:text-slate-200">
              #{ep.episodeNumber} {ep.title}
            </span>
            <span className={`shrink-0 font-semibold ${usable ? 'text-slate-800 dark:text-slate-100' : 'text-rose-600'}`}>
              {ep.milestoneDate ? formatDay(ep.milestoneDate) : 'Chưa đặt'}
              {ep.milestoneDate && !usable && ' (đã qua)'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
