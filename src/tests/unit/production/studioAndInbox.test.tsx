import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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
  _count: { projects: 0, handoffs: 0 },
  ...patch,
});

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState({ isAuthenticated: false, user: null });
});
afterEach(() => vi.unstubAllGlobals());

describe('StudiosPage (BR-59)', () => {
  it('lets the Admin add a studio and delete only one nobody used', async () => {
    nav.pathname = '/admin/studios';
    signInAs('admin');
    const calls = routeFetch({ '/studios': [studio(), studio({ id: 'st2', name: 'Studio Đã Dùng', email: 'used@x.vn', _count: { projects: 2, handoffs: 3 } })] });
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

  it('asks before deleting or deactivating a studio, and pages a long catalog', async () => {
    nav.pathname = '/admin/studios';
    signInAs('admin');
    const many = Array.from({ length: 16 }, (_, i) => studio({ id: `s${i}`, name: `Studio ${String(i).padStart(2, '0')}`, email: `s${i}@x.vn` }));
    const calls = routeFetch({ '/studios': many, '/studios/s0': {} });
    render(<StudiosPage />);

    await screen.findByText('Studio 00');
    expect(screen.queryByText('Studio 15')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Xoá Studio 00' }));
    const dialog = await screen.findByRole('dialog');
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Xoá Studio' }));
    await waitFor(() => expect(calls.some((c) => c.method === 'DELETE' && c.path === '/studios/s0')).toBe(true));

    await userEvent.click(screen.getAllByRole('button', { name: 'Ngừng dùng' })[0]);
    expect(calls.some((c) => c.method === 'PATCH')).toBe(false);
    expect(await screen.findByRole('dialog')).toHaveTextContent('không được chọn cho dự án mới');

    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Huỷ' }));
    await userEvent.click(screen.getByRole('button', { name: 'Trang 2' }));
    expect(await screen.findByText('Studio 15')).toBeInTheDocument();
  });

  it('shows the catalog read-only to Reviewer or an account that cannot manage it', async () => {
    nav.pathname = '/reviewer/studios';
    signInAs('reviewer');
    routeFetch({ '/studios': [studio()] });
    render(<StudiosPage />);

    expect(await screen.findByText('Studio Ánh Trăng')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Thêm Studio/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Xoá Studio/ })).not.toBeInTheDocument();
  });
});

describe('ChangeRequestInbox (BR-55)', () => {
  const request = {
    id: 'cr1',
    projectId: 'm1',
    requestType: 'DEADLINE_EXTENSION',
    content: 'Lùi hạn giao tập 2 thêm một tuần.',
    reason: 'Kịch bản dài hơn dự kiến.',
    attachmentName: 'bao-gia.pdf',
    status: 'OPEN',
    adminResponse: null,
    createdAt: '2026-10-14T01:00:00.000Z',
    resolvedAt: null,
    requestedBy: { id: 'c1', fullName: 'Creator Một' },
    resolvedBy: null,
    season: { id: 's1', seasonNumber: 1, title: null },
    episode: null,
    project: { id: 'm1', reviewerId: 'r1', creatorId: null, movie: { title: 'Mưa Sài Gòn' } },
  };

  it('lists open requests with their reason and proof for the Admin to decide', async () => {
    signInAs('admin');
    const calls = routeFetch({ '/change-requests': [request] });
    render(<ChangeRequestInbox />);

    expect(await screen.findByText('Mưa Sài Gòn')).toBeInTheDocument();
    expect(screen.getByText('Kịch bản dài hơn dự kiến.')).toBeInTheDocument();
    expect(screen.getByText('Gia hạn thời gian')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bao-gia\.pdf/ })).toBeInTheDocument();
    expect(calls[0]).toMatchObject({ path: '/change-requests', method: 'GET' });

    await userEvent.click(screen.getByRole('button', { name: /Duyệt/ }));
    expect(calls.some((c) => c.path === '/change-requests/cr1/approve')).toBe(false);
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Duyệt đề xuất' }));
    await waitFor(() => expect(calls.some((c) => c.method === 'POST' && c.path === '/change-requests/cr1/approve')).toBe(true));
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
    ['reviewer', '/reviewer/projects', 'Kiểm duyệt nội dung'],
    ['creator', '/creator/projects', 'Sản xuất nội dung'],
    ['admin', '/admin/accounts', 'Quản trị'],
    ['staff', '/staff', 'Vận hành'],
  ] as const)('shows the area label without the removed role pill for %s', (role, pathname, areaLabel) => {
    nav.pathname = pathname;
    signInAs(role);
    routeFetch({});
    render(<DashboardHeader />);

    expect(screen.getByText(areaLabel)).toBeInTheDocument();
    expect(screen.queryByLabelText('Vai trò của tài khoản')).not.toBeInTheDocument();
  });

  it('keeps only the profile of the current area and sign out in the account menu', async () => {
    nav.pathname = '/admin/accounts';
    signInAs('admin');
    routeFetch({});
    render(<DashboardHeader />);

    await userEvent.click(screen.getByRole('button', { name: /^Tài khoản/ }));
    const items = screen.getAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual(['Hồ sơ tài khoản', 'Đăng xuất']);
    expect(items[0]).toHaveAttribute('href', '/admin/profile');
  });
});
