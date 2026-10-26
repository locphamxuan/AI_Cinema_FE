import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountsPanel } from '@/features/admin/components/AccountsPanel';
import { AdminMoviesPanel } from '@/features/admin/components/AdminMoviesPanel';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { signInAs } from '@/tests/support/signIn';
import { useAppStore } from '@/store/useAppStore';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/admin/accounts',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

const account = {
  id: 'u1',
  email: 'creator09@aicinema.com',
  fullName: 'Lê Minh Châu',
  role: 'CONTENT_CREATOR',
  isActive: true,
  createdAt: '2026-10-01T00:00:00.000Z',
};

/** Answers by method and path; records every request. */
function routeFetch(routes: Record<string, { status?: number; body: unknown }>) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const path = new URL(url, 'http://x').pathname.replace(/^\/api/, '');
    const hit = routes[`${init?.method ?? 'GET'} ${path}`] ?? { body: [] };
    const status = hit.status ?? 200;
    return { ok: status < 400, status, json: async () => hit.body, headers: new Headers() };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const page = (data: unknown[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 20 } });

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState({ isAuthenticated: false, user: null });
});
afterEach(() => vi.unstubAllGlobals());

describe('AdminSidebar', () => {
  it('lists the Admin sections, the requests and settings merged into one each', () => {
    signInAs('admin');
    render(<AdminSidebar />);
    const nav = screen.getByRole('navigation', { name: 'Khu quản trị' });
    for (const label of ['Tài khoản', 'Phân quyền', 'Dự án phim', 'Duyệt yêu cầu', 'Quản lý phim', 'Cài đặt nền tảng']) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument();
    }
    for (const merged of ['Token Reviewer', 'Cảnh báo giá', 'Đề xuất chờ duyệt', 'Yêu cầu cấp thêm Token']) {
      expect(within(nav).queryByRole('link', { name: merged })).toBeNull();
    }
    expect(within(nav).getByRole('link', { name: 'Tài khoản' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('AccountsPanel', () => {
  it('creates a staff account with a valid password', async () => {
    signInAs('admin');
    const fetchMock = routeFetch({ 'GET /users': { body: page([account]) }, 'POST /users': { status: 201, body: account } });
    render(<AccountsPanel />);

    await userEvent.click(await screen.findByRole('button', { name: /Tạo tài khoản/ }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Họ tên'), 'Phạm Thu');
    await userEvent.type(within(dialog).getByLabelText('Email'), 'thu@aicinema.com');
    await userEvent.type(within(dialog).getByLabelText('Mật khẩu ban đầu'), '12345678');
    const submit = within(dialog).getByRole('button', { name: 'Tạo tài khoản' });
    // A password needs a letter and a digit.
    expect(submit).toBeDisabled();
    await userEvent.clear(within(dialog).getByLabelText('Mật khẩu ban đầu'));
    await userEvent.type(within(dialog).getByLabelText('Mật khẩu ban đầu'), 'Thu@2026');
    await userEvent.click(submit);

    const post = fetchMock.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'POST');
    expect(JSON.parse((post![1] as RequestInit).body as string)).toEqual({
      fullName: 'Phạm Thu',
      email: 'thu@aicinema.com',
      role: 'CONTENT_CREATOR',
      password: 'Thu@2026',
    });
  });

  it('asks before deleting and calls DELETE', async () => {
    signInAs('admin');
    const fetchMock = routeFetch({ 'GET /users': { body: page([account]) }, 'DELETE /users/u1': { status: 204, body: null } });
    render(<AccountsPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Xoá Lê Minh Châu' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Xoá tài khoản' }));
    expect(fetchMock.mock.calls.some(([url, init]) => (init as RequestInit | undefined)?.method === 'DELETE' && String(url).endsWith('/users/u1'))).toBe(true);
  });
});

describe('AdminMoviesPanel', () => {
  it('shows one genre per tab with hearts, plays and Coin per movie, then per episode', async () => {
    signInAs('admin');
    routeFetch({
      'GET /admin/films/genres': { body: [{ id: 'g1', name: 'Kinh dị', movieCount: 1 }, { id: 'g2', name: 'Cổ trang', movieCount: 2 }] },
      'GET /admin/films': {
        body: [
          {
            id: 'm1', title: 'Vùng dịch 704', posterUrl: null, status: 'COMPLETED', releaseYear: 2026, ageRating: 'T16',
            genres: [{ id: 'g1', name: 'Kinh dị' }], likeCount: 12, viewCount: 340, purchases: 9, coinsEarned: 27, refundedCoins: 0,
            episodes: [
              { id: 'e1', episodeNumber: 1, title: 'Tập 1', coinPrice: 0, status: 'PUBLISHED', views: 200, purchases: 0, coinsEarned: 0, refundedCoins: 0 },
              { id: 'e2', episodeNumber: 2, title: 'Tập 2', coinPrice: 3, status: 'PUBLISHED', views: 140, purchases: 9, coinsEarned: 27, refundedCoins: 0 },
            ],
          },
        ],
      },
    });
    render(<AdminMoviesPanel />);
    expect(await screen.findByRole('tab', { name: /Kinh dị/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Cổ trang/ })).toBeInTheDocument();
    const link = await screen.findByRole('link', { name: 'Vùng dịch 704' });
    expect(link).toHaveAttribute('href', '/admin/projects/m1?tab=episodes');
    expect(screen.getByText('340')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Xem từng tập của Vùng dịch 704/ }));
    expect(screen.getByText('Tập 2')).toBeInTheDocument();
    expect(screen.getByText('3 Coin')).toBeInTheDocument();
  });
});
