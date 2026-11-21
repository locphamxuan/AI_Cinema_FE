import { Suspense } from 'react';
import { AreaGuard } from '@/components/auth/AreaGuard';
import { AppShell } from '@/components/shell/AppShell';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGuard area="creator">
      <Suspense>
        <AppShell area="creator">{children}</AppShell>
      </Suspense>
    </AreaGuard>
  );
}
