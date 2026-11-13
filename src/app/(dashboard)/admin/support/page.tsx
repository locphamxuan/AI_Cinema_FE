import { StaffSupportWorkspace } from '@/features/staff/components/StaffSupportWorkspace';

export default function AdminSupportPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Hỗ trợ khách hàng (CSKH)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Theo dõi hàng đợi ca hỗ trợ của thành viên, can thiệp hoặc xử lý ca.
        </p>
      </div>
      <StaffSupportWorkspace isAdmin />
    </div>
  );
}
