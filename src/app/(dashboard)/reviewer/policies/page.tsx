import { PermissionGate } from '@/components/auth/PermissionGate';
import { PoliciesPanel } from '@/features/policies/PoliciesPanel';
import { PERMISSION } from '@/lib/permissions';

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-6">
      <PermissionGate permission={PERMISSION.CONTENT_REVIEW}>
        <PoliciesPanel />
      </PermissionGate>
    </main>
  );
}
