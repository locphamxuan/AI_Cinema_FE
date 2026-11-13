import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FinalFilmPanel } from '@/features/production/components/episode/FinalFilmPanel';
import { PublishPanel } from '@/features/production/components/episode/PublishPanel';
import { ContractTab } from '@/features/production/components/project/ContractTab';
import { assignedProject, withProject } from '@/tests/support/projectContext';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';
import type { Episode } from '@/types/production';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const episode = (overrides: Partial<Episode> = {}) =>
  ({ id: 'e1', episodeNumber: 1, title: 'Tập đầu', status: 'COMPLIANCE_PASSED', coinPrice: 5, finalConfirmedAt: null, finalRejectionNote: null, ...overrides }) as Episode;
const panel = (ep: Episode, who: { canConfirm?: boolean; canSendBack?: boolean }, onChanged = vi.fn(async () => undefined)) => (
  <FinalFilmPanel episode={ep} canConfirm={!!who.canConfirm} canSendBack={!!who.canSendBack} onChanged={onChanged} />
);

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe('FinalFilmPanel', () => {
  it('lets the Reviewer confirm a checked and priced episode', async () => {
    const calls = routeFetch({ '/episodes/e1/final-confirmation': episode() });
    const onChanged = vi.fn(async () => undefined);
    render(panel(episode(), { canConfirm: true }, onChanged));

    await userEvent.click(screen.getByRole('button', { name: 'Xác nhận Phim Final' }));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls.some((c) => c.path === '/episodes/e1/final-confirmation' && c.method === 'POST')).toBe(true);
  });

  it('offers confirmation once compliance passed even if Coin price is not set yet', () => {
    render(panel(episode({ coinPrice: null }), { canConfirm: true }));
    expect(screen.getByRole('button', { name: 'Xác nhận Phim Final' })).toBeInTheDocument();
  });

  it('offers no confirmation before compliance checks pass', () => {
    render(panel(episode({ status: 'IN_REVIEW' }), { canConfirm: true }));
    expect(screen.queryByRole('button', { name: 'Xác nhận Phim Final' })).not.toBeInTheDocument();
  });

  it('shows the Reviewer why the Admin sent the film back', () => {
    render(panel(episode({ finalRejectionNote: 'Âm thanh tập 1 lệch' }), { canConfirm: true }));
    expect(screen.getByRole('note')).toHaveTextContent('Âm thanh tập 1 lệch');
  });

  it('lets the Admin send a confirmed film back through the Reviewer with a reason', async () => {
    const calls = routeFetch({ '/episodes/e1/final-rejection': episode() });
    render(panel(episode({ finalConfirmedAt: '2026-11-03T00:00:00.000Z' }), { canSendBack: true }));

    await userEvent.click(screen.getByRole('button', { name: 'Trả lại qua Reviewer' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByRole('textbox'), 'Sai màu cảnh cuối');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Trả lại' }));

    await waitFor(() => {
      const sent = calls.find((c) => c.path === '/episodes/e1/final-rejection');
      expect(JSON.parse(sent!.body as string)).toEqual({ reason: 'Sai màu cảnh cuối' });
    });
  });
});

describe('PublishPanel', () => {
  const show = (ep: Episode, who: { canPrice?: boolean; canPublish?: boolean }) =>
    render(<PublishPanel episode={ep} projectStatus="IN_PRODUCTION" canPrice={!!who.canPrice} canPublish={!!who.canPublish} onChanged={vi.fn(async () => undefined)} />);

  it('keeps the Admin from publishing until the Reviewer confirmed the Final Film', async () => {
    routeFetch({ '/episodes/e1/publications': [] });
    show(episode(), { canPublish: true });
    expect(await screen.findByRole('button', { name: 'Phát hành ngay' })).toBeDisabled();
    expect(screen.getByText(/Chờ Reviewer xác nhận Phim Final/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lưu giá' })).not.toBeInTheDocument();
  });

  it('lets the Admin publish a confirmed Final Film', async () => {
    const calls = routeFetch({ '/episodes/e1/publications': [] });
    show(episode({ finalConfirmedAt: '2026-11-03T00:00:00.000Z' }), { canPublish: true });
    await userEvent.click(await screen.findByRole('button', { name: 'Phát hành ngay' }));
    await waitFor(() => expect(calls.some((c) => c.path === '/episodes/e1/publications' && c.method === 'POST')).toBe(true));
  });

  it('lets the Reviewer price the episode but gives them no publish button', async () => {
    routeFetch({ '/episodes/e1/publications': [], '/platform-settings': { episodeCoinPriceMin: 1, episodeCoinPriceMax: 50 } });
    show(episode({ finalConfirmedAt: '2026-11-03T00:00:00.000Z' }), { canPrice: true });
    expect(await screen.findByRole('button', { name: 'Lưu giá' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Phát hành ngay' })).not.toBeInTheDocument();
  });
});

describe('ContractTab', () => {
  const round = {
    id: 'c1',
    projectId: 'm1',
    studioId: 'st1',
    handoffId: null,
    round: 1,
    previousId: null,
    costVnd: 150_000_000,
    proposedBy: 'STUDIO',
    status: 'STUDIO_SIGNED',
    terms: 'Giao đúng hạn',
    adminSignedAt: null,
    adminSignedBy: null,
    studioSignedAt: '2026-11-04T00:00:00.000Z',
    createdAt: '2026-11-03T00:00:00.000Z',
    studio: { id: 'st1', name: 'Lumen Studio' },
    handoff: null,
  };

  it('lets the Admin sign the round the studio signed, with no hand-off yet', async () => {
    signInAs('admin');
    const calls = routeFetch({ '/projects/m1/contracts': [round], '/contracts/c1/sign': round });
    render(withProject(assignedProject(), <ContractTab />));

    expect(await screen.findByText(/Hợp đồng với Studio Lumen Studio/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Đồng ý/ }));
    await waitFor(() => expect(calls.some((c) => c.path === '/contracts/c1/sign' && c.method === 'POST')).toBe(true));
  });

  it('lets the Admin counter-propose a cost in whole thousands', async () => {
    signInAs('admin');
    const calls = routeFetch({ '/projects/m1/contracts': [round], '/contracts/c1/counter': round });
    render(withProject(assignedProject(), <ContractTab />));

    await userEvent.click(await screen.findByRole('button', { name: 'Đề xuất giá khác' }));
    await userEvent.type(screen.getByLabelText('Giá mới'), '120000000');
    await userEvent.click(screen.getByRole('button', { name: 'Gửi studio' }));
    await waitFor(() => {
      const sent = calls.find((c) => c.path === '/contracts/c1/counter');
      expect(JSON.parse(sent!.body as string)).toEqual({ costVnd: 120_000_000 });
    });
  });

  it('shows the Reviewer the negotiation without any decision', async () => {
    signInAs('reviewer');
    routeFetch({ '/projects/m1/contracts': [round] });
    render(withProject(assignedProject(), <ContractTab />));

    await screen.findByText(/Hợp đồng với Studio Lumen Studio/);
    expect(screen.queryByRole('button', { name: /Đồng ý/ })).not.toBeInTheDocument();
  });

  it('explains that the template goes out with the Final Script, and resends it only then', async () => {
    signInAs('admin');
    const calls = routeFetch({ '/projects/m1/contracts': [], '/projects/m1/script': { status: 'FINAL' } });
    render(withProject(assignedProject(), <ContractTab />));

    await userEvent.click(await screen.findByRole('button', { name: /Gửi lại hợp đồng mẫu/ }));
    await waitFor(() => expect(calls.some((c) => c.path === '/projects/m1/contracts' && c.method === 'POST')).toBe(true));
  });
});
