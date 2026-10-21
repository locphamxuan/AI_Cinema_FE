import { AdminPageFrame } from '@/features/admin/components/AdminSidebar';
import { CoinLedgerPanel } from '@/features/billing-admin/components/CoinLedgerPanel';

export default function Page() {
  return (
    <AdminPageFrame>
      <CoinLedgerPanel />
    </AdminPageFrame>
  );
}
