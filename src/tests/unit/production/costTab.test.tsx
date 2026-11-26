import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from '@/components/ui/Toast';
import { CostTab } from '@/features/production/components/project/CostTab';
import { assignedProject, withProject } from '@/tests/support/projectContext';
import { failWith, routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';
import type { ProjectDetail } from '@/types/production';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const cost = { budgetVnd: 200_000_000, committedVnd: 150_000_000, remainingVnd: 50_000_000 };
const project = () => assignedProject({ cost, studioHandoffs: [] } as Partial<ProjectDetail>);
const ledger = { ...cost, entries: [] };
const noRequests = { '/projects/m1/cost-requests': { data: [], meta: { totalItems: 0 } } };

beforeEach(() => {
  localStorage.clear();
  vi.mocked(toast.error).mockClear();
});
afterEach(() => vi.unstubAllGlobals());

describe('CostTab - budget correction (Admin)', () => {
  beforeEach(() => signInAs('admin'));

  it('explains why a correction below what studios hold cannot be sent', async () => {
    routeFetch({ '/projects/m1/costs': ledger, ...noRequests });
    render(withProject(project(), <CostTab />));

    await userEvent.type(await screen.findByLabelText('Số tiền'), '-60000000');
    await userEvent.type(screen.getByLabelText(/Lý do \(bắt buộc\)/), 'Studio giảm giá');
    expect(screen.getByText(/không được thấp hơn phần đã cam kết với Studio \(150\.000\.000/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ghi điều chỉnh' })).toBeDisabled();
  });

  it('asks before writing the correction, then sends it and reloads', async () => {
    const calls = routeFetch({ '/projects/m1/costs': ledger, ...noRequests });
    const reload = vi.fn(async () => undefined);
    render(withProject(project(), <CostTab />, reload));

    await userEvent.type(await screen.findByLabelText('Số tiền'), '-20000000');
    await userEvent.type(screen.getByLabelText(/Lý do \(bắt buộc\)/), 'Studio giảm giá');
    await userEvent.click(screen.getByRole('button', { name: 'Ghi điều chỉnh' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/180\.000\.000/)).toBeInTheDocument();
    expect(calls.some((c) => c.method === 'POST')).toBe(false);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Ghi điều chỉnh' }));

    await waitFor(() => expect(reload).toHaveBeenCalled());
    const sent = calls.find((c) => c.method === 'POST' && c.path === '/projects/m1/costs/entries')!;
    expect(JSON.parse(sent.body as string)).toEqual({ entryType: 'CORRECTION', amountVnd: -20_000_000, reason: 'Studio giảm giá' });
  });

  it('reloads the project when another Admin changed the budget meanwhile (409)', async () => {
    const reload = vi.fn(async () => undefined);
    routeFetch({ '/projects/m1/costs': ledger, ...noRequests });
    render(withProject(project(), <CostTab />, reload));
    await screen.findByLabelText('Số tiền');
    routeFetch({ '/projects/m1/costs': ledger, '/projects/m1/costs/entries': failWith(409, 'Set the budget first'), ...noRequests });

    await userEvent.type(screen.getByLabelText('Số tiền'), '10000000');
    await userEvent.type(screen.getByLabelText(/Lý do \(bắt buộc\)/), 'Thêm cảnh');
    await userEvent.click(screen.getByRole('button', { name: 'Ghi điều chỉnh' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Ghi điều chỉnh' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    await waitFor(() => expect(reload).toHaveBeenCalled());
  });
});

describe('CostTab - asking for more cost (Reviewer)', () => {
  beforeEach(() => signInAs('reviewer'));

  it('refuses an amount that is not whole thousands', async () => {
    routeFetch({ '/projects/m1/costs': ledger, ...noRequests });
    const reviewing = assignedProject({ cost, studioHandoffs: [], reviewerId: 'reviewer-id' } as Partial<ProjectDetail>);
    render(withProject(reviewing, <CostTab />));

    await userEvent.type(await screen.findByLabelText('Số tiền xin thêm'), '1500');
    expect(screen.getByText(/Bội số 1\.000 ₫, từ 1\.000 ₫ đến/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gửi yêu cầu cho Admin' })).toBeDisabled();
  });
});
