import { Suspense } from 'react';
import { AreaGuard } from '@/components/auth/AreaGuard';
import { AppShell } from '@/components/shell/AppShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaGuard area="admin">
      <Suspense>
        <AppShell area="admin">{children}</AppShell>
      </Suspense>
    </AreaGuard>
  );
}
