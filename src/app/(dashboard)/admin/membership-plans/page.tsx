import { PERMISSION } from '@/lib/permissions';
import { SectionTabs } from '@/features/admin/components/SectionTabs';
import { PlansPanel } from '@/features/billing-admin/components/PlansPanel';
import { SubscriptionsPanel } from '@/features/billing-admin/components/SubscriptionsPanel';
import { BillingReportsPanel } from '@/features/billing-admin/components/BillingReportsPanel';

export default function Page() {
  return (
    <SectionTabs
      title="Gói thành viên & Doanh thu"
      description="Quản lý cấu hình gói, danh sách thành viên đăng ký và báo cáo doanh thu rời gói."
      tabs={[
        { key: 'plans', label: 'Các gói thành viên', permission: PERMISSION.BILLING_PLAN_MANAGE, content: <PlansPanel /> },
        { key: 'subscribers', label: 'Người đăng ký', permission: PERMISSION.BILLING_SUBSCRIPTION_READ, content: <SubscriptionsPanel /> },
        { key: 'reports', label: 'Báo cáo doanh thu & Rời gói', permission: PERMISSION.ANALYTICS_REVENUE_READ, content: <BillingReportsPanel /> },
      ]}
    />
  );
}
