'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Film,
  Clapperboard,
  Bell,
  UserRound,
  Search,
} from 'lucide-react';

export function CreatorSidebar() {
  const pathname = usePathname();
  const [searchVal, setSearchVal] = useState('');
  const router = useRouter();
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) router.push(`/creator/projects?q=${encodeURIComponent(searchVal.trim())}`);
  };

  const isProjects = pathname === '/creator' || pathname.startsWith('/creator/projects');
  const isNotifications = pathname.startsWith('/creator/notifications');
  const isProfile = pathname.startsWith('/creator/profile');

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
      aria-label="CỔNG BIÊN KỊCH NỘI BỘ"
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
                Biên Kịch Nội Bộ
              </p>
            </div>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
            Creator
          </span>
        </div>

        <div className="px-1">
          <form onSubmit={search} className="relative flex items-center rounded-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] px-3 py-1.5 focus-within:bg-white focus-within:border-slate-400 dark:focus-within:border-white/25 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Tìm kịch bản, đề tài..."
              aria-label="Tìm kịch bản"
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
          </form>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 pb-0.5">
            Công việc
          </p>

          <Link
            href="/creator/projects"
            aria-label="Dự án phim"
            aria-current={isProjects ? 'page' : undefined}
            className={linkClass(isProjects)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Clapperboard className={iconClass(isProjects)} />
              <span className="truncate">Dự án kịch bản</span>
            </div>
          </Link>
        </div>

        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 pb-0.5">
            Tài khoản
          </p>

          <Link
            href="/creator/notifications"
            aria-current={isNotifications ? 'page' : undefined}
            className={linkClass(isNotifications)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Bell className={iconClass(isNotifications)} />
              <span className="truncate">Thông báo</span>
            </div>
          </Link>

          <Link
            href="/creator/profile"
            aria-current={isProfile ? 'page' : undefined}
            className={linkClass(isProfile)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <UserRound className={iconClass(isProfile)} />
              <span className="truncate">Hồ sơ cá nhân</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] px-2 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Biên kịch nội bộ</span>
        </div>
      </div>
    </nav>
  );
}
