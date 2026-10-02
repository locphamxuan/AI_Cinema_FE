import { AdminPageFrame } from '@/features/admin/components/AdminSidebar';
import { ReviewerTokensPanel } from '@/features/admin/components/ReviewerTokensPanel';

export default function Page() {
  return (
    <AdminPageFrame>
      <ReviewerTokensPanel />
    </AdminPageFrame>
  );
}
