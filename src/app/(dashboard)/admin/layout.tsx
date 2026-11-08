import { AreaGuard } from '@/components/auth/AreaGuard';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGuard area="admin">
      <div className="flex flex-col md:flex-row flex-1 w-full bg-[#F8FAFC] dark:bg-[#090B10] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200">
        <AdminSidebar />
        <div className="flex-1 min-w-0 bg-[#F8FAFC] dark:bg-[#090B10] transition-colors duration-200">{children}</div>
      </div>
    </AreaGuard>
  );
}
