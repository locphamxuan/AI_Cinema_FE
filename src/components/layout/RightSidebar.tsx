'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';

export default function RightSidebar() {
  const pathname = usePathname();
  const {
    user,
    isVIPMode,
    wallet,
    openDepositModal,
    currentMovie,
    isRightSidebarOpen,
    closeRightSidebar,
    toggleRightSidebar,
  } = useAppStore();

  // Define sidebar navigation items
  const sidebarNavItems = [
    {
      href: '/profile/subscription',
      label: 'Gói hội viên',
      icon: '👑',
      badge: isVIPMode ? 'VIP Active' : 'Nâng cấp',
      badgeColor: isVIPMode ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' : 'bg-ruby/20 text-ruby border-ruby/40',
    },
    {
      href: '/profile/transactions',
      label: 'Lịch sử giao dịch',
      icon: '💳',
    },
    {
      href: '/profile/history',
      label: 'Lịch sử xem',
      icon: '🕒',
    },
    {
      href: '/profile',
      label: 'Hồ sơ cá nhân',
      icon: '👤',
    },
    {
      href: '#deposit',
      label: 'Nạp tiền vào ví',
      icon: '💰',
      onClick: () => {
        closeRightSidebar();
        openDepositModal();
      },
      badge: 'Khuyến mãi +20%',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    },
  ];

  const creatorItem = {
    href: '/creator',
    label: 'AI Studio (Maker)',
    icon: '🎬',
  };
  const reviewerItem = {
    href: '/reviewer',
    label: 'Thẩm định (Checker)',
    icon: '🛡️',
  };

  return (
    <>
      {/* 1. Floating Right Edge Drawer Trigger Button */}
      <button
        onClick={toggleRightSidebar}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 shadow-2xl bg-ruby hover:bg-ruby-dark text-white rounded-l-2xl py-3 px-2 flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 group border-y border-l border-white/20 select-none"
        title="Mở Bảng Điều Khiển SideBar"
      >
        <span className="text-base group-hover:rotate-12 transition-transform">⚙️</span>
        <span className="text-[10px] font-black uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">
          MENU
        </span>
      </button>

      {/* 2. Dimmed Blurred Backdrop Overlay */}
      {isRightSidebarOpen && (
        <div
          onClick={closeRightSidebar}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-40 animate-fade-in cursor-pointer"
        />
      )}

      {/* 3. Slide-Over Overlay Drawer Panel */}
      <aside
        className={`fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white/95 dark:bg-slate-900/98 shadow-2xl border-l border-slate-200 dark:border-white/10 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto backdrop-blur-2xl transition-transform duration-300 ease-out ${
          isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Top Header Section */}
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Bảng Điều Khiển Của Bạn
              </h3>
            </div>

            <button
              onClick={closeRightSidebar}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng Sidebar"
            >
              ✕
            </button>
          </div>

          {/* User Card */}
          {user && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/80 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900/90 border border-slate-200/80 dark:border-white/10 flex items-center gap-3 shadow-xs">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-ruby/50 shadow-md shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      isVIPMode
                        ? 'bg-amber-400/20 text-amber-500 border border-amber-400/40'
                        : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-muted-light'
                    }`}
                  >
                    {isVIPMode ? 'VIP PASS' : 'FREE TIER'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="space-y-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-muted-light px-2 mb-2">
              Quản Lý & Dịch Vụ
            </p>

            {sidebarNavItems.map((item) => {
              const isActive = pathname === item.href;
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-ruby text-white shadow-md shadow-ruby/30'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                        isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Role Dashboards */}
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/10 space-y-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-muted-light px-2 mb-1">
                Studio & Thẩm Định
              </p>
              <Link
                href={creatorItem.href}
                onClick={closeRightSidebar}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-ruby hover:bg-ruby/15 transition-colors ${
                  pathname.startsWith('/creator') ? 'bg-ruby/20' : ''
                }`}
              >
                <span className="text-base">{creatorItem.icon}</span>
                <span>{creatorItem.label}</span>
              </Link>
              <Link
                href={reviewerItem.href}
                onClick={closeRightSidebar}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-purple-500 hover:bg-purple-500/15 transition-colors ${
                  pathname.startsWith('/reviewer') ? 'bg-purple-500/20' : ''
                }`}
              >
                <span className="text-base">{reviewerItem.icon}</span>
                <span>{reviewerItem.label}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Wallet & Continue Watching */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/10">
          {/* Wallet Quick Action Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-amber-700/15 border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Ví AI Cinema
              </span>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300">
                +{wallet.bonusCoin} Bonus
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-black text-amber-500 font-mono">
                {wallet.mainCoin.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-muted-light">Main Coin</span>
            </div>

            <button
              onClick={() => {
                closeRightSidebar();
                openDepositModal();
              }}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>💰 Nạp Coin Ngay</span>
            </button>
          </div>

          {/* Continue Watching Widget */}
          <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-muted-light mb-2">
              Đang Xem Dở
            </p>

            <Link
              href={`/watch/${currentMovie.episodes[0]?.id || 'ep-001'}`}
              onClick={closeRightSidebar}
              className="flex items-center gap-3 group"
            >
              <div className="relative w-16 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-300 dark:border-white/20">
                <img
                  src={currentMovie.bannerUrl}
                  alt={currentMovie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-xs">▶</span>
                </div>
              </div>

              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-ruby transition-colors">
                  {currentMovie.title}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-muted-light">Tập 1 • 45 phút</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
