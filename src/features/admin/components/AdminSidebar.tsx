'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Film,
  LayoutDashboard,
  Clapperboard,
  Handshake,
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
    `group flex items-center justify-between rounded-xl px-3.5 py-2 text-[13px] transition-all duration-150 cursor-pointer ${
      active
        ? 'bg-[#121212] dark:bg-white text-white dark:text-[#121212] font-semibold shadow-sm'
        : 'text-[#64748B] dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/[0.05] hover:text-[#0F172A] dark:hover:text-white font-medium'
    }`;

  const iconClass = (active: boolean) =>
    `w-4 h-4 shrink-0 transition-colors ${
      active ? 'text-white dark:text-[#121212]' : 'text-slate-400 group-hover:text-[#0F172A] dark:group-hover:text-slate-200'
    }`;

  const badgeClass = (active: boolean) =>
    `px-2 py-0.5 rounded-full text-[10px] font-bold ${
      active
        ? 'bg-white/20 text-white dark:bg-black/15 dark:text-[#121212]'
        : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300'
    }`;

  return (
    <nav
      aria-label="Khu quản trị"
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
            Admin Console
          </span>
        </div>

        {/* Nhóm 1: DỰ ÁN & SẢN XUẤT */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            Dự án & Sản xuất
          </p>

          <Link
            href="/admin"
            aria-current={isOverview ? 'page' : undefined}
            className={linkClass(isOverview)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <LayoutDashboard className={iconClass(isOverview)} />
              <span className="truncate">Tổng quan dự án</span>
            </div>
          </Link>

          <Link
            href="/admin/projects"
            aria-label="Dự án phim"
            aria-current={isProjects ? 'page' : undefined}
            className={linkClass(isProjects)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Clapperboard className={iconClass(isProjects)} />
              <span className="truncate">Dự án phim & Kịch bản</span>
            </div>
            <span className={badgeClass(isProjects)}>2</span>
          </Link>

          <Link
            href="/admin/requests"
            aria-label="Duyệt yêu cầu"
            aria-current={isRequests ? 'page' : undefined}
            className={linkClass(isRequests)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Handshake className={iconClass(isRequests)} />
              <span className="truncate">Hợp đồng & Studio</span>
            </div>
            <span className={badgeClass(isRequests)}>3</span>
          </Link>

          <Link
            href="/admin/movies"
            aria-label="Quản lý phim"
            aria-current={isMovies ? 'page' : undefined}
            className={linkClass(isMovies)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Rocket className={iconClass(isMovies)} />
              <span className="truncate">Kho phim chờ phát hành</span>
            </div>
            <span className={badgeClass(isMovies)}>2</span>
          </Link>
        </div>

        {/* Nhóm 2: TÀI CHÍNH & NGƯỜI DÙNG */}
        <div className="space-y-1 pt-3 border-t border-slate-200/70 dark:border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            Tài chính & Người dùng
          </p>

          <Link
            href="/admin/membership-plans"
            aria-label="Gói thành viên & Doanh thu"
            aria-current={isBilling ? 'page' : undefined}
            className={linkClass(isBilling)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <CreditCard className={iconClass(isBilling)} />
              <span className="truncate">Doanh thu OTT & Gói TV</span>
            </div>
          </Link>

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

        {/* Nhóm 3: CẤU HÌNH */}
        <div className="space-y-1 pt-3 border-t border-slate-200/70 dark:border-white/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            Cấu hình
          </p>

          <Link
            href="/admin/settings"
            aria-label="Cài đặt nền tảng"
            aria-current={isSettings ? 'page' : undefined}
            className={linkClass(isSettings)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Settings className={iconClass(isSettings)} />
              <span className="truncate">Cài đặt hệ thống & Điều 44</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer Profile Box */}
      <div className="pt-4 border-t border-slate-200/70 dark:border-white/[0.06]">
        <Link
          href="/admin/profile"
          className="flex items-center gap-2.5 p-2 rounded-2xl bg-[#F9FAFB] dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] hover:bg-slate-100/70 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-[#121212] dark:bg-white text-white dark:text-[#121212] flex items-center justify-center font-bold text-xs shrink-0">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">
              Quản Trị Viên
            </p>
            <p className="text-[10px] text-[#64748B] dark:text-slate-400 truncate">
              admin@aicinema.vn
            </p>
          </div>
        </Link>
      </div>
    </nav>
  );
}
