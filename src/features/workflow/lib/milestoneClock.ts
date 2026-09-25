/**
 * Where each project milestone stands right now. Mirrors the backend clock
 * (milestone-clock.ts): a milestone starts on its start date, else the day after the
 * previous milestone's target day, else when production starts; it runs through its
 * target day and is over after it. Only a cancelled milestone ignores the clock.
 */

import type { ProjectMilestone } from '@/types/workflow';

export type MilestonePhase = 'upcoming' | 'active' | 'done' | 'cancelled';

export interface TimedMilestone {
  milestone: ProjectMilestone;
  phase: MilestonePhase;
  startsAt: Date | null;
  /** End of the target day (exclusive). */
  endsAt: Date | null;
  /** Share of the milestone's time already elapsed, 0–1 (active milestones only). */
  elapsed: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** A `YYYY-MM-DD` (or ISO) date as local midnight, the way the dates were picked. */
function dayStart(value?: string | null): Date | null {
  if (!value) return null;
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}

export function milestoneTimeline(milestones: ProjectMilestone[], productionStart: string | undefined, now: Date): TimedMilestone[] {
  const ordered = [...milestones].sort(
    (a, b) => (dayStart(a.deadline)?.getTime() ?? Infinity) - (dayStart(b.deadline)?.getTime() ?? Infinity)
  );

  let previousEnd = dayStart(productionStart);
  return ordered.map((milestone) => {
    const startsAt = dayStart(milestone.startDate) ?? previousEnd;
    const target = dayStart(milestone.deadline);
    const endsAt = target && new Date(target.getTime() + DAY_MS);
    if (endsAt) previousEnd = endsAt;

    let phase: MilestonePhase = 'active';
    if (milestone.status === 'cancelled') phase = 'cancelled';
    else if (endsAt && now >= endsAt) phase = 'done';
    else if (startsAt && now < startsAt) phase = 'upcoming';

    const span = startsAt && endsAt ? endsAt.getTime() - startsAt.getTime() : 0;
    const elapsed = phase === 'active' && span > 0 ? Math.min(1, Math.max(0, (now.getTime() - startsAt!.getTime()) / span)) : phase === 'done' ? 1 : 0;
    return { milestone, phase, startsAt, endsAt, elapsed };
  });
}

/** "3 ngày 4 giờ", "5 giờ 12 phút", "8 phút" — the two largest units. */
function formatDuration(ms: number): string {
  const minutes = Math.max(1, Math.floor(ms / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return hours > 0 ? `${days} ngày ${hours} giờ` : `${days} ngày`;
  if (hours > 0) return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
  return `${mins} phút`;
}

/** The one line that says where the milestone stands against the clock. */
export function countdownOf({ phase, startsAt, endsAt }: TimedMilestone, now: Date): string {
  if (phase === 'cancelled') return 'Đã hủy';
  if (phase === 'done') return 'Đã kết thúc';
  if (phase === 'upcoming') return startsAt ? `Bắt đầu sau ${formatDuration(startsAt.getTime() - now.getTime())}` : 'Sắp tới';
  return endsAt ? `Còn ${formatDuration(endsAt.getTime() - now.getTime())}` : 'Đang diễn ra';
}
