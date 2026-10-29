import { PERMISSION } from '@/lib/permissions';
import { SectionTabs } from '@/features/admin/components/SectionTabs';
import { AccountsPanel } from '@/features/admin/components/AccountsPanel';
import { RolePermissionsPanel } from '@/features/admin/components/RolePermissionsPanel';

export default function Page() {
  return (
    <SectionTabs
      title="Tài khoản & Phân quyền"
      description="Quản lý danh sách tài khoản người dùng, nhân sự và phân bổ quyền hạn theo từng vai trò."
      tabs={[
        { key: 'accounts', label: 'Danh sách tài khoản', permission: PERMISSION.USER_READ, content: <AccountsPanel /> },
        { key: 'roles', label: 'Phân quyền theo vai trò', permission: PERMISSION.ROLE_MANAGE, content: <RolePermissionsPanel /> },
      ]}
    />
  );
}
