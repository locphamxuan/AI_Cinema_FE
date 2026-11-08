import { PERMISSION } from '@/lib/permissions';
import { ChangeRequestInbox } from '@/features/admin/components/ChangeRequestInbox';
import { SectionTabs } from '@/features/admin/components/SectionTabs';

export default function Page() {
  return (
    <SectionTabs
      title="Duyệt yêu cầu thay đổi"
      description="Xem và phê duyệt các đề xuất thay đổi dự án, yêu cầu hiệu chỉnh từ Studio đối tác và Đội ngũ sản xuất."
      tabs={[
        { key: 'changes', label: 'Đề xuất thay đổi dự án', permission: PERMISSION.PROJECT_CHANGE_REVIEW, content: <ChangeRequestInbox /> },
      ]}
    />
  );
}
