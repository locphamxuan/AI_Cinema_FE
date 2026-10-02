import { AreaGuard } from '@/components/auth/AreaGuard';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGuard area="admin">
      <div className="flex flex-col md:flex-row flex-1 w-full">
        <AdminSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </AreaGuard>
  );
}
