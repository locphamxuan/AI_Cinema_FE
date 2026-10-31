'use client';

import { ReactNode, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { authService } from '@/services/authService';
import { AREAS, ROLE_LABEL, canEnter, homeAreaOf, type Area } from '@/lib/permissions';

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

  // Without a session the internal areas have one way in: the sign-in screen.
  useEffect(() => {
    if (signedOut) router.replace('/login');
  }, [signedOut, router]);

  if (!mounted || signedOut) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
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
      <div className="max-w-md w-full bg-white dark:bg-card border border-amber-200 dark:border-amber-500/30 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {account ? 'Bạn không có quyền vào trang này' : 'Bạn cần đăng nhập'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
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
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Đến trang {AREAS[home].label}
            </button>
          )}
          <button
            type="button"
            onClick={signIn}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {account ? 'Đăng nhập bằng tài khoản khác' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
