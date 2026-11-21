import { PERMISSION } from '@/lib/permissions';
import { SectionTabs } from '@/features/admin/components/SectionTabs';
import { PlansPanel } from '@/features/billing-admin/components/PlansPanel';
import { SubscriptionsPanel } from '@/features/billing-admin/components/SubscriptionsPanel';
import { BillingReportsPanel } from '@/features/billing-admin/components/BillingReportsPanel';

export default function Page() {
  return (
    <SectionTabs
      title="Gói thành viên & Doanh thu"
      description="Cấu hình gói, danh sách người đăng ký, doanh thu và tỉ lệ rời gói."
      tabs={[
        { key: 'plans', label: 'Các gói thành viên', permission: PERMISSION.BILLING_PLAN_MANAGE, content: <PlansPanel /> },
        { key: 'subscribers', label: 'Người đăng ký', permission: PERMISSION.BILLING_SUBSCRIPTION_READ, content: <SubscriptionsPanel /> },
        { key: 'reports', label: 'Doanh thu & tỉ lệ rời gói', permission: PERMISSION.ANALYTICS_REVENUE_READ, content: <BillingReportsPanel /> },
      ]}
    />
  );
}
