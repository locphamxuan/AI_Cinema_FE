import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountsPanel } from '@/features/admin/components/AccountsPanel';
import { ASSIGNABLE_ROLES, BACKEND_ROLES } from '@/features/admin/roles';
import { StudiosPage } from '@/features/studio/components/StudiosPage';
import { STUDIO } from '@/tests/support/projectContext';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe('STUDIO accounts', () => {
  it('lets the Admin list the logins of a studio and open a new one', async () => {
    signInAs('admin');
    const calls = routeFetch({
      '/studios': [STUDIO],
      '/studios/st1/accounts': [{ id: 'u1', email: 'studio@aicinema.com', fullName: 'Lan', role: 'STUDIO', isActive: true, studioId: 'st1' }],
    });
    render(<StudiosPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Tài khoản của Lumen Studio' }));
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText('studio@aicinema.com')).toBeInTheDocument();

    const create = within(dialog).getByRole('button', { name: 'Tạo tài khoản' });
    await userEvent.type(within(dialog).getByLabelText('Họ tên người phụ trách'), 'Nguyễn Lan');
    await userEvent.type(within(dialog).getByLabelText('Email đăng nhập'), 'Lan@Lumen.vn');
    await userEvent.type(within(dialog).getByLabelText('Mật khẩu ban đầu'), 'ngan');
    expect(create).toBeDisabled();
    await userEvent.type(within(dialog).getByLabelText('Mật khẩu ban đầu'), 'Studio@123');
    await userEvent.click(create);

    await waitFor(() => {
      const sent = calls.find((c) => c.path === '/studios/st1/accounts' && c.method === 'POST');
      expect(JSON.parse(sent!.body as string)).toEqual({ fullName: 'Nguyễn Lan', email: 'lan@lumen.vn', password: 'nganStudio@123' });
    });
  });

  it('gives a Reviewer the catalog but not the logins', async () => {
    signInAs('reviewer');
    routeFetch({ '/studios': [STUDIO] });
    render(<StudiosPage />);

    await screen.findByText('Lumen Studio');
    expect(screen.queryByRole('button', { name: 'Tài khoản của Lumen Studio' })).not.toBeInTheDocument();
  });

  it('never offers STUDIO as a role to move an account to', () => {
    expect(BACKEND_ROLES).toContain('STUDIO');
    expect(ASSIGNABLE_ROLES).not.toContain('STUDIO');
  });

  it('shows a STUDIO account by its role, with no role picker', async () => {
    signInAs('admin');
    routeFetch({
      '/users': {
        data: [
          { id: 'u1', email: 'studio@aicinema.com', fullName: 'Lan Studio', role: 'STUDIO', isActive: true, createdAt: '2026-11-01T00:00:00.000Z' },
          { id: 'u2', email: 'c@x.vn', fullName: 'Creator Hai', role: 'CONTENT_CREATOR', isActive: true, createdAt: '2026-11-01T00:00:00.000Z' },
        ],
        meta: { totalItems: 2, currentPage: 1, totalPages: 1, itemsPerPage: 20 },
      },
    });
    render(<AccountsPanel />);

    expect((await screen.findAllByText('Studio đối tác')).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText('Vai trò của Lan Studio')).not.toBeInTheDocument();
    expect((await screen.findAllByLabelText('Vai trò của Creator Hai')).length).toBeGreaterThan(0);
  });
});
