'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Clapperboard, ShieldCheck, Users, Sparkles, Film } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { useAppStore } from '@/store/useAppStore';
import { useCan } from '@/hooks/useCan';
import { AREAS, PERMISSION, ROLE_LABEL, canEnter, type Area } from '@/lib/permissions';
import { AccountMenu } from './AccountMenu';
import { NotificationMenu } from './NotificationMenu';

const AREA_ORDER: Area[] = ['creator', 'reviewer', 'staff', 'admin'];

const AREA_ICON: Record<Area, React.ElementType> = {
  creator: Clapperboard,
  reviewer: ShieldCheck,
  staff: Users,
  admin: Sparkles,
};

const AREA_GRADIENT: Record<Area, string> = {
  creator: 'from-blue-600 to-purple-600',
  reviewer: 'from-emerald-600 to-teal-500',
  staff: 'from-amber-500 to-orange-500',
  admin: 'from-purple-600 to-violet-500',
};

/** Slim top bar of every internal area: where you are, notifications, theme and the account menu. */
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

  const AreaIcon = AREA_ICON[area] ?? Film;
  const gradient = AREA_GRADIENT[area] ?? 'from-purple-600 to-violet-500';

  return (
    <header className="bg-white/95 dark:bg-[#12141A]/95 backdrop-blur-md border-b border-slate-200/60 dark:border-white/[0.08] sticky top-0 z-30 w-full transition-colors shadow-sm">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo + Area */}
        <Link href={AREAS[area].path} className="flex items-center gap-3 min-w-0 group">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200`}>
            <AreaIcon className="w-4.5 h-4.5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-none block">
              AI Cinema
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-none">{AREAS[area].label}</span>
          </div>
          {oversight && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              Giám sát
            </span>
          )}
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {user && (
            <span
              aria-label="Vai trò của tài khoản"
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${gradient} text-xs font-semibold text-white shadow-sm`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/70" aria-hidden="true" />
              {ROLE_LABEL[user.role ?? 'user']}
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
