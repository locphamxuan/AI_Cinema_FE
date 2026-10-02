import { AdminPageFrame } from '@/features/admin/components/AdminSidebar';
import { RolePermissionsPanel } from '@/features/admin/components/RolePermissionsPanel';

export default function Page() {
  return (
    <AdminPageFrame>
      <RolePermissionsPanel />
    </AdminPageFrame>
  );
}
