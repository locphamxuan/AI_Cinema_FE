import { AdminPageFrame } from '@/features/admin/components/AdminSidebar';
import { PlatformSettingsPanel } from '@/features/admin/components/PlatformSettingsPanel';

export default function Page() {
  return (
    <AdminPageFrame>
      <PlatformSettingsPanel />
    </AdminPageFrame>
  );
}
