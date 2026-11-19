'use client';

import type { ReactNode } from 'react';
import { useCan } from '@/hooks/useCan';
import type { PermissionKey } from '@/lib/permissions';

/** A page only accounts holding `permission` may use; the backend refuses the others with 403 anyway. */
export function PermissionGate({ permission, children }: { permission: PermissionKey; children: ReactNode }) {
  const can = useCan();
  if (can(permission)) return <>{children}</>;
  return (
    <main className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="text-3xl font-bold leading-none">Bạn không có quyền mở trang này</h1>
      <p className="mt-2 text-sm text-muted-foreground">Liên hệ Admin nếu bạn cần được cấp quyền.</p>
    </main>
  );
}
