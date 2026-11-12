'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Clapperboard,
  FileCheck2,
  ShieldAlert,
  Film,
  Building2,
  Bell,
  UserRound,
  ShieldCheck,
} from 'lucide-react';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';

export function ReviewerSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const can = useCan();
  const [searchVal, setSearchVal] = useState('');
  const router = useRouter();
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) router.push(`/reviewer/projects?q=${encodeURIComponent(searchVal.trim())}`);
  };

  const activeFilter = searchParams?.get('filter');
  const isAuditWorkspace = pathname === '/reviewer';
  const isApprovedFilter = pathname === '/reviewer/projects' && activeFilter === 'approved';
  const isRevisingFilter = pathname === '/reviewer/projects' && activeFilter === 'revising';
  const isProjectQueue =
    (pathname === '/reviewer/projects' && !isApprovedFilter && !isRevisingFilter) ||
    pathname.startsWith('/reviewer/projects/');
  const isStudios = pathname.startsWith('/reviewer/studios');
  const isNotifications = pathname.startsWith('/reviewer/notifications');
  const isProfile = pathname.startsWith('/reviewer/profile');

  const linkClass = (active: boolean) =>
    `group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-200 cursor-pointer ${
      active
        ? 'bg-[#121212] text-white font-semibold shadow-xs dark:bg-white dark:text-slate-900'
        : 'text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
    }`;

  const iconClass = (active: boolean) =>
    `w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
      active ? 'text-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
    }`;

  return (
    <nav
      aria-label="CONTENT REVIEW"
      className="md:w-60 lg:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] text-slate-800 dark:text-slate-100 md:min-h-[calc(100vh-3.5rem)] p-3 flex flex-col justify-between transition-colors duration-200"
    >
      <div className="space-y-4">
        <div className="px-2 pt-1 pb-2.5 border-b border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#121212] dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-xs shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate">AI CINEMA</p>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                Content Review
              </p>
            </div>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
            Reviewer
          </span>
        </div>

        <div className="px-1">
          <form onSubmit={search} className="relative flex items-center rounded-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] px-3 py-1.5 focus-within:bg-white focus-within:border-slate-400 dark:focus-within:border-white/25 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Tìm kiếm dự án..."
              aria-label="Tìm kiếm dự án"
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
          </form>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 pb-0.5">
            Thẩm định nội dung
          </p>

          <Link
            href="/reviewer"
            aria-current={isAuditWorkspace ? 'page' : undefined}
            className={linkClass(isAuditWorkspace)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Clapperboard className={iconClass(isAuditWorkspace)} />
              <span className="truncate">Thẩm định video Master</span>
            </div>
          </Link>

          <Link
            href="/reviewer/projects"
            aria-label="Dự án phim"
            aria-current={isProjectQueue ? 'page' : undefined}
            className={linkClass(isProjectQueue)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FileCheck2 className={iconClass(isProjectQueue)} />
              <span className="truncate">Hàng đợi dự án</span>
            </div>
          </Link>

          <Link
            href="/reviewer/projects?filter=approved"
            aria-current={isApprovedFilter ? 'page' : undefined}
            className={linkClass(isApprovedFilter)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldCheck className={iconClass(isApprovedFilter)} />
              <span className="truncate">Phim Final</span>
            </div>
          </Link>

          <Link
            href="/reviewer/projects?filter=revising"
            aria-current={isRevisingFilter ? 'page' : undefined}
            className={linkClass(isRevisingFilter)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldAlert className={iconClass(isRevisingFilter)} />
              <span className="truncate">Yêu cầu chỉnh sửa</span>
            </div>
          </Link>
        </div>

        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 pb-0.5">
            Đối tác &amp; Tài khoản
          </p>

          {/* Studio Manage */}
          {can(PERMISSION.STUDIO_MANAGE) && (
            <Link
              href="/reviewer/studios"
              aria-current={isStudios ? 'page' : undefined}
              className={linkClass(isStudios)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Building2 className={iconClass(isStudios)} />
                <span className="truncate">Studio đối tác</span>
              </div>
            </Link>
          )}

          {/* Thông báo */}
          <Link
            href="/reviewer/notifications"
            aria-current={isNotifications ? 'page' : undefined}
            className={linkClass(isNotifications)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Bell className={iconClass(isNotifications)} />
              <span className="truncate">Thông báo</span>
            </div>
          </Link>

          {/* Hồ sơ tài khoản */}
          <Link
            href="/reviewer/profile"
            aria-current={isProfile ? 'page' : undefined}
            className={linkClass(isProfile)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <UserRound className={iconClass(isProfile)} />
              <span className="truncate">Hồ sơ tài khoản</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] px-2 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Content Review · Điều 44</span>
        </div>
      </div>
    </nav>
  );
}
