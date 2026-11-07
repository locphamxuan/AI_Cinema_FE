'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { AREAS, homeAreaOf } from '@/lib/permissions';
import { ToastContainer } from '@/components/ui/Toast';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, restoreSession } = useAppStore();

  // Bring back the session saved by a previous login so a page reload stays authenticated.
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Signing in lands each role on its own area.
  const area = isAuthenticated ? homeAreaOf(user?.role) : null;
  useEffect(() => {
    if (area && pathname === '/login') router.replace(AREAS[area].path);
  }, [area, pathname, router]);

  return (
    <>
      <main className="flex-1 w-full p-0 m-0 bg-background">{children}</main>
      <ToastContainer />
    </>
  );
}
