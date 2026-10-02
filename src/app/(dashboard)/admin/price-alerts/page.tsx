import { AdminPageFrame } from '@/features/admin/components/AdminSidebar';
import { PriceAlertsPanel } from '@/features/admin/components/PriceAlertsPanel';

export default function Page() {
  return (
    <AdminPageFrame>
      <PriceAlertsPanel />
    </AdminPageFrame>
  );
}
