'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Film } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { useAppStore } from '@/store/useAppStore';
import { useCan } from '@/hooks/useCan';
import { AREAS, PERMISSION, ROLE_LABEL, canEnter, type Area } from '@/lib/permissions';
import { AccountMenu } from './AccountMenu';
import { NotificationMenu } from './NotificationMenu';

const AREA_ORDER: Area[] = ['creator', 'reviewer', 'staff', 'admin'];

/** Slim top bar of every internal area: where you are, notifications, theme and the account menu. */
export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, openAuthModal } = useAppStore();
  const can = useCan();

  const area = AREA_ORDER.find((a) => pathname.startsWith(`/${a}`)) ?? 'reviewer';
  // The Admin oversees production: it reads every project and proposes changes, never edits them (BR-55).
  const oversight = area === 'reviewer' && !can(PERMISSION.PROJECT_MANAGE) && can(PERMISSION.PROJECT_READ_ALL);
  const links = AREA_ORDER.filter((a) => a !== area && canEnter(a, user?.role)).map((a) => ({
    href: AREAS[a].path,
    label: AREAS[a].label,
  }));

  const handleLogout = () => {
    logout();
    router.push('/');
    openAuthModal('login');
  };

  return (
    <header className="bg-white dark:bg-[#12141A] border-b border-slate-200 dark:border-white/10 sticky top-0 z-30 w-full transition-colors">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href={AREAS[area].path} className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-600/20 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">{AREAS[area].label}</span>
          {oversight && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              Giám sát
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          {user && <NotificationMenu />}
          <ThemeToggle />
          <AccountMenu name={user?.name ?? 'Tài khoản'} roleLabel={ROLE_LABEL[user?.role ?? 'user']} onLogout={handleLogout} links={links} />
        </div>
      </div>
    </header>
  );
}
