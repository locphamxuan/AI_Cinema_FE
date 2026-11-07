import { AreaGuard } from '@/components/auth/AreaGuard';
import { ReviewerSidebar } from '@/features/production/components/shell/ReviewerSidebar';

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGuard area="reviewer">
      <div className="flex flex-col md:flex-row flex-1 w-full">
        <ReviewerSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </AreaGuard>
  );
}
