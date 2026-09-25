'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Role } from '@/types/workflow';

const ROLE_COPY: Record<Role, { label: string; path: string; accent: string }> = {
  creator: { label: 'Người sản xuất nội dung', path: '/creator', accent: 'text-purple-600 dark:text-purple-400' },
  reviewer: { label: 'Người kiểm duyệt nội dung', path: '/reviewer', accent: 'text-purple-600 dark:text-purple-400' },
};

export interface RoleGuardProps {
  /** Role required to view this route subtree. */
  role: Role;
  children: ReactNode;
}

/**
 * Blocks a route subtree from the wrong role, showing a full-screen notice
 * with a way back to their own dashboard instead of a confusing page.
 * Mount once per role in `app/(dashboard)/<role>/layout.tsx` — it then
 * covers every nested route (e.g. reviewer's audit sub-route) for free.
 */
export function RoleGuard({ role, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout, openAuthModal } = useAppStore();

  const wrongRole = user?.role && user.role !== role && (user.role === 'creator' || user.role === 'reviewer');
  if (!isAuthenticated || !wrongRole) {
    return <>{children}</>;
  }

  const mine = ROLE_COPY[role];
  const theirs = ROLE_COPY[user!.role as Role];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0C10] text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 font-sans transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#161922] border border-amber-200 dark:border-amber-500/30 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Bạn không có quyền vào trang này</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Bạn đang đăng nhập với vai trò <strong className={theirs.accent}>{theirs.label}</strong>. Trang này chỉ
            dành cho <strong className={mine.accent}>{mine.label}</strong>.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => router.push(theirs.path)}
            className="w-full py-3 px-4 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-200 dark:shadow-none"
          >
            <span>Đến trang {theirs.label}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              logout();
              router.push('/');
              openAuthModal('login');
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-semibold transition cursor-pointer"
          >
            Đăng xuất để vào bằng tài khoản {mine.label}
          </button>
        </div>
      </div>
    </div>
  );
}
