import { PERMISSION } from '@/lib/permissions';
import { SectionTabs } from '@/features/admin/components/SectionTabs';
import { PlansPanel } from '@/features/billing-admin/components/PlansPanel';
import { SubscriptionsPanel } from '@/features/billing-admin/components/SubscriptionsPanel';

export default function Page() {
  return (
    <SectionTabs
      title="Gói thành viên"
      description="Các gói đang bán và những thành viên đã đăng ký."
      tabs={[
        { key: 'plans', label: 'Các gói', permission: PERMISSION.BILLING_PLAN_MANAGE, content: <PlansPanel /> },
        { key: 'subscribers', label: 'Người đăng ký', permission: PERMISSION.BILLING_SUBSCRIPTION_READ, content: <SubscriptionsPanel /> },
      ]}
    />
  );
}
