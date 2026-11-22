'use client';

import { getTodayDateString } from '@/lib/dateUtils';
import type { Episode } from '@/types/production';
import { formatDay, toDateInput } from '@/lib/format';

/** The Reviewer's deadline of an episode is usable for the studio: set, and not already past. */
export function deadlineUsable(episode: Pick<Episode, 'deliveryDeadline'>): boolean {
  const deadline = toDateInput(episode.deliveryDeadline);
  return !!deadline && deadline >= getTodayDateString();
}

/** Read-only: the studio is due on the deadline the Reviewer set for each episode (BR-38). */
export function DeadlineList({ episodes }: { episodes: Episode[] }) {
  if (episodes.length === 0) return <p className="text-xs text-muted-foreground">Mọi tập của phạm vi này đã được giao cho Studio.</p>;
  return (
    <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1 text-xs">
      {episodes.map((ep) => {
        const usable = deadlineUsable(ep);
        return (
          <li key={ep.id} className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-secondary-foreground">
              #{ep.episodeNumber} {ep.title}
            </span>
            <span className={`shrink-0 font-semibold ${usable ? 'text-foreground' : 'text-rose-600'}`}>
              {ep.deliveryDeadline ? formatDay(ep.deliveryDeadline) : 'Chưa đặt'}
              {ep.deliveryDeadline && !usable && ' (đã qua)'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
