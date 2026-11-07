'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ExternalLink,
  Clapperboard,
  BookOpen,
  Handshake,
  Bell,
  MessageSquare,
  UserRound,
  Settings,
  Coffee,
  Sparkles,
} from 'lucide-react';

export function CreatorSidebar() {
  const pathname = usePathname();

  const isProjects = pathname === '/creator' || pathname.startsWith('/creator/projects');
  const isScripts = pathname.startsWith('/creator/scripts');
  const isHandoff = pathname.startsWith('/creator/studio-handoff');
  const isNotifications = pathname.startsWith('/creator/notifications');
  const isProfile = pathname.startsWith('/creator/profile');

  const linkClass = (active: boolean) =>
    `group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
      active
        ? 'bg-amber-400/15 dark:bg-amber-400/10 text-amber-900 dark:text-amber-300 font-bold shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
    }`;

  const iconClass = (active: boolean) =>
    `w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
      active ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
    }`;

  return (
    <nav
      aria-label="BIÊN KỊCH NỘI BỘ"
      className="md:w-68 lg:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-white/[0.08] bg-[#FAF9F6] dark:bg-[#0D0F17] text-slate-900 dark:text-slate-100 md:min-h-[calc(100vh-3.5rem)] p-4 flex flex-col justify-between transition-colors duration-200"
    >
      <div className="space-y-6">
        {/* Buy Me a Coffee style Friendly Brand Icon */}
        <div className="flex items-center gap-3 px-2 pt-1 pb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#FFDD00] text-slate-950 flex items-center justify-center shadow-sm font-black text-lg">
            <Coffee className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              AI Cinema
            </p>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
              Creator Hub
            </p>
          </div>
        </div>

        {/* Primary Nav */}
        <div className="space-y-1">
          <Link href="/creator/projects" className={linkClass(isProjects)}>
            <div className="flex items-center gap-3">
              <Home className={iconClass(isProjects)} />
              <span>Home</span>
            </div>
          </Link>

          <Link
            href="/phim"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
              <span>View catalog</span>
            </div>
            <span className="text-[10px] text-slate-400">↗</span>
          </Link>
        </div>

        {/* Section: BIÊN SOẠN KỊCH BẢN */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3.5 pb-1">
            KỊCH BẢN (SCRIPTS)
          </p>

          <Link href="/creator/projects" className={linkClass(isProjects)}>
            <div className="flex items-center gap-3">
              <Clapperboard className={iconClass(isProjects)} />
              <span>Dự án kịch bản</span>
            </div>
          </Link>

          <Link href="/creator/scripts" className={linkClass(isScripts)}>
            <div className="flex items-center gap-3">
              <BookOpen className={iconClass(isScripts)} />
              <span>Thư viện phân cảnh</span>
            </div>
          </Link>

          <Link href="/creator/studio-handoff" className={linkClass(isHandoff)}>
            <div className="flex items-center gap-3">
              <Handshake className={iconClass(isHandoff)} />
              <span>Bàn giao Studio</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-[#FFDD00] text-slate-950 font-black text-[9px] uppercase tracking-wider">
              NEW
            </span>
          </Link>
        </div>

        {/* Section: THẨM ĐỊNH & TRAO ĐỔI */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3.5 pb-1">
            THẨM ĐỊNH & PHẢN HỒI
          </p>

          <Link href="/creator/notifications" className={linkClass(isNotifications)}>
            <div className="flex items-center gap-3">
              <Bell className={iconClass(isNotifications)} />
              <span>Thông báo thẩm định</span>
            </div>
          </Link>

          <Link
            href="/creator/projects?tab=changes"
            className={linkClass(pathname.includes('tab=changes'))}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className={iconClass(pathname.includes('tab=changes'))} />
              <span>Góp ý từ Reviewer</span>
            </div>
          </Link>
        </div>

        {/* Section: CÀI ĐẶT & HỒ SƠ */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3.5 pb-1">
            CÀI ĐẶT
          </p>

          <Link href="/creator/profile" className={linkClass(isProfile)}>
            <div className="flex items-center gap-3">
              <UserRound className={iconClass(isProfile)} />
              <span>Hồ sơ biên kịch</span>
            </div>
          </Link>

          <Link href="/creator/profile" className={linkClass(false)}>
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Tùy chọn nền tảng</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Profile Mini Card */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] px-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0">
            BK
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              Biên Kịch Nội Bộ
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              @screenwriter
            </p>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đang trực tuyến" />
      </div>
    </nav>
  );
}
