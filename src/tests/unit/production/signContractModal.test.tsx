import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from '@/components/ui/Toast';
import { SignContractModal } from '@/features/admin/components/SignContractModal';
import type { ContractToSign } from '@/features/admin/adminPipeline';
import { failWith, routeFetch } from '@/tests/support/routeFetch';
import { attachSignature, formOf, signatureFile, stubImageDecoding } from '@/tests/support/signature';
import type { Contract } from '@/types/contract';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const COSTS = { budgetVnd: 200_000_000, committedVnd: 50_000_000, remainingVnd: 150_000_000, entries: [] };

const item = (contract: Partial<Contract> = {}): ContractToSign =>
  ({
    project: { id: 'm1', title: 'Mưa Sài Gòn' },
    contract: {
      id: 'c1',
      round: 2,
      status: 'STUDIO_SIGNED',
      costVnd: 140_000_000,
      terms: 'Giao đúng hạn',
      studioSignedAt: '2026-11-04T00:00:00.000Z',
      studio: { id: 'st1', name: 'Lumen Studio' },
      ...contract,
    },
  }) as unknown as ContractToSign;

function open(target = item()) {
  const onClose = vi.fn();
  const onChanged = vi.fn(async () => undefined);
  render(<SignContractModal item={target} onClose={onClose} onChanged={onChanged} />);
  return { onClose, onChanged, dialog: screen.getByRole('dialog') };
}

const offerInput = (dialog: HTMLElement) => within(dialog).getByLabelText('Giá đề xuất mới');

beforeEach(() => vi.mocked(toast.error).mockClear());
afterEach(() => vi.unstubAllGlobals());

