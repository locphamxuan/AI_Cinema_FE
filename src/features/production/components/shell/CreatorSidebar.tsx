'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  FileText,
  Handshake,
  Bell,
  Settings,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function CreatorSidebar() {
  const pathname = usePathname();
  const user = useAppStore((state) => state.user);

  const isProjects = pathname === '/creator' || pathname.startsWith('/creator/projects');
  const isScripts = pathname.startsWith('/creator/scripts');
  const isHandoff = pathname.startsWith('/creator/studio-handoff');
  const isNotifications = pathname.startsWith('/creator/notifications');
  const isProfile = pathname.startsWith('/creator/profile');

  const linkClass = (active: boolean) =>
    `group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all duration-150 cursor-pointer ${
      active
        ? 'bg-slate-100 dark:bg-white/[0.08] text-[#111827] dark:text-white font-semibold'
        : 'text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-[#111827] dark:hover:text-white font-medium'
    }`;

  const iconClass = (active: boolean) =>
    `w-4 h-4 shrink-0 transition-colors ${
      active ? 'text-[#111827] dark:text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
    }`;

  const displayName = user?.name || 'Trần Gia Huy';
  const initials = displayName.trim().charAt(0).toUpperCase();

  return (
    <nav
      aria-label="Cổng Biên Kịch Nội Bộ"
      className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-white/[0.08] bg-[#FFFFFF] dark:bg-[#0D1017] text-[#111827] dark:text-slate-100 md:min-h-[calc(100vh-3.5rem)] p-4 flex flex-col justify-between transition-colors duration-200 font-sans"
    >
      <div className="space-y-5">
        {/* Contra Brand Header */}
        <div className="px-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#121212] dark:bg-white text-white dark:text-[#121212]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-[#111827] dark:text-white">
              AI CINEMA
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-purple-100/80 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-500/20">
            CREATOR
          </span>
        </div>

        {/* Profile Mini Card */}
        <Link
          href="/creator/profile"
          className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-200/70 dark:border-white/[0.08] bg-[#F9FAFB] dark:bg-white/[0.03] hover:bg-slate-100/70 dark:hover:bg-white/[0.06] transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#121212] dark:bg-white/10 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#111827] dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                In-house Screenwriter
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </Link>

        {/* Minimalist Menu */}
        <div className="space-y-1">
          <Link
            href="/creator/projects"
            aria-label="Dự án phim"
            aria-current={isProjects ? 'page' : undefined}
            className={linkClass(isProjects)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <LayoutGrid className={iconClass(isProjects)} />
              <span className="truncate">Tổng quan dự án</span>
            </div>
          </Link>

          <Link
            href="/creator/scripts"
            aria-current={isScripts ? 'page' : undefined}
            className={linkClass(isScripts)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className={iconClass(isScripts)} />
              <span className="truncate">Kịch bản phân cảnh</span>
            </div>
          </Link>

          <Link
            href="/creator/studio-handoff"
            aria-current={isHandoff ? 'page' : undefined}
            className={linkClass(isHandoff)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Handshake className={iconClass(isHandoff)} />
              <span className="truncate">Chuyển giao Studio</span>
            </div>
          </Link>
        </div>

        {/* Workspace Section */}
        <div className="space-y-1 pt-3 border-t border-slate-200/60 dark:border-white/[0.06]">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Không gian làm việc
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
              <Settings className={iconClass(isProfile)} />
              <span className="truncate">Cài đặt</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Workspace Note */}
      <div className="pt-4 border-t border-slate-200/60 dark:border-white/[0.06]">
        <div className="rounded-2xl bg-[#F9FAFB] dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#111827] dark:text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Sàn Kịch Bản Nội Bộ</span>
          </div>
          <p className="text-[11px] text-[#64748B] dark:text-slate-400 leading-snug">
            Chuẩn hóa phân cảnh & bàn giao Studio sản xuất B2B.
          </p>
        </div>
      </div>
    </nav>
  );
}
