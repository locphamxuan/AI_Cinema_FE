'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  BarChart3,
} from 'lucide-react';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';

export function ReviewerSidebar() {
  const pathname = usePathname();
  const can = useCan();
  const [searchVal, setSearchVal] = useState('');

  const isAuditWorkspace = pathname === '/reviewer';
  const isProjectQueue = pathname === '/reviewer/projects' || pathname.startsWith('/reviewer/projects/');
  const isStudios = pathname.startsWith('/reviewer/studios');
  const isNotifications = pathname.startsWith('/reviewer/notifications');
  const isProfile = pathname.startsWith('/reviewer/profile');

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
      aria-label="CONTENT REVIEW"
      className="md:w-60 lg:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] text-slate-800 dark:text-slate-100 md:min-h-[calc(100vh-3.5rem)] p-3 flex flex-col justify-between transition-colors duration-200"
    >
      <div className="space-y-4">
        {/* Brand & Badge: "AI CINEMA" đỏ #E50914 kèm badge nhỏ: Compliance Reviewer */}
        <div className="px-2 pt-1 pb-2 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center text-white shadow-md font-black">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white tracking-wider">AI CINEMA</p>
              <p className="text-[10px] font-bold text-[#E50914] tracking-wide uppercase">
                CONTENT REVIEW
              </p>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
            Compliance Reviewer
          </span>
        </div>

        {/* [ 🔍 Tìm kiếm dự án ] (Search bar phím tắt Ctrl + K) */}
        <div className="px-1">
          <div className="relative flex items-center rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] px-2.5 py-1.5 focus-within:border-slate-400 dark:focus-within:border-white/20 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Tìm kiếm dự án..."
              aria-label="Tìm kiếm dự án"
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-white/[0.06] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Nhóm 1: THẨM ĐỊNH VIDEO & KỊCH BẢN */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 pb-0.5">
            Thẩm Định Video & Kịch Bản
          </p>

          {/* [ 🎬 Thẩm định video Master ] (Active chính: Màn hình 3 cột kiểm tra video & Điều 44) */}
          <Link
            href="/reviewer"
            aria-current={isAuditWorkspace ? 'page' : undefined}
            className={linkClass(isAuditWorkspace)}
          >
            {isAuditWorkspace && (
              <span
                className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.5)]"
                aria-hidden="true"
              />
            )}
            <div className="flex items-center gap-2.5 min-w-0">
              <Clapperboard className={iconClass(isAuditWorkspace)} />
              <span className="truncate">Thẩm định video Master</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-[#E50914] text-[10px] font-mono font-bold">
              Active
            </span>
          </Link>

          {/* [ 📑 Hàng đợi kịch bản ] (Dự án phim - Queue kịch bản từ Creator) */}
          <Link
            href="/reviewer/projects"
            aria-label="Dự án phim"
            aria-current={isProjectQueue ? 'page' : undefined}
            className={linkClass(isProjectQueue)}
          >
            {isProjectQueue && (
              <span
                className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.5)]"
                aria-hidden="true"
              />
            )}
            <div className="flex items-center gap-2.5 min-w-0">
              <FileCheck2 className={iconClass(isProjectQueue)} />
              <span className="truncate">Hàng đợi kịch bản</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold">
              4
            </span>
          </Link>

          {/* [ ⚖️ Kho lưu trữ Điều 44 ] */}
          <Link
            href="/reviewer"
            className={linkClass(false)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldCheck className={iconClass(false)} />
              <span className="truncate">Kho lưu trữ Điều 44</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
              12
            </span>
          </Link>

          {/* [ 🔔 Yêu cầu chỉnh sửa ] */}
          <Link
            href="/reviewer"
            className={linkClass(false)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldAlert className={iconClass(false)} />
              <span className="truncate">Yêu cầu chỉnh sửa</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold">
              3
            </span>
          </Link>
        </div>

        {/* Nhóm 2: QUẢN LÝ ĐỐI TÁC (Tuyệt đối không có Token) */}
        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 pb-0.5">
            Quản Lý Đối Tác & Hồ Sơ
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

          {/* Thống kê thẩm định */}
          <Link
            href="/reviewer/projects"
            className={linkClass(false)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <BarChart3 className={iconClass(false)} />
              <span className="truncate">Thống kê thẩm định</span>
            </div>
          </Link>

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

      {/* Footer Status */}
      <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] px-2 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Trực Thẩm Định OTT</span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Tuân thủ Pháp lý Điều 44</p>
      </div>
    </nav>
  );
}
