import { AdminPageFrame } from '@/features/admin/components/AdminSidebar';
import { AccountsPanel } from '@/features/admin/components/AccountsPanel';

export default function Page() {
  return (
    <AdminPageFrame
      title="Quản lý Tài khoản"
      description="Tạo, chỉnh sửa vai trò hoặc khoá tài khoản. Thay đổi có hiệu lực tức thì."
      gradient="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800"
    >
      <AccountsPanel />
    </AdminPageFrame>
  );
}
