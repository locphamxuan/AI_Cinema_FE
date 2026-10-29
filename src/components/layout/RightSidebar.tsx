'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import SidebarFooter from './SidebarFooter';
import SidebarProfileCard from './SidebarProfileCard';
import {
  X,
  Crown,
  CreditCard,
  Clock,
  User,
  Coins,
  Clapperboard,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  Bookmark,
  Laptop,
  KeyRound,
} from 'lucide-react';

export default function RightSidebar() {
  const pathname = usePathname();
  const {
    user,
    isVIPMode,
    openDepositModal,
    currentMovie,
    movies,
    isRightSidebarOpen,
    closeRightSidebar,
    toggleRightSidebar,
  } = useAppStore();

  // The movie being watched, else the first one in the catalog (none while it loads).
  const activeMovie = currentMovie ?? movies[0] ?? null;

  // Define sidebar navigation items with Lucide icons
  const sidebarNavItems = [
    {
      href: '/profile/saved',
      label: 'Phim đã lưu',
      icon: Bookmark,
      iconColor: 'text-amber-400 group-hover:text-amber-300',
      iconBg: 'bg-amber-400/10 border-amber-400/20 group-hover:bg-amber-400/20',
    },
    {
      href: '/profile/history',
      label: 'Lịch sử xem',
      icon: Clock,
      iconColor: 'text-purple-400 group-hover:text-purple-300',
      iconBg: 'bg-purple-400/10 border-purple-400/20 group-hover:bg-purple-400/20',
    },
    {
      href: '/profile/devices',
      label: 'Quản lý thiết bị',
      icon: Laptop,
      iconColor: 'text-sky-400 group-hover:text-sky-300',
      iconBg: 'bg-sky-400/10 border-sky-400/20 group-hover:bg-sky-400/20',
    },
    {
      href: '/profile/library',
      label: 'Kho phim đã mua',
      icon: KeyRound,
      iconColor: 'text-fuchsia-400 group-hover:text-fuchsia-300',
      iconBg: 'bg-fuchsia-400/10 border-fuchsia-400/20 group-hover:bg-fuchsia-400/20',
    },
    {
      href: '/profile/subscription',
      label: 'Gói hội viên',
      icon: Crown,
      iconColor: 'text-amber-400 group-hover:text-amber-300',
      iconBg: 'bg-amber-400/10 border-amber-400/20 group-hover:bg-amber-400/20',
      badge: isVIPMode ? 'Đang dùng' : 'Nâng cấp',
      badgeColor: isVIPMode
        ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
        : 'bg-ruby/20 text-ruby-300 border-ruby/40 hover:bg-ruby hover:text-white',
    },
    {
      href: '/profile/transactions',
      label: 'Lịch sử giao dịch',
      icon: CreditCard,
      iconColor: 'text-emerald-400 group-hover:text-emerald-300',
      iconBg: 'bg-emerald-400/10 border-emerald-400/20 group-hover:bg-emerald-400/20',
    },
    {
      href: '/profile',
      label: 'Hồ sơ cá nhân',
      icon: User,
      iconColor: 'text-indigo-400 group-hover:text-indigo-300',
      iconBg: 'bg-indigo-400/10 border-indigo-400/20 group-hover:bg-indigo-400/20',
    },
    {
      href: '#deposit',
      label: 'Nạp tiền vào ví',
      icon: Coins,
      iconColor: 'text-amber-400 group-hover:text-amber-300',
      iconBg: 'bg-amber-400/10 border-amber-400/20 group-hover:bg-amber-400/20',
      onClick: () => {
        closeRightSidebar();
        openDepositModal();
      },
      badge: '+20% Thưởng',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse',
    },
  ];

  const creatorItem = {
    href: '/creator',
    label: 'AI Studio (Maker)',
    subtitle: 'Đạo diễn & Sản xuất phim AI',
    icon: Clapperboard,
    roleBadge: 'Maker',
  };

  const reviewerItem = {
    href: '/reviewer',
    label: 'Kiểm duyệt (Reviewer)',
    subtitle: 'Kiểm duyệt & Cấp phép AI',
    icon: ShieldCheck,
    roleBadge: 'Reviewer',
  };

  const adminItem = {
    href: '/admin',
    label: 'Quản trị (Admin)',
    subtitle: 'Quản lý toàn bộ hệ thống',
    icon: SlidersHorizontal,
    roleBadge: 'Admin',
  };

  const userRole = user?.role?.toUpperCase();
  const showCreator = userRole === 'CREATOR' || userRole === 'ADMIN';
  const showReviewer = userRole === 'REVIEWER' || userRole === 'ADMIN';
  const showAdmin = userRole === 'ADMIN';

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
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Khu Vực Thành Viên
            </span>
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
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.iconBg} shrink-0`}>
                        <Icon className={`w-4 h-4 ${item.iconColor}`} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                        {item.label}
                      </span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}>
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
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.iconBg} shrink-0`}>
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <span className="text-xs font-semibold group-hover:text-slate-900 dark:group-hover:text-white truncate">
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Role Special Portals */}
          {(showCreator || showReviewer || showAdmin) && (
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 pb-1">
                Khu Vực Phân Quyền
              </p>

              {showCreator && (
                <Link
                  href={creatorItem.href}
                  onClick={closeRightSidebar}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <Clapperboard className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{creatorItem.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{creatorItem.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              )}

              {showReviewer && (
                <Link
                  href={reviewerItem.href}
                  onClick={closeRightSidebar}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{reviewerItem.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{reviewerItem.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              )}

              {showAdmin && (
                <Link
                  href={adminItem.href}
                  onClick={closeRightSidebar}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-ruby/10 border border-ruby/20 flex items-center justify-center shrink-0">
                      <SlidersHorizontal className="w-4 h-4 text-ruby" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{adminItem.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{adminItem.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <SidebarFooter movie={activeMovie} />
      </aside>
    </>
  );
}
