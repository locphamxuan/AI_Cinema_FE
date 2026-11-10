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
  Scale,
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
    `group flex items-center justify-between rounded-full px-3.5 py-2 text-[13px] transition-all duration-150 cursor-pointer ${
      active
        ? 'bg-[#121212] dark:bg-white text-white dark:text-[#121212] font-semibold shadow-sm'
        : 'text-[#64748B] dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/[0.05] hover:text-[#0F172A] dark:hover:text-white font-medium'
    }`;

  const iconClass = (active: boolean) =>
    `w-4 h-4 shrink-0 transition-colors ${
      active ? 'text-white dark:text-[#121212]' : 'text-slate-400 group-hover:text-[#0F172A] dark:group-hover:text-slate-200'
    }`;

  return (
    <nav
      aria-label="CONTENT REVIEW"
      className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200/70 dark:border-white/[0.08] bg-[#FFFFFF] dark:bg-[#0D1017] text-[#0F172A] dark:text-slate-100 md:min-h-[calc(100vh-3.5rem)] p-4 flex flex-col justify-between transition-colors duration-200 font-sans"
    >
      <div className="space-y-5">
        {/* Contra Brand Header */}
        <div className="px-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#121212] dark:bg-white text-white dark:text-[#121212]">
              <Film className="w-4 h-4" />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-[#0F172A] dark:text-white">
              AI CINEMA
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10">
            Reviewer
          </span>
        </div>

        {/* Pill Search Bar */}
        <div>
          <div className="relative flex items-center rounded-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] px-3.5 py-1.5 focus-within:bg-white dark:focus-within:bg-white/[0.08] focus-within:border-slate-400 dark:focus-within:border-white/20 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Tìm kiếm dự án..."
              aria-label="Tìm kiếm dự án"
              className="w-full bg-transparent text-xs text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Nhóm 1: THẨM ĐỊNH VIDEO & KỊCH BẢN */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            Thẩm định & Kiểm duyệt
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
              <span className="truncate">Hàng đợi kịch bản</span>
            </div>
            <span
              className={`w-5 h-5 inline-flex items-center justify-center rounded-full text-[10px] font-bold ${
                isProjectQueue
                  ? 'bg-white/20 text-white dark:bg-black/15 dark:text-[#121212]'
                  : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200'
              }`}
            >
              4
            </span>
          </Link>

          <Link href="/reviewer" className={linkClass(false)}>
            <div className="flex items-center gap-2.5 min-w-0">
              <Scale className={iconClass(false)} />
              <span className="truncate">Hồ sơ cấp phép Điều 44</span>
            </div>
          </Link>

          <Link href="/reviewer" className={linkClass(false)}>
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldAlert className={iconClass(false)} />
              <span className="truncate">Ticket yêu cầu chỉnh sửa</span>
            </div>
          </Link>
        </div>

        {/* Nhóm 2: ĐỐI TÁC & BÁO CÁO */}
        <div className="space-y-1 pt-3 border-t border-slate-200/70 dark:border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            Đối tác & Thống kê
          </p>

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

          <Link href="/reviewer/projects" className={linkClass(false)}>
            <div className="flex items-center gap-2.5 min-w-0">
              <BarChart3 className={iconClass(false)} />
              <span className="truncate">Báo cáo thẩm định</span>
            </div>
          </Link>

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

      {/* Footer Note */}
      <div className="pt-4 border-t border-slate-200/70 dark:border-white/[0.06]">
        <div className="rounded-2xl bg-[#F9FAFB] dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#0F172A] dark:text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Kiểm Định Pháp Lý AI</span>
          </div>
          <p className="text-[11px] text-[#64748B] dark:text-slate-400 leading-snug">
            Thẩm định Master 4K & chứng nhận tuân thủ Điều 44.
          </p>
        </div>
      </div>
    </nav>
  );
}
