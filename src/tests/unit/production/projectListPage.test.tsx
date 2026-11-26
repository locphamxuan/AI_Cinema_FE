import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectListPage } from '@/features/production/components/list/ProjectListPage';
import { signInAs } from '@/tests/support/signIn';
import { useAppStore } from '@/store/useAppStore';
import { fakeResponse } from '@/tests/support/fakeResponse';

const nav = vi.hoisted(() => ({ pathname: '/reviewer/projects', params: {} as Record<string, string>, search: '' }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => nav.pathname,
  useParams: () => nav.params,
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const studio = {
  id: 'st1',
  name: 'Studio Sao Mai',
  email: 'saomai@studio.vn',
  contactName: null,
  phone: null,
  note: null,
  isActive: true,
  createdAt: '2026-10-01T00:00:00.000Z',
};
const person = (id: string, fullName: string) => ({ id, fullName, email: `${id}@x.vn` });
const page = {
  data: [
    {
      id: 'm1',
      title: 'Mưa Sài Gòn',
      status: 'IN_PRODUCTION',
      studio,
      reviewerId: 'reviewer-id',
      creatorId: 'creator-id',
      reviewer: person('reviewer-id', 'Reviewer Một'),
      creator: person('creator-id', 'Creator Một'),
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
      lastActivityAt: '2026-10-14T08:30:00.000Z',
      _count: { episodes: 8 },
    },
  ],
  meta: { totalItems: 1, currentPage: 1, totalPages: 1, itemsPerPage: 12 },
};

function routeFetch(routes: Record<string, unknown>) {
  const calls: { path: string; search: URLSearchParams }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const parsed = new URL(url, 'http://x');
      const path = parsed.pathname.replace(/^\/api/, '');
      calls.push({ path, search: parsed.searchParams });
      return fakeResponse(path in routes ? routes[path] : []);
    }),
  );
  return calls;
}

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState({ isAuthenticated: false, user: null });
});
afterEach(() => vi.unstubAllGlobals());

describe('ProjectListPage', () => {
  it('opens with completed projects selected and requests only completed projects', async () => {
    nav.pathname = '/admin/projects';
    signInAs('admin');
    const calls = routeFetch({
      '/projects': { ...page, data: page.data.map((project) => ({ ...project, status: 'COMPLETED' })) },
    });
    render(<ProjectListPage />);

    expect(screen.getByRole('tab', { name: 'Hoàn tất' })).toHaveAttribute('aria-selected', 'true');
    await screen.findAllByText('Mưa Sài Gòn');
    expect(calls.find((call) => call.path === '/projects')!.search.get('filter.status')).toBe('$eq:COMPLETED');
    expect(screen.getByRole('button', { name: /Tạo dự án/ })).toBeInTheDocument();
  });

  it('lets the user switch from the default completed filter to production', async () => {
    nav.pathname = '/admin/projects';
    signInAs('admin');
    const calls = routeFetch({ '/projects': page });
    render(<ProjectListPage />);
    await waitFor(() => expect(calls.some((call) => call.path === '/projects')).toBe(true));
    expect(calls.find((call) => call.path === '/projects')!.search.get('filter.status')).toBe('$eq:COMPLETED');

    await userEvent.click(screen.getByRole('tab', { name: 'Đang sản xuất' }));
    await waitFor(() => expect(calls.filter((call) => call.path === '/projects')).toHaveLength(2));
    expect(screen.getByRole('tab', { name: 'Đang sản xuất' })).toHaveAttribute('aria-selected', 'true');
    expect(calls.filter((call) => call.path === '/projects')[1].search.get('filter.status')).toBe(
      '$in:IN_PRODUCTION,UNDER_REVISION',
    );
  });

  it('shows the latest project activity in table view', async () => {
    nav.pathname = '/reviewer/projects';
    signInAs('reviewer');
    routeFetch({ '/projects': page });
    render(<ProjectListPage />);

    await screen.findAllByText('Mưa Sài Gòn');
    await screen.findByRole('heading', { name: 'Mưa Sài Gòn' });
    await userEvent.click(screen.getByRole('button', { name: 'Xem dạng bảng' }));
    const header = screen.getByRole('columnheader', { name: 'Cập nhật lần cuối' });
    expect(header).toHaveAttribute('title', expect.stringContaining('thay đổi gần nhất'));
    expect(screen.getByText(/14\/10\/26/)).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Cập nhật' })).not.toBeInTheDocument();
  });

  it.each([
    ['/creator/projects', 'creator'],
    ['/reviewer/projects', 'reviewer'],
  ] as const)('does not show project creation to %s', async (path, role) => {
    nav.pathname = path;
    signInAs(role);
    routeFetch({ '/projects': page });
    render(<ProjectListPage />);

    await screen.findByRole('heading', { name: 'Mưa Sài Gòn' });
    expect(screen.queryByRole('button', { name: /Tạo dự án/ })).not.toBeInTheDocument();
  });
});
