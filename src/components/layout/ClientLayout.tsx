'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { AREAS, homeAreaOf } from '@/lib/permissions';
import { isOAuthPath, safeNext } from '@/lib/safeNext';
import { ToastContainer } from '@/components/ui/Toast';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, restoreSession } = useAppStore();

  // Bring back the session saved by a previous login so a page reload stays authenticated.
  // A Studio session is kept only on the OAuth consent page, the one page a studio uses here.
  useEffect(() => {
    restoreSession(isOAuthPath(window.location.pathname));
  }, [restoreSession]);

  // Signing in lands each role on its own area, or back on the page that sent it to /login (?next=).
  const area = isAuthenticated ? homeAreaOf(user?.role) : null;
  useEffect(() => {
    if (!isAuthenticated || pathname !== '/login') return;
    const next = safeNext(new URLSearchParams(window.location.search).get('next'));
    if (next) router.replace(next);
    else if (area) router.replace(AREAS[area].path);
  }, [area, isAuthenticated, pathname, router]);

  return (
    <>
      <main className="flex-1 w-full p-0 m-0 bg-background">{children}</main>
      <ToastContainer />
    </>
  );
}
