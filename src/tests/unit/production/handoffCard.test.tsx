import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HandoffCard } from '@/features/production/components/project/HandoffCard';
import type { StudioHandoff } from '@/types/production';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

const handoff = (over: Partial<StudioHandoff> = {}) =>
  ({
    id: 'h1',
    studio: { name: 'Studio Ánh Trăng', email: 'contact@anhtrang.studio' },
    season: null,
    productionFeeTokens: '100',
    createdAt: '2026-10-14T03:00:00.000Z',
    createdBy: { fullName: 'Creator' },
    milestoneStatus: 'IN_PROGRESS',
    emailMessage: null,
    materials: [],
    milestoneEvents: [],
    briefFileKey: null,
    changeReason: null,
    filmSentAt: null,
    filmSentNote: null,
    ...over,
  }) as unknown as StudioHandoff;

const renderCard = (h: StudioHandoff) =>
  render(<HandoffCard handoff={h} movieId="m1" base="/creator" onBrief={vi.fn()} onMaterial={vi.fn()} />);

describe('HandoffCard film sent by the studio', () => {
  it('shows nothing until the studio reports a film', () => {
    renderCard(handoff());
    expect(screen.queryByText(/Studio đã gửi phim/)).toBeNull();
  });

  it('shows the film the studio mailed and waits for the Submission', () => {
    renderCard(handoff({ filmSentAt: '2026-10-15T03:00:00.000Z', filmSentNote: 'Studio đã gửi phim qua email: v2 (3 tập).' }));
    expect(screen.getByText(/Studio đã gửi phim qua email: v2 \(3 tập\)/)).toBeTruthy();
    expect(screen.getByText(/Chờ Creator upload Submission/)).toBeTruthy();
  });

  it('stops waiting once the milestone is DELIVERED', () => {
    renderCard(handoff({ milestoneStatus: 'DELIVERED', filmSentAt: '2026-10-15T03:00:00.000Z', filmSentNote: 'Đã gửi.' }));
    expect(screen.queryByText(/Chờ Creator upload Submission/)).toBeNull();
  });
});
