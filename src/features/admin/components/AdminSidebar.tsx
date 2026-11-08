'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Film,
  LayoutDashboard,
  Clapperboard,
  Inbox,
  Rocket,
  CreditCard,
  Receipt,
  Gift,
  KeyRound,
  Megaphone,
  Bell,
  Settings,
} from 'lucide-react';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';

export function AdminSidebar() {
  const pathname = usePathname();
  const can = useCan();

  const isOverview = pathname === '/admin';
  const isProjects = pathname === '/admin/projects' || pathname.startsWith('/admin/projects/');
  const isRequests = pathname.startsWith('/admin/requests');
  const isMovies = pathname.startsWith('/admin/movies');
  const isBilling = pathname.startsWith('/admin/membership-plans');
  const isCoin = pathname.startsWith('/admin/coin-transactions');
  const isRewards = pathname.startsWith('/admin/rewards');
  const isPermissions = pathname.startsWith('/admin/permissions');
  const isAds = pathname.startsWith('/admin/ads');
  const isNotifications = pathname.startsWith('/admin/notifications');
  const isSettings = pathname.startsWith('/admin/settings');

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
      aria-label="Khu quản trị"
      className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] text-slate-800 dark:text-slate-100 md:min-h-[calc(100vh-3.5rem)] p-3 flex flex-col justify-between transition-colors duration-200"
    >
      <div className="space-y-4">
        {/* Phần Đầu: Logo "AI CINEMA" đỏ #E50914 kèm icon cuộn phim & Badge phân quyền */}
        <div className="px-2 pt-1 pb-2 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center text-white shadow-md font-black">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white tracking-wider">AI CINEMA</p>
              <p className="text-[10px] font-bold text-[#E50914] tracking-wide uppercase">
                ADMIN CONSOLE
              </p>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
            Executive Admin
          </span>
        </div>

        {/* Nhóm 1: QUẢN TRỊ DỰ ÁN & SẢN XUẤT */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 pb-0.5">
            Dự Án & Sản Xuất
          </p>

          {/* [ 🎬 Tổng quan dự án ] */}
          <Link
            href="/admin"
            aria-current={isOverview ? 'page' : undefined}
            className={linkClass(isOverview)}
          >
            {isOverview && (
              <span
                className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.5)]"
                aria-hidden="true"
              />
            )}
            <div className="flex items-center gap-2.5 min-w-0">
              <LayoutDashboard className={iconClass(isOverview)} />
              <span className="truncate">Tổng quan dự án</span>
            </div>
          </Link>

          {/* [ 📜 Kịch bản chờ chốt ] (Dự án phim) */}
          <Link
            href="/admin/projects"
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
              <span className="truncate">Dự án phim</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold">
              2
            </span>
          </Link>

          {/* [ 🤝 Hợp đồng & Studio ] (Duyệt yêu cầu) */}
          <Link
            href="/admin/requests"
            aria-label="Duyệt yêu cầu"
            aria-current={isRequests ? 'page' : undefined}
            className={linkClass(isRequests)}
          >
            {isRequests && (
              <span
                className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.5)]"
                aria-hidden="true"
              />
            )}
            <div className="flex items-center gap-2.5 min-w-0">
              <Inbox className={iconClass(isRequests)} />
              <span className="truncate">Duyệt yêu cầu</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-bold">
              3
            </span>
          </Link>

          {/* [ 🚀 Kho phim chờ Publish ] (Quản lý phim) */}
          <Link
            href="/admin/movies"
            aria-label="Quản lý phim"
            aria-current={isMovies ? 'page' : undefined}
            className={linkClass(isMovies)}
          >
            {isMovies && (
              <span
                className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.5)]"
                aria-hidden="true"
              />
            )}
            <div className="flex items-center gap-2.5 min-w-0">
              <Rocket className={iconClass(isMovies)} />
              <span className="truncate">Quản lý phim</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-[#E50914] text-[10px] font-mono font-bold">
              2
            </span>
          </Link>
        </div>

        {/* Nhóm 2: TÀI CHÍNH & VẬN HÀNH */}
        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 pb-0.5">
            Tài Chính & Người Dùng
          </p>

          {/* Doanh thu OTT */}
          <Link
            href="/admin/membership-plans"
            aria-label="Gói thành viên & Doanh thu"
            aria-current={isBilling ? 'page' : undefined}
            className={linkClass(isBilling)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <CreditCard className={iconClass(isBilling)} />
              <span className="truncate">Gói thành viên & Doanh thu</span>
            </div>
          </Link>

          {/* Giao dịch Coin */}
          <Link
            href="/admin/coin-transactions"
            aria-label="Giao dịch Coin"
            aria-current={isCoin ? 'page' : undefined}
            className={linkClass(isCoin)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Receipt className={iconClass(isCoin)} />
              <span className="truncate">Giao dịch Coin</span>
            </div>
          </Link>

          {/* Điểm danh & vòng quay */}
          <Link
            href="/admin/rewards"
            aria-label="Điểm danh & vòng quay"
            aria-current={isRewards ? 'page' : undefined}
            className={linkClass(isRewards)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Gift className={iconClass(isRewards)} />
              <span className="truncate">Điểm danh & vòng quay</span>
            </div>
          </Link>

          {/* [ 👥 Quản lý người dùng ] (Tài khoản & Phân quyền) */}
          <Link
            href="/admin/permissions"
            aria-label="Tài khoản & Phân quyền"
            aria-current={isPermissions ? 'page' : undefined}
            className={linkClass(isPermissions)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <KeyRound className={iconClass(isPermissions)} />
              <span className="truncate">Tài khoản & Phân quyền</span>
            </div>
          </Link>

          {/* Quảng cáo (nếu có quyền) */}
          {can(PERMISSION.AD_MANAGE) && (
            <Link
              href="/admin/ads"
              aria-label="Quảng cáo"
              aria-current={isAds ? 'page' : undefined}
              className={linkClass(isAds)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Megaphone className={iconClass(isAds)} />
                <span className="truncate">Quảng cáo</span>
              </div>
            </Link>
          )}

          {/* Thông báo */}
          <Link
            href="/admin/notifications"
            aria-label="Thông báo"
            aria-current={isNotifications ? 'page' : undefined}
            className={linkClass(isNotifications)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Bell className={iconClass(isNotifications)} />
              <span className="truncate">Thông báo</span>
            </div>
          </Link>
        </div>

        {/* Nhóm 3: HỆ THỐNG */}
        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 pb-0.5">
            Cấu Hình
          </p>

          {/* [ ⚙️ Cấu hình sàn & Quy định Điều 44 ] (Cài đặt nền tảng) */}
          <Link
            href="/admin/settings"
            aria-label="Cài đặt nền tảng"
            aria-current={isSettings ? 'page' : undefined}
            className={linkClass(isSettings)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Settings className={iconClass(isSettings)} />
              <span className="truncate">Cài đặt nền tảng</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer Profile: Executive Admin */}
      <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] px-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-[#E50914] font-black text-xs">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Quản Trị Viên</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">admin@aicinema.vn</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
