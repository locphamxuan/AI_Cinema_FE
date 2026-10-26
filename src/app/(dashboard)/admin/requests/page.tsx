import { PERMISSION } from '@/lib/permissions';
import { ChangeRequestInbox } from '@/features/admin/components/ChangeRequestInbox';
import { ReviewerTokensPanel } from '@/features/admin/components/ReviewerTokensPanel';
import { SectionTabs } from '@/features/admin/components/SectionTabs';
import { AdminTokenRequests } from '@/features/token-request/AdminTokenRequests';

export default function Page() {
  return (
    <SectionTabs
      title="Duyệt yêu cầu"
      description="Đề xuất thay đổi dự án, yêu cầu xin thêm Token và ngân sách Token của từng Reviewer."
      tabs={[
        { key: 'changes', label: 'Đề xuất thay đổi', permission: PERMISSION.PROJECT_CHANGE_REVIEW, content: <ChangeRequestInbox /> },
        { key: 'tokens', label: 'Xin thêm Token', permission: PERMISSION.PROJECT_CHANGE_REVIEW, content: <AdminTokenRequests /> },
        { key: 'budgets', label: 'Ngân sách Token Reviewer', permission: PERMISSION.TOKEN_BUDGET_MANAGE, content: <ReviewerTokensPanel /> },
      ]}
    />
  );
}
