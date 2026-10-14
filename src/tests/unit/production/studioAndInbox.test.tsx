import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangeRequestInbox } from '@/features/admin/components/ChangeRequestInbox';
import { DashboardHeader } from '@/features/production/components/shell/DashboardHeader';
import { StudiosPage } from '@/features/studio/components/StudiosPage';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';
import { useAppStore } from '@/store/useAppStore';

const nav = vi.hoisted(() => ({ pathname: '/reviewer/studios' }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => nav.pathname,
}));

const studio = (patch: object = {}) => ({
  id: 'st1',
  name: 'Studio Ánh Trăng',
  email: 'contact@anhtrang.vn',
  contactName: 'Chị Lan',
  phone: null,
  note: null,
  isActive: true,
  createdAt: '2026-10-01T00:00:00.000Z',
  _count: { movies: 0, handoffs: 0 },
  ...patch,
});

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState({ isAuthenticated: false, user: null });
});
afterEach(() => vi.unstubAllGlobals());

describe('StudiosPage (BR-59)', () => {
  it('lets the Reviewer add a studio and delete only one nobody used', async () => {
    signInAs('reviewer');
    const calls = routeFetch({ '/studios': [studio(), studio({ id: 'st2', name: 'Studio Đã Dùng', email: 'used@x.vn', _count: { movies: 2, handoffs: 3 } })] });
    render(<StudiosPage />);

    expect(await screen.findByText('Studio Ánh Trăng')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xoá Studio Ánh Trăng' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xoá Studio Đã Dùng' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Thêm Studio/ }));
    const dialog = await screen.findByRole('dialog');
    const save = within(dialog).getByRole('button', { name: 'Lưu' });
    expect(save).toBeDisabled();
    await userEvent.type(within(dialog).getByLabelText(/Tên Studio/), 'Studio Mới');
    await userEvent.type(within(dialog).getByLabelText(/Email nhận brief/), 'moi@studio.vn');
    expect(save).toBeEnabled();
    await userEvent.click(save);
    expect(calls.some((c) => c.method === 'POST' && c.path === '/studios')).toBe(true);
  });

  it('shows the catalog read-only to an account that cannot manage it', async () => {
    signInAs('creator', []);
    routeFetch({ '/studios': [studio()] });
    render(<StudiosPage />);

    expect(await screen.findByText('Studio Ánh Trăng')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Thêm Studio/ })).not.toBeInTheDocument();
  });
});

describe('ChangeRequestInbox (BR-55)', () => {
  const request = {
    id: 'cr1',
    movieId: 'm1',
    requestType: 'BUDGET_SUPPLEMENT',
    content: 'Studio báo giá lại, cần thêm Token.',
    reason: 'Kịch bản dài hơn dự kiến.',
    requestedTokens: '12000',
    attachmentName: 'bao-gia.pdf',
    status: 'OPEN',
    adminResponse: null,
    createdAt: '2026-10-14T01:00:00.000Z',
    resolvedAt: null,
    requestedBy: { id: 'c1', fullName: 'Creator Một' },
    resolvedBy: null,
    season: { id: 's1', seasonNumber: 1, title: null },
    episode: null,
    movie: { id: 'm1', title: 'Mưa Sài Gòn', reviewerId: 'r1' },
  };

  it('lists open requests with their reason, proof and tokens for the Admin to decide', async () => {
    signInAs('admin');
    const calls = routeFetch({ '/change-requests': [request] });
    render(<ChangeRequestInbox />);

    expect(await screen.findByText('Mưa Sài Gòn')).toBeInTheDocument();
    expect(screen.getByText('Kịch bản dài hơn dự kiến.')).toBeInTheDocument();
    expect(screen.getByText(/Xin thêm 12\.000 Token/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bao-gia\.pdf/ })).toBeInTheDocument();
    expect(calls[0]).toMatchObject({ path: '/change-requests', method: 'GET' });

    await userEvent.click(screen.getByRole('button', { name: /Duyệt/ }));
    expect(calls.some((c) => c.method === 'POST' && c.path === '/change-requests/cr1/approve')).toBe(true);
  });

  it('asks for a reason before rejecting', async () => {
    signInAs('admin');
    routeFetch({ '/change-requests': [request] });
    render(<ChangeRequestInbox />);

    await userEvent.click(await screen.findByRole('button', { name: /Từ chối/ }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'Từ chối' })).toBeDisabled();
    await userEvent.type(within(dialog).getByLabelText(/Lý do/), 'Chưa đủ chứng từ.');
    expect(within(dialog).getByRole('button', { name: 'Từ chối' })).toBeEnabled();
  });
});

describe('DashboardHeader', () => {
  it.each([
    ['reviewer', '/reviewer/projects', 'Content Reviewer'],
    ['creator', '/creator/projects', 'Content Creator'],
    ['admin', '/admin/accounts', 'Admin'],
    ['staff', '/staff', 'Staff'],
  ] as const)('shows the role of the %s account', (role, pathname, label) => {
    nav.pathname = pathname;
    signInAs(role);
    routeFetch({});
    render(<DashboardHeader />);

    expect(screen.getByLabelText('Vai trò của tài khoản')).toHaveTextContent(label);
  });
});
