'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useAppStore } from '@/store/useAppStore';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { Film } from 'lucide-react';
import { AREAS, PERMISSION, ROLE_LABEL, canEnter, type Area } from '@/lib/permissions';
import { useCan } from '@/hooks/useCan';
import { AccountMenu } from './AccountMenu';

const AREA_ORDER: Area[] = ['creator', 'reviewer', 'staff', 'admin'];

/** Slim top bar of every internal area: where you are, theme, and the account menu. */
export function RoleNavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { resetWorkspace } = useWorkflowStore();
  const { user, logout, openAuthModal } = useAppStore();
  const can = useCan();

  const area = AREA_ORDER.find((a) => pathname.startsWith(`/${a}`)) ?? 'reviewer';
  const readOnly = area === 'reviewer' && !can(PERMISSION.PROJECT_MANAGE) && !can(PERMISSION.PLAN_REVIEW);
  const links = AREA_ORDER.filter((a) => a !== area && canEnter(a, user?.role)).map((a) => ({ href: AREAS[a].path, label: AREAS[a].label }));

  const handleLogout = () => {
    logout();
    router.push('/');
    openAuthModal('login');
  };

  return (
    <header className="bg-white dark:bg-[#12141A] border-b border-slate-200 dark:border-white/10 sticky top-0 z-30 w-full transition-colors">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-600/20 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
          </div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">{AREAS[area].label}</h1>
          {readOnly && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">Chỉ xem</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <AccountMenu
            name={user?.name ?? 'Tài khoản'}
            roleLabel={ROLE_LABEL[user?.role ?? 'user']}
            onResetWorkspace={resetWorkspace}
            onLogout={handleLogout}
            links={links}
          />
        </div>
      </div>
    </header>
  );
}
