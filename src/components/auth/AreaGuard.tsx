'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, LogIn } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { authService } from '@/services/authService';
import { AREAS, ROLE_LABEL, canEnter, homeAreaOf, type Area } from '@/lib/permissions';

export interface AreaGuardProps {
  /** Internal area this route subtree belongs to. */
  area: Area;
  children: ReactNode;
}

/**
 * Lets into an internal area only the roles allowed there (lib/permissions AREAS).
 * Everyone else gets a notice with the way to their own area or to sign in.
 * Mount once per area in `app/(dashboard)/<area>/layout.tsx`.
 */
export function AreaGuard({ area, children }: AreaGuardProps) {
  const router = useRouter();
  const { user, logout, openAuthModal } = useAppStore();
  // Right after a reload the store has not restored the session yet; the stored profile decides meanwhile.
  const account = user ?? authService.getStoredUser();

  if (account && canEnter(area, account.role)) return <>{children}</>;

  const home = homeAreaOf(account?.role);
  const signIn = () => {
    if (account) logout();
    router.push('/');
    openAuthModal('login');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-[#161922] border border-amber-200 dark:border-amber-500/30 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" aria-hidden="true" />
        </div>
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
              Đến trang {AREAS[home].label} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={signIn}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            {account ? 'Đăng nhập bằng tài khoản khác' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
