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
      href: '/profile/subscription',
      label: 'Gói hội viên',
      icon: Crown,
      iconColor: 'text-amber-400 group-hover:text-amber-300',
      iconBg: 'bg-amber-400/10 border-amber-400/20 group-hover:bg-amber-400/20',
      badge: isVIPMode ? 'VIP Active' : 'Nâng cấp',
      badgeColor: isVIPMode
        ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
        : 'bg-ruby/20 text-ruby-300 border-ruby/40 hover:bg-ruby hover:text-white',
    },
    {
      href: '/profile/transactions',
      label: 'Lịch sử giao dịch',
      icon: CreditCard,
      iconColor: 'text-sky-400 group-hover:text-sky-300',
      iconBg: 'bg-sky-400/10 border-sky-400/20 group-hover:bg-sky-400/20',
    },
    {
      href: '/profile/history',
      label: 'Lịch sử xem',
      icon: Clock,
      iconColor: 'text-purple-400 group-hover:text-purple-300',
      iconBg: 'bg-purple-400/10 border-purple-400/20 group-hover:bg-purple-400/20',
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
      iconColor: 'text-emerald-400 group-hover:text-emerald-300',
      iconBg: 'bg-emerald-400/10 border-emerald-400/20 group-hover:bg-emerald-400/20',
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
    label: 'Thẩm định (Checker)',
    subtitle: 'Kiểm duyệt & Cấp phép AI',
    icon: ShieldCheck,
    roleBadge: 'Checker',
  };

  return (
    <>
      {/* 1. Floating Right Edge Drawer Trigger Button */}
      <button
        onClick={toggleRightSidebar}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 shadow-2xl bg-gradient-to-b from-ruby via-rose-600 to-ruby-dark text-white rounded-l-2xl py-3 px-2 flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 group border-y border-l border-white/20 select-none hover:shadow-ruby/40"
        title="Mở Bảng Điều Khiển SideBar"
      >
        <SlidersHorizontal className="w-4 h-4 group-hover:rotate-45 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">
          MENU
        </span>
      </button>

      {/* 2. Dimmed Blurred Backdrop Overlay */}
      {isRightSidebarOpen && (
        <div
          onClick={closeRightSidebar}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 animate-fade-in cursor-pointer"
        />
      )}

      {/* 3. Slide-Over Overlay Drawer Panel */}
      <aside
        className={`fixed right-0 top-0 bottom-0 z-50 w-84 sm:w-92 max-w-[92vw] bg-slate-950/95 dark:bg-slate-950/98 text-slate-100 shadow-[-12px_0_40px_rgba(0,0,0,0.7)] border-l border-white/10 flex flex-col justify-between overflow-y-auto backdrop-blur-3xl transition-transform duration-300 ease-out p-4 sm:p-5 ${
          isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Top Header Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                  Bảng Điều Khiển Của Bạn
                </h3>
              </div>
            </div>

            <button
              onClick={closeRightSidebar}
              className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.15] text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 hover:rotate-90"
              title="Đóng Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {user && <SidebarProfileCard user={user} isVIPMode={isVIPMode} />}

          {/* Navigation Items */}
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-2">
              Quản Lý & Dịch Vụ
            </p>

            {sidebarNavItems.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.onClick ? '#' : item.href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    } else {
                      closeRightSidebar();
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group border ${
                    isActive
                      ? 'bg-gradient-to-r from-ruby/25 via-ruby/15 to-transparent text-white border-l-4 border-ruby shadow-md shadow-ruby/10 border-y-transparent border-r-transparent'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border-transparent hover:border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                        isActive
                          ? 'bg-ruby/30 border-ruby/50 text-white'
                          : `${item.iconBg} ${item.iconColor}`
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="tracking-wide">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isActive
                          ? 'text-white translate-x-0.5'
                          : 'text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5'
                      }`}
                    />
                  </div>
                </Link>
              );
            })}

            {/* Role Dashboards (Studio & Thẩm Định) */}
            <div className="pt-3 mt-3 border-t border-white/10 space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-1.5">
                Studio & Thẩm Định
              </p>

              <Link
                href={creatorItem.href}
                onClick={closeRightSidebar}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all group border ${
                  pathname.startsWith('/creator')
                    ? 'bg-ruby/20 border-ruby/40 text-white shadow-md shadow-ruby/10'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-ruby/15 border border-ruby/30 text-ruby flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Clapperboard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white font-bold leading-none">{creatorItem.label}</p>
                    <p className="text-[10px] text-slate-400 font-normal mt-1 leading-none">
                      {creatorItem.subtitle}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href={reviewerItem.href}
                onClick={closeRightSidebar}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all group border ${
                  pathname.startsWith('/reviewer')
                    ? 'bg-purple-600/20 border-purple-500/40 text-white shadow-md shadow-purple-600/10'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white font-bold leading-none">{reviewerItem.label}</p>
                    <p className="text-[10px] text-slate-400 font-normal mt-1 leading-none">
                      {reviewerItem.subtitle}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        <SidebarFooter movie={activeMovie} />
      </aside>
    </>
  );
}
