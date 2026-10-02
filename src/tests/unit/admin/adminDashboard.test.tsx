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
  it('lists the Admin sections, projects and released movies included', () => {
    signInAs('admin');
    render(<AdminSidebar />);
    const nav = screen.getByRole('navigation', { name: 'Khu quản trị' });
    for (const label of ['Tài khoản', 'Phân quyền', 'Dự án phim', 'Phim đã phát hành', 'Token Reviewer', 'Cảnh báo giá', 'Cài đặt nền tảng']) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument();
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
  it('lists released movies and opens their project', async () => {
    signInAs('admin');
    routeFetch({
      'GET /movies': {
        body: page([{ id: 'm1', title: 'EXECUTE', synopsis: 'Sci-fi', ageRating: 'T16', releaseYear: 2023, posterUrl: null, genres: [{ id: 'g', name: 'Khoa học viễn tưởng' }] }]),
      },
    });
    render(<AdminMoviesPanel />);
    const link = await screen.findByRole('link', { name: /EXECUTE/ });
    expect(link).toHaveAttribute('href', '/admin/projects/m1?tab=episodes');
  });
});
