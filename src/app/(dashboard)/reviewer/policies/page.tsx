import { PermissionGate } from '@/components/auth/PermissionGate';
import { Panel } from '@/components/data/ui';
import { InForcePolicies } from '@/features/policies/InForcePolicies';
import { PERMISSION } from '@/lib/permissions';

/** The Reviewer's read-only view of the rules in force; the same list shows beside each compliance check. */
export default function Page() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-6">
      <PermissionGate permission={PERMISSION.CONTENT_REVIEW}>
        <Panel
          title="Chính sách đang áp dụng"
          description="Các quy định bạn phải đối chiếu khi gắn nhãn AI và kiểm tra pháp lý của từng tập phim. Admin quản lý danh sách này."
        >
          <InForcePolicies />
        </Panel>
      </PermissionGate>
    </main>
  );
}
