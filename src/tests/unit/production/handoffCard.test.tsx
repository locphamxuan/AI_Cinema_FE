import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HandoffCard } from '@/features/production/components/project/HandoffCard';
import { waitingRound } from '@/features/production/lib/capabilities';
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
    contracts: [{ id: 'c0', round: 1, status: 'SIGNED', costVnd: 150_000_000 }],
    ...over,
  }) as unknown as StudioHandoff;

const renderCard = (h: StudioHandoff, base: '/creator' | '/admin' = '/creator', canDecide = false) =>
  render(<HandoffCard handoff={h} movieId="m1" base={base} canDecide={canDecide} onBrief={vi.fn()} onMaterial={vi.fn()} />);

/** The hand-off a studio change opened: it waits in BRIEF_SENT for the new studio's contract. */
const waiting = (status: 'SENT' | 'STUDIO_SIGNED' | 'ADMIN_COUNTERED', costVnd: number | null = null) =>
  handoff({
    studio: { id: 'st-c', name: 'Studio C', email: 'c@studio.vn' },
    milestoneStatus: 'BRIEF_SENT',
    offeredFeeVnd: '45000000',
    changeReason: 'Studio cũ trễ hạn',
    milestoneEvents: [],
    contracts: [{ id: 'c1', round: 1, status, costVnd }],
  } as Partial<StudioHandoff>);

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

describe('HandoffCard - a studio change waiting for its contract', () => {
  it('says the new studio has to quote and sign, with the round status, and links the contract tab', () => {
    renderCard(waiting('SENT'));
    const note = screen.getByRole('status');
    expect(note).toHaveTextContent('Đang chờ Studio mới báo giá và ký hợp đồng');
    expect(note).toHaveTextContent('Vòng 1: Đã gửi studio, chờ báo giá');
    expect(screen.getByRole('link', { name: 'Xem hợp đồng' }).getAttribute('href')).toBe('/creator/projects/m1?tab=contract');
    expect(screen.getByText(/phí đề xuất trong brief: 45\.000\.000/)).toBeTruthy();
  });

  it('sends the Admin to sign once the new studio signed its quote', () => {
    renderCard(waiting('STUDIO_SIGNED', 44_000_000), '/admin', true);
    expect(screen.getByRole('status')).toHaveTextContent('Studio đã ký, chờ Admin · 44.000.000');
    expect(screen.getByRole('link', { name: 'Xem báo giá và ký hợp đồng' }).getAttribute('href')).toBe('/admin/projects/m1?tab=contract');
  });

  it('offers the Reviewer only the way to read it', () => {
    renderCard(waiting('STUDIO_SIGNED', 44_000_000), '/creator', false);
    expect(screen.queryByRole('link', { name: 'Xem báo giá và ký hợp đồng' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Xem hợp đồng' })).toBeTruthy();
  });

  it('shows no waiting note once production started, and calls the fee the signed one', () => {
    renderCard(handoff({ milestoneStatus: 'IN_PROGRESS' }));
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText(/phí theo hợp đồng đã ký: 150\.000\.000/)).toBeTruthy();
  });
});

describe('waitingRound', () => {
  const rounds = (...statuses: string[]) => statuses.map((status, i) => ({ id: `c${i}`, round: i + 1, status, costVnd: null })) as never;

  it('is the newest open round of a hand-off still at BRIEF_SENT', () => {
    expect(waitingRound({ milestoneStatus: 'BRIEF_SENT', contracts: rounds('STUDIO_SIGNED', 'ADMIN_COUNTERED') })).toMatchObject({ round: 2 });
  });

  it('is none once the hand-off started, superseded, or with no open round', () => {
    expect(waitingRound({ milestoneStatus: 'IN_PROGRESS', contracts: rounds('SENT') })).toBeNull();
    expect(waitingRound({ milestoneStatus: 'SUPERSEDED', contracts: rounds('SUPERSEDED') })).toBeNull();
    expect(waitingRound({ milestoneStatus: 'BRIEF_SENT', contracts: rounds('SUPERSEDED') })).toBeNull();
    expect(waitingRound({ milestoneStatus: 'BRIEF_SENT', contracts: [] })).toBeNull();
  });
});
