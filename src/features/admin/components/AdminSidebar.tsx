'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film } from 'lucide-react';
import { useCan } from '@/hooks/useCan';
import { useAppStore } from '@/store/useAppStore';
import { PERMISSION, type PermissionKey } from '@/lib/permissions';

interface NavItem {
  href: string;
  label: string;
  /** Shown only to accounts holding it; none = every Admin. */
  permission?: PermissionKey;
  /** Active on this exact path only (the overview), not on its sub-pages. */
  exact?: boolean;
}

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Dự án & sản xuất',
    items: [
      { href: '/admin', label: 'Tổng quan dự án', exact: true },
      { href: '/admin/projects', label: 'Dự án phim' },
      { href: '/admin/studios', label: 'Studio đối tác', permission: PERMISSION.STUDIO_MANAGE },
      { href: '/admin/requests', label: 'Duyệt yêu cầu' },
      { href: '/admin/movies', label: 'Quản lý phim' },
    ],
  },
  {
    label: 'Tài chính & người dùng',
    items: [
      { href: '/admin/finance', label: 'Tài chính', permission: PERMISSION.FINANCE_REPORT_READ },
      { href: '/admin/membership-plans', label: 'Gói thành viên & Doanh thu' },
      { href: '/admin/coin-transactions', label: 'Giao dịch Coin' },
      { href: '/admin/rewards', label: 'Điểm danh & vòng quay' },
      { href: '/admin/permissions', label: 'Tài khoản & Phân quyền' },
    ],
  },
  {
    label: 'Vận hành',
    items: [
      { href: '/admin/support', label: 'Hỗ trợ khách hàng', permission: PERMISSION.SUPPORT_CASE_READ },
      { href: '/admin/support/ai', label: 'Chatbox AI', permission: PERMISSION.SUPPORT_KNOWLEDGE_MANAGE },
      { href: '/admin/ads', label: 'Quảng cáo', permission: PERMISSION.AD_MANAGE },
      { href: '/admin/policies', label: 'Chính sách', permission: PERMISSION.PLATFORM_SETTINGS_MANAGE },
      { href: '/admin/notifications', label: 'Thông báo' },
      { href: '/admin/settings', label: 'Cài đặt nền tảng' },
    ],
  },
];

const ALL_HREFS = GROUPS.flatMap((g) => g.items.map((i) => i.href));

/** The most specific menu entry the path is under: /admin/support/ai lights "Chatbox AI", not "Hỗ trợ khách hàng". */
export function activeHref(pathname: string): string | null {
  if (pathname === '/admin') return '/admin';
  const matches = ALL_HREFS.filter((href) => href !== '/admin' && (pathname === href || pathname.startsWith(`${href}/`)));
  return matches.sort((a, b) => b.length - a.length)[0] ?? null;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const can = useCan();
  const user = useAppStore((state) => state.user);
  const active = activeHref(pathname);

  return (
    <nav
      aria-label="Khu quản trị"
      className="flex shrink-0 flex-col justify-between border-b border-slate-200/80 bg-white p-3 text-slate-800 transition-colors duration-200 md:min-h-[calc(100vh-3.5rem)] md:w-64 md:border-r md:border-b-0 dark:border-white/[0.08] dark:bg-[#0D1017] dark:text-slate-100"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-200/80 px-2 pt-1 pb-2.5 dark:border-white/[0.06]">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#121212] text-white shadow-xs dark:bg-white dark:text-slate-900">
            <Film className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">AI CINEMA</p>
            <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">Bảng quản trị</p>
          </div>
        </div>

        {GROUPS.map((group, index) => {
          const items = group.items.filter((i) => !i.permission || can(i.permission));
          if (!items.length) return null;
          return (
            <div key={group.label} className={`space-y-1 ${index ? 'border-t border-slate-200 pt-2 dark:border-white/[0.06]' : ''}`}>
              <p className="px-2 pb-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{group.label}</p>
              {items.map(({ href, label }) => {
                const isActive = active === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                      isActive
                        ? 'bg-[#121212] font-semibold text-white shadow-xs dark:bg-white dark:text-slate-900'
                        : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* The signed-in Admin, never a placeholder account */}
      <div className="flex items-center gap-2 border-t border-slate-200 px-2 pt-3 text-xs dark:border-white/[0.06]">
        <div className="flex size-7 items-center justify-center rounded-full bg-[#121212] text-xs font-bold text-white dark:bg-white dark:text-slate-900">
          {(user?.name ?? 'A').trim().charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{user?.name ?? 'Quản Trị Viên'}</p>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{user?.email ?? ''}</p>
        </div>
      </div>
    </nav>
  );
}
