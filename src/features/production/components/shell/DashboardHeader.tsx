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

/**
 * Cinema Dark Topbar: charcoal background #0F121C, Cinema Red badge, sleek border-white/10.
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

  const AreaIcon = AREA_ICON[area] ?? Film;

  return (
    <header className="bg-[#0F121C] backdrop-blur-md border-b border-white/10 sticky top-0 z-30 w-full transition-colors text-white">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo + Area */}
        <Link href={AREAS[area].path} className="flex items-center gap-3 min-w-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E50914] via-[#D10813] to-[#B91C1C] flex items-center justify-center shrink-0 shadow-md shadow-red-950/40 group-hover:scale-105 transition-transform">
            <AreaIcon className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-white leading-tight block tracking-tight group-hover:text-red-400 transition-colors">
              AI Cinema
            </span>
            <span className="text-xs text-slate-400 leading-tight">
              {area === 'creator' ? 'Sản xuất nội dung' : AREAS[area].label}
            </span>
          </div>
          {oversight && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/15">
              Chế độ giám sát
            </span>
          )}
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {user && (
            <span
              aria-label="Vai trò của tài khoản"
              className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" aria-hidden="true" />
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
