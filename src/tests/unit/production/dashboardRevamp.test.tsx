import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { notificationTabsFor, typesOf } from '@/features/notifications/notificationCatalog';
import { pageOf } from '@/components/data/Pager';
import { downloadFile } from '@/features/production/lib/download';
import { TokenRequestList } from '@/features/token-request/TokenRequestList';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';
import type { TokenRequest } from '@/types/token-request';

const toastError = vi.hoisted(() => vi.fn());
vi.mock('@/components/ui/Toast', () => ({ toast: { error: toastError, success: vi.fn() } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/reviewer/tokens',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

const REQUEST: TokenRequest = {
  id: 'req-1',
  projectId: 'm1',
  seasonId: 's1',
  requestedTokens: 4000,
  grantedTokens: null,
  reason: 'Studio từ chối mức 3000 Token/tập',
  status: 'OPEN',
  reviewerResponse: null,
  resolvedAt: null,
  createdAt: '2026-10-15T08:00:00.000Z',
  project: { id: 'm1', reviewerId: 'r1', creatorId: 'c1', movie: { title: 'Vùng dịch 704' } },
  season: { id: 's1', seasonNumber: 1, title: null },
  requestedBy: { id: 'c1', fullName: 'Creator Một', email: 'c1@x.vn' },
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
    expect(typesOf(creatorTab)).toEqual(expect.arrayContaining(['MEDIA_SUBMITTED', 'STUDIO_HANDOFF_SENT', 'TOKEN_REQUESTED']));
    expect(typesOf(notificationTabsFor('creator')[1])).toEqual(expect.arrayContaining(['TOKEN_REQUEST_APPROVED', 'TOKEN_REQUEST_REJECTED']));
  });
});

it('pages a list the API returns whole', () => {
  expect(pageOf([1, 2, 3, 4, 5, 6, 7], 2, 3)).toEqual({ rows: [4, 5, 6], totalPages: 3 });
  expect(pageOf([], 1, 3)).toEqual({ rows: [], totalPages: 1 });
});

describe('TokenRequestList', () => {
  it('lets the Reviewer grant part of what a Creator asked for', async () => {
    signInAs('reviewer');
    const calls = routeFetch({
      '/token-requests': { data: [REQUEST], meta: { page: 1, limit: 10, total: 1, totalPages: 1 } },
      '/token-requests/req-1/approve': { ...REQUEST, status: 'APPROVED', grantedTokens: 3500 },
    });
    render(<TokenRequestList canAnswer />);

    await userEvent.click(await screen.findByRole('button', { name: /Cấp Token/ }));
    const dialog = await screen.findByRole('dialog');
    const amount = within(dialog).getByLabelText('Số Token cấp');
    await userEvent.clear(amount);
    await userEvent.type(amount, '3500');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cấp Token' }));

    const approve = calls.find((c) => c.path === '/token-requests/req-1/approve');
    expect(JSON.parse(approve!.body as string)).toEqual({ grantedTokens: 3500 });
  });

  it('shows a Creator the answer without the Reviewer buttons', async () => {
    signInAs('creator');
    routeFetch({
      '/token-requests': {
        data: [{ ...REQUEST, status: 'REJECTED', reviewerResponse: 'Hết ngân sách quý này' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    });
    render(<TokenRequestList />);
    expect(await screen.findByText(/Hết ngân sách quý này/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cấp Token/ })).not.toBeInTheDocument();
  });
});