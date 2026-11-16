import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RolePermissionsPanel } from '@/features/admin/components/RolePermissionsPanel';
import { adminService } from '@/services/adminService';

vi.mock('@/services/adminService', () => ({
  adminService: { listPermissions: vi.fn(), listRoles: vi.fn(), setRolePermissions: vi.fn() },
}));
vi.mock('@/components/ui/Toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const api = vi.mocked(adminService);
const ok = <T,>(data: T) => Promise.resolve({ success: true, data });

describe('RolePermissionsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.listPermissions.mockReturnValue(
      ok([
        { key: 'member:ops.read', area: 'operations', description: 'Xem thông tin member (chỉ đọc)' },
        { key: 'role:manage', area: 'admin', description: 'Sửa quyền của từng vai trò' },
      ]) as never
    );
    api.listRoles.mockReturnValue(
      ok(
        ['MEMBER', 'CONTENT_CREATOR', 'CONTENT_REVIEWER', 'STAFF', 'ADMIN'].map((role) => ({
          role,
          permissions: role === 'ADMIN' ? ['member:ops.read', 'role:manage'] : [],
          lockedPermissions: role === 'ADMIN' ? ['role:manage'] : [],
        }))
      ) as never
    );
  });

  it('saves only the roles whose boxes changed', async () => {
    api.setRolePermissions.mockReturnValue(ok({ role: 'STAFF', permissions: ['member:ops.read'], lockedPermissions: [] }) as never);
    render(<RolePermissionsPanel />);

    await userEvent.click(await screen.findByRole('checkbox', { name: 'Staff: Xem thông tin member (chỉ đọc)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Lưu 1 vai trò' }));
    expect(api.setRolePermissions).not.toHaveBeenCalled();
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Lưu phân quyền' }));

    await waitFor(() => expect(api.setRolePermissions).toHaveBeenCalledWith('STAFF', ['member:ops.read']));
    expect(api.setRolePermissions).toHaveBeenCalledTimes(1);
  });

  it('filters the permissions by the search text', async () => {
    render(<RolePermissionsPanel />);
    await screen.findByRole('checkbox', { name: 'Staff: Xem thông tin member (chỉ đọc)' });
    await userEvent.type(screen.getByPlaceholderText(/Tìm kiếm quyền hạn/), 'khongtontai');
    expect(screen.getByText(/Không tìm thấy quyền hạn nào/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Xoá từ khoá tìm kiếm' }));
    expect(screen.getByRole('checkbox', { name: 'Staff: Xem thông tin member (chỉ đọc)' })).toBeInTheDocument();
  });

  it('shows the permissions ADMIN always keeps as locked, not as a checkbox', async () => {
    render(<RolePermissionsPanel />);
    expect(await screen.findByLabelText('Admin luôn giữ quyền này')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Admin: Sửa quyền của từng vai trò' })).not.toBeInTheDocument();
  });
});
