'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import SidebarFooter from './SidebarFooter';
import SidebarProfileCard from './SidebarProfileCard';
import { X, ChevronRight } from 'lucide-react';

/** Work areas a staff role can open from the sidebar; an admin sees all three. */
const ROLE_PORTALS = [
  {
    href: '/creator',
    label: 'AI Studio (Maker)',
    subtitle: 'Đạo diễn & Sản xuất phim AI',
    roles: ['CREATOR', 'ADMIN'],
  },
  {
    href: '/reviewer',
    label: 'Kiểm duyệt (Reviewer)',
    subtitle: 'Kiểm duyệt & Cấp phép AI',
    roles: ['REVIEWER', 'ADMIN'],
  },
  {
    href: '/admin',
    label: 'Quản trị (Admin)',
    subtitle: 'Quản lý toàn bộ hệ thống',
    roles: ['ADMIN'],
  },
];

export default function RightSidebar() {
  const pathname = usePathname();
  const { user, isVIPMode, openDepositModal, currentMovie, movies, isRightSidebarOpen, closeRightSidebar } =
    useAppStore();

  // The movie being watched, else the first one in the catalog (none while it loads).
  const activeMovie = currentMovie ?? movies[0] ?? null;

  // Define sidebar navigation items with Lucide icons
  const sidebarNavItems = [
    {
      href: '/profile/saved',
      label: 'Phim đã lưu',
    },
    {
      href: '/profile/history',
      label: 'Lịch sử xem',
    },
    {
      href: '/profile/devices',
      label: 'Quản lý thiết bị',
    },
    {
      href: '/profile/library',
      label: 'Kho phim đã mua',
    },
    {
      href: '/profile/subscription',
      label: 'Gói hội viên',
      badge: isVIPMode ? 'Đang dùng' : 'Nâng cấp',
      badgeColor: isVIPMode
        ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
        : 'bg-ruby/20 text-ruby-300 border-ruby/40 hover:bg-ruby hover:text-white',
    },
    {
      href: '/profile/transactions',
      label: 'Lịch sử giao dịch',
    },
    {
      href: '/profile',
      label: 'Hồ sơ cá nhân',
    },
    {
      href: '#deposit',
      label: 'Nạp tiền vào ví',
      onClick: () => {
        closeRightSidebar();
        openDepositModal();
      },
      badge: '+20% Thưởng',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse',
    },
  ];

  const userRole = user?.role?.toUpperCase();
  const portals = ROLE_PORTALS.filter((portal) => userRole && portal.roles.includes(userRole));

  return (
    <>
      {/* Backdrop for mobile */}
      {isRightSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={closeRightSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="right-sidebar"
        aria-label="Bảng điều khiển cá nhân"
        className={`fixed top-0 right-0 h-full w-80 bg-white/95 dark:bg-[#080B11]/95 backdrop-blur-xl border-l border-slate-200 dark:border-white/10 z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:translate-x-0 ${
          isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-ruby animate-pulse" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">Khu Vực Thành Viên</span>
          </div>
          <button
            onClick={closeRightSidebar}
            aria-label="Đóng bảng điều khiển"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10">
          {user && <SidebarProfileCard user={user} isVIPMode={isVIPMode} />}

          {/* Navigation Items */}
          <div className="space-y-1">
            {sidebarNavItems.map((item) => {
              const isActive = pathname === item.href;

              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                        {item.label}
                      </span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeRightSidebar}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-ruby/10 border border-ruby/20 text-ruby'
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-semibold group-hover:text-slate-900 dark:group-hover:text-white truncate">
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Role Special Portals */}
          {portals.length > 0 && (
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-1">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 px-2.5 pb-1">
                Khu Vực Phân Quyền
              </p>

              {portals.map(({ href, label, subtitle }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeRightSidebar}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <SidebarFooter movie={activeMovie} />
      </aside>
    </>
  );
}
