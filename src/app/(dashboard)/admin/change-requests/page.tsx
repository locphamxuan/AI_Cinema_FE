import { AdminPageFrame } from '@/features/admin/components/AdminSidebar';
import { ChangeRequestInbox } from '@/features/admin/components/ChangeRequestInbox';

export default function Page() {
  return (
    <AdminPageFrame>
      <ChangeRequestInbox />
    </AdminPageFrame>
  );
}
