'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Clapperboard, ShieldCheck, Users, Sparkles, Film } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { useAppStore } from '@/store/useAppStore';
import { useCan } from '@/hooks/useCan';
import { AREAS, PERMISSION, ROLE_LABEL, type Area } from '@/lib/permissions';
import { AccountMenu } from './AccountMenu';
import { NotificationMenu } from './NotificationMenu';

const AREA_ORDER: Area[] = ['creator', 'reviewer', 'staff', 'admin'];

const AREA_ICON: Record<Area, React.ElementType> = {
  creator: Clapperboard,
  reviewer: ShieldCheck,
  staff: Users,
  admin: Sparkles,
};

/**
 * Slim top bar of every internal area: where you are, notifications, theme and the account menu.
 * Every role shares the brand colours; the role shows only in its badge.
 */
export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAppStore();
  const can = useCan();

  const area = AREA_ORDER.find((a) => pathname.startsWith(`/${a}`)) ?? 'reviewer';
  // The Admin oversees production: it reads every project and decides the change requests, never edits a project (BR-55).
  const oversight = area === 'reviewer' && !can(PERMISSION.PROJECT_MANAGE) && can(PERMISSION.PROJECT_READ_ALL);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const AreaIcon = AREA_ICON[area] ?? Film;

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/90 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo + Area */}
        <Link href={AREAS[area].path} className="flex items-center gap-3 min-w-0 group">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <AreaIcon className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="block font-heading text-sm font-semibold leading-tight">AI Cinema</span>
            <span className="text-xs leading-tight text-muted-foreground">{AREAS[area].label}</span>
          </div>
          {oversight && (
            <span className="rounded-md border border-primary/20 bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              Chế độ giám sát
            </span>
          )}
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {user && (
            <span
              aria-label="Vai trò của tài khoản"
              className="hidden items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground sm:flex"
            >
              <span className="size-1.5 rounded-full bg-highlight" aria-hidden="true" />
              {ROLE_LABEL[user.role ?? 'user']}
            </span>
          )}
          {user && <NotificationMenu />}
          <ThemeToggle />
          <AccountMenu name={user?.name ?? 'Tài khoản'} roleLabel={ROLE_LABEL[user?.role ?? 'user']} onLogout={handleLogout} profileHref={`/${area}/profile`} />
        </div>
      </div>
    </header>
  );
}
