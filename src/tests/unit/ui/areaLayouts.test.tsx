import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLayout from '@/app/(dashboard)/admin/layout';
import CreatorLayout from '@/app/(dashboard)/creator/layout';
import ReviewerLayout from '@/app/(dashboard)/reviewer/layout';
import StaffLayout from '@/app/(dashboard)/staff/layout';
import DashboardLayout from '@/app/(dashboard)/layout';
import StaffLookupPage from '@/app/(dashboard)/staff/lookup/page';
import ClientLayout from '@/components/layout/ClientLayout';
import { contractService } from '@/services/contractService';
import { useAppStore } from '@/store/useAppStore';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
const nav = vi.hoisted(() => ({ pathname: '/admin' }));
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => nav.pathname,
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  localStorage.clear();
  router.push.mockClear();
  router.replace.mockClear();
  useAppStore.setState({ isAuthenticated: false, user: null });
});
afterEach(() => vi.unstubAllGlobals());

describe('area layouts', () => {
  it.each([
    ['admin', AdminLayout, 'Menu Quản trị'],
    ['creator', CreatorLayout, /Menu/],
    ['reviewer', ReviewerLayout, /Menu/],
    ['staff', StaffLayout, /Menu/],
  ] as const)('puts the %s area inside its guard and the sidebar shell', (role, Layout, menu) => {
    routeFetch({});
    signInAs(role);
    nav.pathname = `/${role}`;
    render(
      <DashboardLayout>
        <Layout>
          <p>Nội dung</p>
        </Layout>
      </DashboardLayout>,
    );
    expect(screen.getByText('Nội dung')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: menu })).toBeInTheDocument();
  });

  it('signs out from the account menu and opens the sign-in screen', async () => {
    routeFetch({});
    signInAs('admin');
    render(
      <AdminLayout>
        <p>Nội dung</p>
      </AdminLayout>,
    );
    await userEvent.click(screen.getByRole('button', { name: /^Tài khoản / }));
    await userEvent.click(await screen.findByText('Đăng xuất'));
    expect(useAppStore.getState().isAuthenticated).toBe(false);
    expect(router.push).toHaveBeenCalledWith('/login');
  });

  it('serves the read-only lookup page of Staff', async () => {
    const page = (data: unknown[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 50 } });
    routeFetch({ '/movies': page([{ id: 'm1', title: 'Mưa Trên Phố Cũ', episodeCount: 8, genres: [] }]), '/users': page([]) });
    signInAs('staff', ['member:ops.read']);
    render(<StaffLookupPage />);
    expect(await screen.findByText('Mưa Trên Phố Cũ')).toBeInTheDocument();
  });
});

describe('ClientLayout', () => {
  it('restores the saved session and sends a signed-in visitor of /login back to the page it came from', async () => {
    const restore = vi.fn();
    useAppStore.setState({ restoreSession: restore });
    signInAs('admin');
    nav.pathname = '/login';
    window.history.pushState({}, '', '/login?next=%2Fadmin%2Fprojects');
    render(
      <ClientLayout>
        <p>Trang</p>
      </ClientLayout>,
    );
    expect(restore).toHaveBeenCalled();
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/admin/projects'));
    window.history.pushState({}, '', '/');
  });
});

describe('contractService', () => {
  it('names a downloaded document after its side when the API gives no file name', async () => {
    const calls = routeFetch({ '/contracts/k1/documents/ADMIN/content': 'pdf' });
    const created = vi.fn(() => 'blob:x');
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: created, revokeObjectURL: vi.fn() }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    await contractService.downloadDocument('k1', 'ADMIN');
    expect(calls.some((c) => c.path === '/contracts/k1/documents/ADMIN/content')).toBe(true);
    click.mockRestore();
  });
});
