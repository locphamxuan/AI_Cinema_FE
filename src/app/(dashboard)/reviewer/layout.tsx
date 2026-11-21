import { Suspense } from 'react';
import { AreaGuard } from '@/components/auth/AreaGuard';
import { AppShell } from '@/components/shell/AppShell';

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGuard area="reviewer">
      <Suspense>
        <AppShell area="reviewer">{children}</AppShell>
      </Suspense>
    </AreaGuard>
  );
}
