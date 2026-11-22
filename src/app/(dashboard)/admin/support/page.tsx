import { Suspense } from 'react';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { PERMISSION } from '@/lib/permissions';
import { AdminPageFrame } from '@/features/admin/components/AdminPageFrame';
import { StaffSupportWorkspace } from '@/features/staff/components/StaffSupportWorkspace';

export default function AdminSupportPage() {
  return (
    <AdminPageFrame
      title="Hỗ trợ khách hàng"
      description="Yêu cầu hỗ trợ AI chuyển cho nhân viên: theo dõi hàng chờ, giao cho Staff hoặc tự xử lý."
    >
      <PermissionGate permission={PERMISSION.SUPPORT_CASE_READ}>
        <Suspense>
          <StaffSupportWorkspace isAdmin />
        </Suspense>
      </PermissionGate>
    </AdminPageFrame>
  );
}
