import { AdminPageFrame } from '@/features/admin/components/AdminSidebar';
import { SubscriptionsPanel } from '@/features/billing-admin/components/SubscriptionsPanel';

export default function Page() {
  return (
    <AdminPageFrame>
      <SubscriptionsPanel />
    </AdminPageFrame>
  );
}