describe('SignContractModal', () => {
  it('shows the round, the studio, its cost and terms, and the budget left', async () => {
    routeFetch({ '/projects/m1/costs': COSTS });
    const { dialog } = open();
    expect(dialog).toHaveTextContent('Vòng 2');
    expect(dialog).toHaveTextContent('Lumen Studio');
    expect(dialog).toHaveTextContent('140.000.000');
    expect(dialog).toHaveTextContent('Giao đúng hạn');
    expect(await within(dialog).findByText(/ngân sách còn lại 150\.000\.000/)).toBeInTheDocument();
  });

  it('explains why a counter price cannot be sent', async () => {
    routeFetch({ '/projects/m1/costs': COSTS });
    const { dialog } = open();
    const input = within(dialog).getByLabelText('Giá đề xuất mới');
    await userEvent.type(input, '140.000.000');
    expect(within(dialog).getByRole('alert')).toHaveTextContent('bằng giá Studio đề xuất');
    await userEvent.clear(input);
    await userEvent.type(input, '160.000.000');
    expect(await within(dialog).findByText(/vượt ngân sách còn lại/)).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, '150.500');
    expect(within(dialog).getByRole('alert')).toHaveTextContent('bội số của 1.000');
  });

  it('signs the round the studio signed, then refreshes and closes', async () => {
    const calls = routeFetch({ '/projects/m1/costs': COSTS, '/contracts/c1/sign': { id: 'c1', status: 'SIGNED' } });
    const { dialog, onClose, onChanged } = open();
    const sign = within(dialog).getByRole('button', { name: /Đồng ý/ });
    expect(sign).toBeDisabled();
    const file = await attachSignature(dialog, /Ảnh chữ ký AI Cinema/);

    await userEvent.click(sign);
    await userEvent.click(await screen.findByRole('button', { name: 'Ký hợp đồng' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onChanged).toHaveBeenCalled();
    const sent = calls.find((c) => c.path === '/contracts/c1/sign' && c.method === 'POST')!;
    expect(formOf(sent.body).get('file')).toBe(file);
  });

  it('counter-proposes a cost within the budget left, opening the next round', async () => {
    const calls = routeFetch({ '/projects/m1/costs': COSTS, '/contracts/c1/counter': { id: 'c2', round: 3 } });
    const { dialog, onClose } = open();
    await within(dialog).findByText(/ngân sách còn lại 150\.000\.000/);

    const send = within(dialog).getByRole('button', { name: 'Gửi giá đề xuất' });
    expect(send).toBeDisabled();
    await userEvent.type(offerInput(dialog), '150000001');
    expect(send).toBeDisabled();
    await userEvent.clear(offerInput(dialog));
    await userEvent.type(offerInput(dialog), '130.000.000');
    expect(send).toBeDisabled();
    const file = await attachSignature(dialog, /Ảnh chữ ký AI Cinema/);
    await userEvent.click(send);
    await userEvent.click(await screen.findByRole('button', { name: 'Ký và gửi giá' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const sent = formOf(calls.find((c) => c.path === '/contracts/c1/counter')!.body);
    expect(sent.get('costVnd')).toBe('130000000');
    expect(sent.get('file')).toBe(file);
  });

  it('counts the fee a studio change hand-off holds as available, since the signed cost replaces it', async () => {
    const calls = routeFetch({
      '/projects/m1/costs': { ...COSTS, remainingVnd: 10_000_000 },
      '/projects/m1/handoffs': [{ id: 'h2', milestoneStatus: 'BRIEF_SENT', offeredFeeVnd: 45_000_000 }],
      '/contracts/c1/counter': { id: 'c2', round: 2 },
    });
    const { dialog, onClose } = open(item({ handoffId: 'h2', handoff: { id: 'h2', milestoneStatus: 'BRIEF_SENT' } }));

    // 10 M left + the 45 M the waiting hand-off holds.
    expect(await within(dialog).findByText(/ngân sách còn lại 55\.000\.000/)).toBeInTheDocument();
    await userEvent.type(offerInput(dialog), '50000000');
    await attachSignature(dialog, /Ảnh chữ ký AI Cinema/);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Gửi giá đề xuất' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Ký và gửi giá' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(formOf(calls.find((c) => c.path === '/contracts/c1/counter')!.body).get('costVnd')).toBe('50000000');
  });

  it('does not read the hand-offs for a first contract', async () => {
    const calls = routeFetch({ '/projects/m1/costs': COSTS });
    const { dialog } = open(item({ handoffId: null, handoff: null }));
    await within(dialog).findByText(/ngân sách còn lại 150\.000\.000/);
    expect(calls.some((c) => c.path === '/projects/m1/handoffs')).toBe(false);
  });

  it('cannot sign a round the studio left without a cost', () => {
    routeFetch({ '/projects/m1/costs': COSTS });
    const { dialog } = open(item({ costVnd: null }));
    expect(within(dialog).getByRole('button', { name: /Đồng ý/ })).toBeDisabled();
  });

  it('shows the refusal, reloads the inbox and closes when the contract changed meanwhile (409)', async () => {
    routeFetch({ '/projects/m1/costs': COSTS, '/contracts/c1/sign': failWith(409, 'Cannot sign a contract that is SIGNED (expected STUDIO_SIGNED)') });
    const { dialog, onClose, onChanged } = open();
    await attachSignature(dialog, /Ảnh chữ ký AI Cinema/);

    await userEvent.click(within(dialog).getByRole('button', { name: /Đồng ý/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Ký hợp đồng' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Không thực hiện được',
        'Không thể ký hợp đồng đang ở trạng thái Đã ký đủ hai bên (cần Studio đã ký). Màn hình đã được tải lại.',
      ),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onChanged).toHaveBeenCalled();
  });

  it('refuses a file that is not a signature image, is over 2 MB or too small to read, before sending', async () => {
    const calls = routeFetch({ '/projects/m1/costs': COSTS });
    const { dialog } = open();
    const sign = within(dialog).getByRole('button', { name: /Đồng ý/ });

    await attachSignature(dialog, /Ảnh chữ ký AI Cinema/, signatureFile('hop-dong.pdf', 'application/pdf'), false);
    expect(within(dialog).getByRole('alert')).toHaveTextContent('PNG hoặc JPG');
    await attachSignature(dialog, /Ảnh chữ ký AI Cinema/, signatureFile('to.png', 'image/png', 3 * 1024 * 1024), false);
    expect(within(dialog).getByRole('alert')).toHaveTextContent('tối đa 2 MB');
    stubImageDecoding({ width: 100, height: 30 });
    await userEvent.upload(within(dialog).getByLabelText(/Ảnh chữ ký AI Cinema/), signatureFile());
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Ảnh quá nhỏ (100x30 px)');
    expect(sign).toBeDisabled();
    expect(calls.some((c) => c.path === '/contracts/c1/sign')).toBe(false);
  });

  it("saves the studio-signed copy under the file name the backend gave it", async () => {
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:x'), revokeObjectURL: vi.fn() }));
    const names: string[] = [];
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      names.push(this.download);
    });
    const fileName = 'hop-dong-studio-da-ky-AIC-2026-C1-R2.pdf';
    const studioCopy = { id: 'd1', side: 'STUDIO', fileName, sizeBytes: 10, checksum: 'x', uploadedAt: '2026-11-04T00:00:00.000Z' };
    const calls = routeFetch({ '/projects/m1/costs': COSTS, '/contracts/c1/documents/STUDIO/content': {} });
    const { dialog } = open(item({ documents: [studioCopy] } as Partial<Contract>));

    await userEvent.click(within(dialog).getByRole('button', { name: 'Tải bản Studio ký' }));

    await waitFor(() => expect(names).toEqual([fileName]));
    expect(calls.some((c) => c.path === '/contracts/c1/documents/STUDIO/content')).toBe(true);
    click.mockRestore();
  });

  it('closes without a call when the Admin dismisses it', async () => {
    const calls = routeFetch({ '/projects/m1/costs': COSTS });
    const { dialog, onClose } = open();
    // The footer button; the corner X is labelled the same.
    const [, footerClose] = within(dialog).getAllByRole('button', { name: 'Đóng' });
    await userEvent.click(footerClose);
    expect(onClose).toHaveBeenCalled();
    expect(calls.filter((c) => c.method === 'POST')).toEqual([]);
  });
});
