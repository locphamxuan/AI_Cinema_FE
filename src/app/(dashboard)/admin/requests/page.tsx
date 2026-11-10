import { PERMISSION } from '@/lib/permissions';
import { ChangeRequestInbox } from '@/features/admin/components/ChangeRequestInbox';
import { ContractsInboxPanel } from '@/features/admin/components/ContractsInboxPanel';
import { SectionTabs } from '@/features/admin/components/SectionTabs';

export default function Page() {
  return (
    <SectionTabs
      title="Hợp đồng B2B & Duyệt yêu cầu"
      description="Khởi tạo hợp đồng mẫu gửi Studio đối tác, ký duyệt báo giá VNĐ và xử lý đề xuất thay đổi dự án."
      tabs={[
        { key: 'contracts', label: 'Hợp đồng B2B & Studio', permission: PERMISSION.PROJECT_CHANGE_REVIEW, content: <ContractsInboxPanel /> },
        { key: 'changes', label: 'Đề xuất thay đổi dự án', permission: PERMISSION.PROJECT_CHANGE_REVIEW, content: <ChangeRequestInbox /> },
      ]}
    />
  );
}
