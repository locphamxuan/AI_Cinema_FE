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
    filmLinks: [],
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

  it('shows the film the studio mailed and waits for the delivered film', () => {
    renderCard(handoff({ filmSentAt: '2026-10-15T03:00:00.000Z', filmSentNote: 'Studio đã gửi phim qua email: v2 (3 tập).' }));
    expect(screen.getByText(/Studio đã gửi phim qua email: v2 \(3 tập\)/)).toBeTruthy();
    expect(screen.getByText(/Chờ Creator nộp bản phim/)).toBeTruthy();
  });

  it('stops waiting once the milestone is DELIVERED', () => {
    renderCard(handoff({ milestoneStatus: 'DELIVERED', filmSentAt: '2026-10-15T03:00:00.000Z', filmSentNote: 'Đã gửi.' }));
    expect(screen.queryByText(/Chờ Creator nộp bản phim/)).toBeNull();
  });

  it('lists the link of every episode the studio mailed, to its episode page and to the film', () => {
    renderCard(
      handoff({
        filmSentAt: '2026-10-15T03:00:00.000Z',
        filmSentNote: 'Đã gửi.',
        filmLinks: [
          {
            id: 'l1',
            episodeId: 'e1',
            version: 'v1',
            fileName: 'tap-1.mp4',
            url: 'http://studio.test/films/a/tap-1.mp4',
            sentAt: '2026-10-15T03:00:00.000Z',
            episode: { episodeNumber: 1 },
          },
        ],
      }),
    );
    expect(screen.getByText('Tập 1').getAttribute('href')).toBe('/creator/projects/m1/episodes/e1');
    expect(screen.getByLabelText('Xem phim tập 1').getAttribute('href')).toBe('http://studio.test/films/a/tap-1.mp4');
    expect(screen.getByText(/tap-1\.mp4/)).toBeTruthy();
  });
});
