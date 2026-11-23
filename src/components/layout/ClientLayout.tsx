'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { AREAS, homeAreaOf } from '@/lib/permissions';
import { safeNext } from '@/lib/safeNext';
import { toast, ToastContainer } from '@/components/ui/Toast';
import { authSession } from '@/lib/authSession';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, restoreSession } = useAppStore();

  // Bring back the session saved by a previous login so a page reload stays authenticated.
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Each tab keeps its own account. When this tab's session ends elsewhere (signed out in a tab duplicated from
  // this one, or no longer renewable), the window says so and goes back to the sign-in screen instead of failing.
  useEffect(
    () =>
      authSession.subscribe(() => {
        const change = useAppStore.getState().syncSession();
        if (change === 'ended') toast.warning('Phiên đăng nhập của cửa sổ này đã kết thúc', 'Vui lòng đăng nhập lại để tiếp tục.');
      }),
    [],
  );

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
