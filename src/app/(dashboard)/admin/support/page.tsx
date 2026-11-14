import { AdminPageFrame } from '@/features/admin/components/AdminPageFrame';
import { StaffSupportWorkspace } from '@/features/staff/components/StaffSupportWorkspace';

export default function AdminSupportPage() {
  return (
    <AdminPageFrame
      title="Hỗ trợ khách hàng (CSKH)"
      description="Theo dõi hàng đợi ca hỗ trợ của thành viên, can thiệp hoặc xử lý ca."
    >
      <StaffSupportWorkspace isAdmin />
    </AdminPageFrame>
  );
}
