import { AdminPageFrame } from '@/features/admin/components/AdminPageFrame';
import { BillingReportsPanel } from '@/features/billing-admin/components/BillingReportsPanel';

export default function Page() {
  return (
    <AdminPageFrame title="Báo cáo gói thành viên" description="Doanh thu gói và tỉ lệ rời gói theo khoảng thời gian.">
      <BillingReportsPanel />
    </AdminPageFrame>
  );
}
