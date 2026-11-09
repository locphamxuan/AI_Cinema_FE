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
    offeredFeeVnd: '150000000',
    forfeitedVnd: '0',
    createdAt: '2026-10-14T03:00:00.000Z',
    createdBy: { fullName: 'Admin' },
    milestoneStatus: 'DELIVERED',
    emailMessage: null,
    materials: [],
    milestoneEvents: [
      {
        id: 'ev1',
        fromStatus: 'IN_PROGRESS',
        toStatus: 'DELIVERED',
        note: null,
        createdAt: '2026-10-15T03:00:00.000Z',
        changedBy: { fullName: 'Studio Ánh Trăng' },
        mediaAsset: { id: 'a1', version: 1, episodeId: 'e1', ingestStatus: 'READY' },
      },
    ],
    briefFileKey: null,
    changeReason: null,
    ...over,
  }) as unknown as StudioHandoff;

const renderCard = (h: StudioHandoff) =>
  render(<HandoffCard handoff={h} movieId="m1" base="/creator" onBrief={vi.fn()} onMaterial={vi.fn()} />);

describe('HandoffCard (read-only timeline)', () => {
  it('lists the milestones the system moved, linking the Submission the studio delivered', () => {
    renderCard(handoff());
    expect(screen.getByText('Submission v1').getAttribute('href')).toBe('/creator/projects/m1/episodes/e1');
    expect(screen.getByText(/Studio Ánh Trăng$/, { selector: 'span' })).toBeTruthy();
  });

  it('offers no way to move a milestone or import a film by hand', () => {
    renderCard(handoff({ milestoneStatus: 'IN_PROGRESS' }));
    expect(screen.queryByRole('button', { name: /Cập nhật mốc/ })).toBeNull();
    expect(screen.queryByText(/Studio đã gửi phim/)).toBeNull();
  });

  it('still labels the milestones of older hand-offs the studio accepted or declined', () => {
    renderCard(handoff({ milestoneStatus: 'STUDIO_DECLINED', milestoneEvents: [] }));
    expect(screen.getByText('Studio từ chối')).toBeTruthy();
  });
});
