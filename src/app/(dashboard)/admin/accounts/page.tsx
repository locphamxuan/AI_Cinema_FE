import { AdminPageFrame } from '@/features/admin/components/AdminPageFrame';
import { AccountsPanel } from '@/features/admin/components/AccountsPanel';

export default function Page() {
  return (
    <AdminPageFrame
      title="Tài khoản"
      description="Tạo tài khoản, đổi vai trò hoặc khoá tài khoản. Thay đổi có hiệu lực ngay."
    >
      <AccountsPanel />
    </AdminPageFrame>
  );
}
