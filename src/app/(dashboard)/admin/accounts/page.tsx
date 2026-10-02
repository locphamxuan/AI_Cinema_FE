import { AdminPageFrame } from '@/features/admin/components/AdminSidebar';
import { AccountsPanel } from '@/features/admin/components/AccountsPanel';

export default function Page() {
  return (
    <AdminPageFrame>
      <AccountsPanel />
    </AdminPageFrame>
  );
}
