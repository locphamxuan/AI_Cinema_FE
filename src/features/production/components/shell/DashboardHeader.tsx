'use client';

import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { useAppStore } from '@/store/useAppStore';
import { useCan } from '@/hooks/useCan';
import { AREAS, PERMISSION, ROLE_LABEL, canEnter, type Area } from '@/lib/permissions';
import { AccountMenu } from './AccountMenu';
import { NotificationMenu } from './NotificationMenu';

const AREA_ORDER: Area[] = ['creator', 'reviewer', 'staff', 'admin'];

/**
 * Topbar supporting both Clean Modern Light Mode (Apple/Linear/Vercel) and Cinema Dark Mode.
 * Redundant top logo removed so only the distinctive sidebar brand logo is displayed.
 */
export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAppStore();
  const can = useCan();

  const area = AREA_ORDER.find((a) => pathname.startsWith(`/${a}`)) ?? 'reviewer';
  // The Admin oversees production: it reads every project and decides the change requests, never edits a project (BR-55).
  const oversight = area === 'reviewer' && !can(PERMISSION.PROJECT_MANAGE) && can(PERMISSION.PROJECT_READ_ALL);
  const links = AREA_ORDER.filter((a) => a !== area && canEnter(a, user?.role)).map((a) => ({
    href: AREAS[a].path,
    label: AREAS[a].label,
  }));

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white/95 dark:bg-[#0D1017]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] sticky top-0 z-30 w-full transition-colors duration-200 text-slate-900 dark:text-white">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left area: Clean space / Oversight badge (single logo in sidebar below) */}
        <div className="flex items-center gap-3">
          {oversight && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/15">
              Chế độ giám sát
            </span>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {user && (
            <span
              aria-label="Vai trò của tài khoản"
              className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-red-500/30 bg-slate-100/80 dark:bg-red-500/10 text-xs font-semibold text-slate-700 dark:text-red-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-[#E50914] animate-pulse" aria-hidden="true" />
              <span>{ROLE_LABEL[user.role ?? 'user']}</span>
              {area === 'creator' && (
                <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded-md">
                  In-house Screenwriter
                </span>
              )}
            </span>
          )}
          {user && <NotificationMenu />}
          <ThemeToggle />
          <AccountMenu name={user?.name ?? 'Tài khoản'} roleLabel={ROLE_LABEL[user?.role ?? 'user']} onLogout={handleLogout} links={links} />
        </div>
      </div>
    </header>
  );
}
