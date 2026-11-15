import { AdminPageFrame } from '@/features/admin/components/AdminPageFrame';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { PoliciesPanel } from '@/features/policies/PoliciesPanel';
import { PERMISSION } from '@/lib/permissions';

export default function Page() {
  return (
    <AdminPageFrame>
      <PermissionGate permission={PERMISSION.PLATFORM_SETTINGS_MANAGE}>
        <PoliciesPanel />
      </PermissionGate>
    </AdminPageFrame>
  );
}
