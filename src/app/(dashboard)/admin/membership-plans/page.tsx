import { AdminPageFrame } from '@/features/admin/components/AdminSidebar';
import { PlansPanel } from '@/features/billing-admin/components/PlansPanel';

export default function Page() {
  return (
    <AdminPageFrame>
      <PlansPanel />
    </AdminPageFrame>
  );
}
