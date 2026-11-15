import { PERMISSION } from '@/lib/permissions';
import { ChangeRequestInbox } from '@/features/admin/components/ChangeRequestInbox';
import { CostRequestInbox } from '@/features/admin/components/CostRequestInbox';
import { SectionTabs } from '@/features/admin/components/SectionTabs';

export default function Page() {
  return (
    <SectionTabs
      title="Duyệt yêu cầu"
      description="Đề xuất thay đổi dự án và yêu cầu thêm chi phí sản xuất của Reviewer."
      tabs={[
        { key: 'changes', label: 'Đề xuất thay đổi', permission: PERMISSION.PROJECT_CHANGE_REVIEW, content: <ChangeRequestInbox /> },
        { key: 'costs', label: 'Yêu cầu thêm chi phí', permission: PERMISSION.COST_APPROVE, content: <CostRequestInbox /> },
      ]}
    />
  );
}
