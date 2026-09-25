'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { mockMovie } from '@/mocks/movie';
import {
  X,
  Crown,
  CreditCard,
  Clock,
  User,
  Coins,
  Clapperboard,
  ShieldCheck,
  Play,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  PlusCircle,
  Film,
} from 'lucide-react';

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

  // Active movie fallback to avoid broken image and "Chưa có phim"
  const activeMovie =
    currentMovie && currentMovie.title && currentMovie.title !== 'Chưa có phim' && currentMovie.bannerUrl
      ? currentMovie
      : mockMovie;

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

          {/* User Profile Card */}
          {user && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 relative overflow-hidden shadow-xl backdrop-blur-xl group">
              {/* Subtle ambient glow in background */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-ruby/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="relative shrink-0">
                  <div className="p-0.5 rounded-full bg-gradient-to-tr from-ruby via-purple-500 to-amber-400 shadow-md">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover bg-slate-900"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 shadow-xs" />
                </div>

                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-black text-white truncate group-hover:text-ruby-light transition-colors">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">
                    {user.email || 'user@aicinema.vn'}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                        isVIPMode
                          ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/40 shadow-xs'
                          : 'bg-white/10 text-slate-300 border-white/15'
                      }`}
                    >
                      {isVIPMode ? (
                        <>
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>VIP PASS</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 text-slate-400" />
                          <span>FREE TIER</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

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

        {/* Bottom Section: Wallet & Continue Watching */}
        <div className="space-y-3.5 pt-4 mt-4 border-t border-white/10">
          {/* Wallet Quick Action Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-purple-950/30 border border-amber-500/30 relative overflow-hidden shadow-xl">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Ví AI Cinema</span>
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                <span>+{wallet.bonusCoin} Bonus</span>
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mb-3 relative z-10">
              <span className="text-2xl font-black text-amber-400 font-mono tracking-tight drop-shadow-sm">
                {wallet.mainCoin.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-400">Main Coin</span>
            </div>

            <button
              onClick={() => {
                closeRightSidebar();
                openDepositModal();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 relative z-10"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Nạp Coin Ngay</span>
            </button>
          </div>

          {/* Continue Watching Widget */}
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Film className="w-3 h-3 text-slate-400" />
                <span>Đang Xem Dở</span>
              </p>
              <span className="text-[10px] font-bold text-ruby">Tập 1</span>
            </div>

            <Link
              href={`/watch/${activeMovie.episodes[0]?.id || 'ep-001'}`}
              onClick={closeRightSidebar}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0 border border-white/15 bg-slate-800 shadow-md">
                <img
                  src={activeMovie.bannerUrl || activeMovie.posterUrl}
                  alt={activeMovie.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to high quality poster if URL fails
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                  <div className="w-6 h-6 rounded-full bg-white/80 group-hover:bg-ruby text-slate-950 group-hover:text-white flex items-center justify-center shadow-md transition-colors">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Progress bar overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-black/50">
                  <div className="h-full bg-ruby w-3/5" />
                </div>
              </div>

              <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold text-white truncate group-hover:text-ruby transition-colors">
                  {activeMovie.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-slate-400">45 phút</span>
                  <span className="text-[10px] text-slate-600">•</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Đã xem 60%</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
