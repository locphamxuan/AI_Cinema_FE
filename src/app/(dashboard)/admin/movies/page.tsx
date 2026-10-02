import { AdminPageFrame } from '@/features/admin/components/AdminSidebar';
import { AdminMoviesPanel } from '@/features/admin/components/AdminMoviesPanel';

export default function Page() {
  return (
    <AdminPageFrame>
      <AdminMoviesPanel />
    </AdminPageFrame>
  );
}
