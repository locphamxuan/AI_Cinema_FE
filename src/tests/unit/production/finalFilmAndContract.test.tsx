import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FinalFilmPanel } from '@/features/production/components/episode/FinalFilmPanel';
import { PublishPanel } from '@/features/production/components/episode/PublishPanel';
import { ContractTab } from '@/features/production/components/project/ContractTab';
import { assignedProject, withProject } from '@/tests/support/projectContext';
import { failWith, routeFetch } from '@/tests/support/routeFetch';
import { attachPdf, formOf } from '@/tests/support/pdf';
import { signInAs } from '@/tests/support/signIn';
import { toast } from '@/components/ui/Toast';
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
    expect(calls).toHaveLength(0);
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Xác nhận Phim Final' }));
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
    const sign = screen.getByRole('button', { name: /Đồng ý/ });
    expect(sign).toBeDisabled();
    const file = await attachPdf(document.body, /PDF Admin đã ký/);
    await userEvent.click(sign);
    // Signing completes the contract and hands the project off: it asks once first.
    const dialog = await screen.findByRole('dialog');
    expect(calls.some((c) => c.path === '/contracts/c1/sign')).toBe(false);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Đồng ý & ký' }));
    await waitFor(() => {
      const sent = calls.find((c) => c.path === '/contracts/c1/sign' && c.method === 'POST');
      expect(formOf(sent!.body).get('file')).toBe(file);
    });
  });

  it('lets the Admin counter-propose a cost in whole thousands', async () => {
    signInAs('admin');
    const calls = routeFetch({ '/projects/m1/contracts': [round], '/contracts/c1/counter': round });
    render(withProject(assignedProject(), <ContractTab />));

    await userEvent.click(await screen.findByRole('button', { name: 'Đề xuất giá khác' }));
    await userEvent.type(screen.getByLabelText('Giá mới'), '120000000');
    const send = screen.getByRole('button', { name: 'Gửi giá cho Studio' });
    expect(send).toBeDisabled();
    await attachPdf(document.body, /PDF đã ký cho giá mới/);
    await userEvent.click(send);
    await waitFor(() => {
      const sent = formOf(calls.find((c) => c.path === '/contracts/c1/counter')!.body);
      expect(sent.get('costVnd')).toBe('120000000');
      expect(sent.get('file')).toBeInstanceOf(File);
    });
  });

  const doc = { id: 'd1', side: 'STUDIO', fileName: 'studio.pdf', sizeBytes: 10, checksum: 'x', uploadedAt: '2026-11-04T00:00:00.000Z' };

  it('shows the Reviewer the negotiation and the signed PDFs, without any decision', async () => {
    signInAs('reviewer');
    routeFetch({ '/projects/m1/contracts': [round], '/contracts/c1/documents': [doc] });
    render(withProject(assignedProject(), <ContractTab />));

    await screen.findByText(/Hợp đồng với Studio Lumen Studio/);
    expect(await screen.findByRole('button', { name: 'Bản Studio đã ký' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Đồng ý/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Ngân sách còn lại/)).not.toBeInTheDocument();
    expect(screen.getByText('150.000.000 ₫')).toBeInTheDocument();
  });

  it('downloads the unsigned contract the studio received, and says when it cannot', async () => {
    signInAs('reviewer');
    const createObjectURL = vi.fn(() => 'blob:x');
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }));
    const calls = routeFetch({ '/projects/m1/contracts': [round], '/contracts/c1/documents': [doc], '/contracts/c1/template': {} });
    render(withProject(assignedProject(), <ContractTab />));

    await userEvent.click(await screen.findByRole('button', { name: 'Hợp đồng chưa ký (bản Studio nhận)' }));
    await waitFor(() => expect(createObjectURL).toHaveBeenCalled());
    expect(calls.some((c) => c.path === '/contracts/c1/template')).toBe(true);

    routeFetch({ '/projects/m1/contracts': [round], '/contracts/c1/documents': [doc], '/contracts/c1/template': failWith(404, 'gone') });
    await userEvent.click(screen.getByRole('button', { name: 'Hợp đồng chưa ký (bản Studio nhận)' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Không tải được hợp đồng', 'Thử lại sau.'));
  });

  it('shows a Creator the rounds only: no PDF request, which the backend refuses them', async () => {
    signInAs('creator');
    const calls = routeFetch({ '/projects/m1/contracts': [round], '/contracts/c1/documents': [doc] });
    render(withProject(assignedProject(), <ContractTab />));

    await screen.findByText(/Hợp đồng với Studio Lumen Studio/);
    expect(calls.some((c) => c.path === '/contracts/c1/documents')).toBe(false);
    expect(screen.queryByRole('button', { name: 'Bản Studio đã ký' })).not.toBeInTheDocument();
    // A Creator never sees production costs, so the round shows no price.
    expect(screen.queryByText(/Studio báo giá/)).not.toBeInTheDocument();
    expect(screen.queryByText(/150\.000\.000/)).not.toBeInTheDocument();
  });

  it('explains an invalid counter-offer under the price field', async () => {
    signInAs('admin');
    routeFetch({ '/projects/m1/contracts': [round] });
    render(withProject(assignedProject(), <ContractTab />));

    await userEvent.click(await screen.findByRole('button', { name: 'Đề xuất giá khác' }));
    await userEvent.type(screen.getByLabelText('Giá mới'), '1500');
    expect(screen.getByRole('alert')).toHaveTextContent(/số tiền dương/);
  });

  it('explains that the template goes out with the Final Script, and resends it only then', async () => {
    signInAs('admin');
    const calls = routeFetch({ '/projects/m1/contracts': [], '/projects/m1/script': { status: 'FINAL' } });
    render(withProject(assignedProject(), <ContractTab />));

    await userEvent.click(await screen.findByRole('button', { name: /Gửi lại hợp đồng mẫu/ }));
    await waitFor(() => expect(calls.some((c) => c.path === '/projects/m1/contracts' && c.method === 'POST')).toBe(true));
  });
});
