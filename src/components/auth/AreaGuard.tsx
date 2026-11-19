'use client';

import { ReactNode, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { authService } from '@/services/authService';
import { AREAS, ROLE_LABEL, canEnter, homeAreaOf, type Area } from '@/lib/permissions';
import { loginUrlFor } from '@/lib/safeNext';

export interface AreaGuardProps {
  /** Internal area this route subtree belongs to. */
  area: Area;
  children: ReactNode;
}

const subscribeNoop = () => () => {};

/**
 * Lets into an internal area only the roles allowed there (lib/permissions AREAS).
 * Everyone else gets a notice with the way to their own area or to sign in.
 * Mount once per area in `app/(dashboard)/<area>/layout.tsx`.
 */
export function AreaGuard({ area, children }: AreaGuardProps) {
  const router = useRouter();
  const { user, logout } = useAppStore();
  // Avoid hydration mismatch between server-render (no session in SSR) and client-render (session in localStorage).
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  // Right after a reload the store has not restored the session yet; the stored profile decides meanwhile.
  const account = user ?? authService.getStoredUser();
  const signedOut = mounted && !account;

  // Without a session the internal areas have one way in: the sign-in screen, which brings the browser back here.
  useEffect(() => {
    if (signedOut) router.replace(loginUrlFor(`${window.location.pathname}${window.location.search}`));
  }, [signedOut, router]);

  if (!mounted || signedOut) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (account && canEnter(area, account.role)) return <>{children}</>;

  const home = homeAreaOf(account?.role);
  const signIn = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-amber-200 dark:border-amber-500/30 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-2">
            {account ? 'Bạn không có quyền vào trang này' : 'Bạn cần đăng nhập'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {account
              ? `Trang ${AREAS[area].label} không dành cho vai trò ${ROLE_LABEL[account.role ?? 'user']}.`
              : `Đăng nhập bằng tài khoản được cấp quyền vào ${AREAS[area].label}.`}
          </p>
        </div>
        <div className="space-y-3">
          {home && (
            <button
              type="button"
              onClick={() => router.push(AREAS[home].path)}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Đến trang {AREAS[home].label}
            </button>
          )}
          <button
            type="button"
            onClick={signIn}
            className="w-full py-3 px-4 rounded-xl bg-muted hover:bg-muted text-secondary-foreground font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {account ? 'Đăng nhập bằng tài khoản khác' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
