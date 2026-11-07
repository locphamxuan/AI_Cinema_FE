import { AreaGuard } from '@/components/auth/AreaGuard';
import { CreatorSidebar } from '@/features/production/components/shell/CreatorSidebar';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGuard area="creator">
      <div className="flex flex-col md:flex-row flex-1 w-full bg-[#FAF9F6] dark:bg-[#0D0F17] transition-colors duration-200">
        <CreatorSidebar />
        <div className="flex-1 min-w-0 bg-[#FAF9F6] dark:bg-[#0D0F17]">{children}</div>
      </div>
    </AreaGuard>
  );
}
