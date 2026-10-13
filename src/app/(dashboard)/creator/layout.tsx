import { AreaGuard } from '@/components/auth/AreaGuard';
import { CreatorSidebar } from '@/features/production/components/shell/CreatorSidebar';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGuard area="creator">
      <div className="flex flex-col md:flex-row flex-1 w-full">
        <CreatorSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </AreaGuard>
  );
}
