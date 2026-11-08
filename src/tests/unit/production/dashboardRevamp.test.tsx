import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { notificationTabsFor, typesOf } from '@/features/notifications/notificationCatalog';
import { pageOf } from '@/components/data/Pager';
import { downloadFile } from '@/features/production/lib/download';
import { CostRequestInbox } from '@/features/admin/components/CostRequestInbox';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';
import type { CostRequest } from '@/types/cost';

const toastError = vi.hoisted(() => vi.fn());
vi.mock('@/components/ui/Toast', () => ({ toast: { error: toastError, success: vi.fn() } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/admin/requests',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

const REQUEST: CostRequest = {
  id: 'req-1',
  projectId: 'm1',
  handoffId: 'h1',
  requestedVnd: 20_000_000,
  studioQuoteVnd: 170_000_000,
  grantedVnd: null,
  reason: 'Studio đòi 170 triệu vì thêm cảnh VFX',
  attachmentName: 'bao-gia.pdf',
  status: 'OPEN',
  adminResponse: null,
  resolvedAt: null,
  createdAt: '2026-10-15T08:00:00.000Z',
  project: { id: 'm1', reviewerId: 'r1', movie: { title: 'Vùng dịch 704' } },
  handoff: { id: 'h1', offeredFeeVnd: 150_000_000, milestoneStatus: 'NEGOTIATING', studio: { id: 's1', name: 'Studio Ánh Trăng' } },
  requestedBy: { id: 'r1', fullName: 'Reviewer Một' },
  resolvedBy: null,
};

beforeEach(() => {
  localStorage.clear();
  toastError.mockClear();
});
afterEach(() => vi.unstubAllGlobals());

describe('downloadFile', () => {
  it('says so instead of failing silently when the file cannot be read', async () => {
    expect(await downloadFile(async () => null, 'brief.pdf')).toBe(false);
    expect(toastError).toHaveBeenCalledWith('Không tải được file', expect.any(String));
  });

  it('saves the file through a link kept in the page until it was clicked', async () => {
    const createObjectURL = vi.fn(() => 'blob:x');
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(document.body.contains(this)).toBe(true);
      expect(this.download).toBe('kich-ban.docx');
    });
    expect(await downloadFile(async () => new Blob(['x']), 'kich-ban.docx')).toBe(true);
    expect(click).toHaveBeenCalledOnce();
    click.mockRestore();
  });
});

describe('notification tabs', () => {
  it('splits the Creator inbox into Studio, Reviewer and episodes, and the Reviewer one into Creator, Studio, Admin', () => {
    expect(notificationTabsFor('creator').map((t) => t.label)).toEqual(['Studio', 'Reviewer', 'Tập phim']);
    expect(notificationTabsFor('reviewer').map((t) => t.key)).toEqual(['creator', 'studio', 'admin', 'release']);
    const creatorTab = notificationTabsFor('reviewer')[0];
    expect(typesOf(creatorTab)).toEqual(expect.arrayContaining(['MEDIA_SUBMITTED', 'STUDIO_HANDOFF_SENT']));
    expect(typesOf(notificationTabsFor('reviewer')[2])).toEqual(
      expect.arrayContaining(['COST_BUDGET_CHANGED', 'COST_REQUEST_APPROVED', 'COST_REQUEST_REJECTED']),
    );
    expect(typesOf(notificationTabsFor('admin')[1])).toContain('COST_REQUESTED');
  });

  it('files the MF-1 script, idea note, contract and Final Film notifications for each role', () => {
    const all = (role: 'creator' | 'reviewer' | 'admin') => notificationTabsFor(role).flatMap(typesOf);
    expect(all('creator')).toEqual(expect.arrayContaining(['SCRIPT_UPDATED', 'PROJECT_NOTE']));
    expect(all('reviewer')).toEqual(expect.arrayContaining(['SCRIPT_UPDATED', 'PROJECT_NOTE', 'FINAL_FILM_REJECTED']));
    expect(typesOf(notificationTabsFor('admin')[0])).toEqual(
      expect.arrayContaining(['SCRIPT_UPDATED', 'PROJECT_NOTE', 'CONTRACT_UPDATED', 'FINAL_FILM_CONFIRMED']),
    );
  });
});

it('pages a list the API returns whole', () => {
  expect(pageOf([1, 2, 3, 4, 5, 6, 7], 2, 3)).toEqual({ rows: [4, 5, 6], totalPages: 3 });
  expect(pageOf([], 1, 3)).toEqual({ rows: [], totalPages: 1 });
});

describe('CostRequestInbox', () => {
  const page = (data: CostRequest[]) => ({ data, meta: { page: 1, limit: 50, total: data.length, totalPages: 1 } });

  it('lets the Admin grant part of what a Reviewer asked for, in VND', async () => {
    signInAs('admin');
    const calls = routeFetch({
      '/cost-requests': page([REQUEST]),
      '/cost-requests/req-1/approve': { ...REQUEST, status: 'APPROVED', grantedVnd: 15_000_000 },
    });
    render(<CostRequestInbox />);

    expect(await screen.findByText('Vùng dịch 704')).toBeInTheDocument();
    expect(screen.getByText('170.000.000 ₫')).toBeInTheDocument();
    const amount = screen.getByLabelText('Số tiền cấp');
    await userEvent.clear(amount);
    await userEvent.type(amount, '15000500');
    expect(screen.getByRole('button', { name: 'Cấp' })).toBeDisabled();
    await userEvent.clear(amount);
    await userEvent.type(amount, '15000000');
    await userEvent.click(screen.getByRole('button', { name: 'Cấp' }));

    const approve = calls.find((c) => c.path === '/cost-requests/req-1/approve');
    expect(JSON.parse(approve!.body as string)).toEqual({ grantedVnd: 15_000_000 });
  });

  it('shows an answered request without the decision buttons', async () => {
    signInAs('admin');
    routeFetch({ '/cost-requests': page([{ ...REQUEST, status: 'REJECTED', adminResponse: 'Hết ngân sách quý này' }]) });
    render(<CostRequestInbox />);
    expect(await screen.findByText(/Hết ngân sách quý này/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cấp' })).not.toBeInTheDocument();
  });
});
