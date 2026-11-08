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
    `group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
      active
        ? 'bg-red-500/10 text-[#E50914] font-bold border border-red-500/20 shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white border border-transparent'
    }`;

  const iconClass = (active: boolean) =>
    `w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
      active ? 'text-[#E50914]' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
    }`;

  return (
    <nav
      aria-label="CỔNG BIÊN KỊCH NỘI BỘ"
      className="md:w-60 lg:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] text-slate-800 dark:text-slate-100 md:min-h-[calc(100vh-3.5rem)] p-3 flex flex-col justify-between transition-colors duration-200"
    >
      <div className="space-y-4">
        {/* Brand & Badge: "AI CINEMA" đỏ #E50914 kèm badge: In-house Screenwriter */}
        <div className="px-2 pt-1 pb-2 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center text-white shadow-md font-black">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white tracking-wider">AI CINEMA</p>
              <p className="text-[10px] font-bold text-[#E50914] tracking-wide uppercase">
                CỔNG BIÊN KỊCH NỘI BỘ
              </p>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
            Screenwriter
          </span>
        </div>

        {/* [ 🔍 Tìm kiếm kịch bản ] */}
        <div className="px-1">
          <form onSubmit={search} className="relative flex items-center rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] px-2.5 py-1.5 focus-within:border-slate-400 dark:focus-within:border-white/20 transition-all">
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

        {/* Nhóm chức năng chính của In-house Screenwriter */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 pb-0.5">
            Quản Lý Biên Kịch
          </p>

          {/* [ 🎬 Dự Án Kịch Bản ] (Active chính - kèm accessible name Dự án phim) */}
          <Link
            href="/creator/projects"
            aria-label="Dự án phim"
            aria-current={isProjects ? 'page' : undefined}
            className={linkClass(isProjects)}
          >
            {isProjects && (
              <span
                className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.5)]"
                aria-hidden="true"
              />
            )}
            <div className="flex items-center gap-2.5 min-w-0">
              <Clapperboard className={iconClass(isProjects)} />
              <span className="truncate">Dự Án Kịch Bản</span>
            </div>
          </Link>
        </div>

        {/* Nhóm Hồ Sơ & Thông Báo */}
        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 pb-0.5">
            Cá Nhân & Thẩm Định
          </p>

          {/* Thông báo thẩm định */}
          <Link
            href="/creator/notifications"
            aria-current={isNotifications ? 'page' : undefined}
            className={linkClass(isNotifications)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Bell className={iconClass(isNotifications)} />
              <span className="truncate">Thông Báo Thẩm Định</span>
            </div>
          </Link>

          {/* Hồ sơ tác giả */}
          <Link
            href="/creator/profile"
            aria-current={isProfile ? 'page' : undefined}
            className={linkClass(isProfile)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <UserRound className={iconClass(isProfile)} />
              <span className="truncate">Hồ Sơ Tác Giả</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer Status */}
      <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] px-2 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Biên Kịch Nội Bộ</span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Phòng Biên Tập AI Cinema</p>
      </div>
    </nav>
  );
}
