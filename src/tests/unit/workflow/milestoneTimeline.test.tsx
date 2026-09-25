import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import { MilestoneTimeline } from '@/features/workflow/components/shared/MilestoneTimeline';
import { countdownOf, milestoneTimeline } from '@/features/workflow/lib/milestoneClock';
import type { ProjectMilestone } from '@/types/workflow';

const milestone = (id: string, deadline: string, extra: Partial<ProjectMilestone> = {}): ProjectMilestone => ({
  id,
  title: id,
  deadline,
  status: 'pending',
  ...extra,
});

const MILESTONES = [milestone('Kịch bản', '2026-10-10'), milestone('Quay dựng', '2026-10-20'), milestone('Hậu kỳ', '2026-10-30')];

describe('milestoneTimeline', () => {
  it('follows the clock: each milestone starts the day after the previous one ends', () => {
    const phases = milestoneTimeline(MILESTONES, '2026-10-01', new Date(2026, 9, 12, 9)).map((t) => t.phase);
    expect(phases).toEqual(['done', 'active', 'upcoming']);
  });

  it('ignores a stored status except cancelled', () => {
    const stale = [milestone('A', '2026-10-10', { status: 'completed' }), milestone('B', '2026-10-20', { status: 'cancelled' })];
    const phases = milestoneTimeline(stale, '2026-10-01', new Date(2026, 9, 5)).map((t) => t.phase);
    expect(phases).toEqual(['active', 'cancelled']);
  });

  it('counts down to the end of the target day', () => {
    const now = new Date(2026, 9, 10, 20, 0);
    const [first] = milestoneTimeline(MILESTONES, '2026-10-01', now);
    expect(countdownOf(first, now)).toBe('Còn 4 giờ');
  });
});

describe('MilestoneTimeline', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('moves to the next milestone by itself as time passes, with no status to pick', () => {
    vi.setSystemTime(new Date(2026, 9, 10, 23, 59, 50));
    render(<MilestoneTimeline milestones={MILESTONES} productionStart="2026-10-01" />);

    expect(within(screen.getByRole('listitem', { current: 'step' })).getByText('Kịch bản')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(within(screen.getByRole('listitem', { current: 'step' })).getByText('Quay dựng')).toBeInTheDocument();
  });

  it('is shown even before the Reviewer sets any milestone', () => {
    render(<MilestoneTimeline milestones={[]} />);
    expect(screen.getByText('Reviewer chưa đặt cột mốc nào cho dự án này.')).toBeInTheDocument();
  });
});
