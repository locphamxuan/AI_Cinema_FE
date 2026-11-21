import { Suspense } from 'react';
import { AreaGuard } from '@/components/auth/AreaGuard';
import { AppShell } from '@/components/shell/AppShell';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGuard area="staff">
      <Suspense>
        <AppShell area="staff">{children}</AppShell>
      </Suspense>
    </AreaGuard>
  );
}
