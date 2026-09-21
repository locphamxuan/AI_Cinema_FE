'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import WalletHeaderBadge from '@/components/wallet/WalletHeaderBadge';
import DailyCheckInModal from '@/components/wallet/DailyCheckInModal';
import DepositModal from '@/components/wallet/DepositModal';
import UnlockEpisodeModal from '@/components/watch/UnlockEpisodeModal';
import SupportChatWidget from '@/components/chat/SupportChatWidget';
import AuthModal from '@/components/auth/AuthModal';
import DemoControlPanel from '@/components/home/DemoControlPanel';
import ThemeToggle from '@/components/theme/ThemeToggle';
import RightSidebar from '@/components/layout/RightSidebar';
import { ToastContainer } from '@/components/ui/Toast';
import { allMockMovies } from '@/mocks/mockData';

const genreOptions = [
  'Tất cả thể loại',
  'Khoa học viễn tưởng',
  'Cyberpunk 2049',
  'Hành động Kịch tính',
  'Trí tuệ Nhân tạo',
  'Tâm lý & Bí ẩn',
  'Hoạt hình',
  'Giả tưởng',
];

const countryOptions = [
  'Tất cả quốc gia',
  'Việt Nam AI',
  'Âu Mỹ',
  'Hàn Quốc',
  'Nhật Bản',
  'Trung Quốc',
];

const yearOptions = ['Tất cả năm', '2026', '2025', '2024'];

const mockNotifications = [
  { id: 'n1', title: 'Tập 6 - Điểm Kỳ Dị vừa ra mắt!', time: '10 phút trước', isNew: true },
  { id: 'n2', title: 'Bạn nhận được 20 Bonus Coin từ điểm danh', time: '1 giờ trước', isNew: true },
  { id: 'n3', title: 'Gói VIP của bạn sẽ gia hạn sau 20 giờ', time: '5 giờ trước', isNew: false },
];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    user,
    isAuthenticated,
    isVIPMode,
    toggleVIPMode,
    openAuthModal,
    openDepositModal,
    openRightSidebar,
    logout,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    selectedCountry,
    setSelectedCountry,
    selectedYear,
    setSelectedYear,
  } = useAppStore();

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Filter movies based on search query
  const searchResults = searchQuery.trim()
    ? allMockMovies.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genre.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDashboard = pathname.startsWith('/creator') || pathname.startsWith('/reviewer');

  return (
    <>
      {/* Consumer Header (Only rendered on public/user pages, hidden on Creator & Reviewer Dashboards) */}
      {!isDashboard && (
        <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl transition-colors">
          <div className="max-w-[1700px] mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16 gap-4">
              {/* Left Side: Logo & ONFLIX Style Filter/Sort Menu */}
              <div className="flex items-center gap-6 lg:gap-8 min-w-0">
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ruby to-ruby-dark flex items-center justify-center text-white font-black text-sm shadow-md shadow-ruby/30 group-hover:scale-105 transition-transform">
                    AI
                  </div>
                  <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white group-hover:text-ruby transition-colors">
                    CINEMA<span className="text-emerald-500">.</span>
                  </span>
                </Link>

                {/* ONFLIX Header Sort & Navigation Bar (Visible when logged in) */}
                {isAuthenticated && user && (
                  <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    {/* 1. Thể loại Dropdown */}
                    <div className="relative group/cat">
                      <button className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                        <span>{selectedGenre === 'Tất cả' ? 'Thể loại' : selectedGenre}</span>
                        <span className="text-[10px] text-slate-400">▾</span>
                      </button>

                      <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-2 hidden group-hover/cat:block z-50 animate-scale-in">
                        {genreOptions.map((g) => (
                          <button
                            key={g}
                            onClick={() => setSelectedGenre(g.replace('Tất cả thể loại', 'Tất cả'))}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-white/10 font-medium transition-colors"
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Quốc gia Dropdown */}
                    <div className="relative group/cou">
                      <button className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                        <span>{selectedCountry === 'Tất cả' ? 'Quốc gia' : selectedCountry}</span>
                        <span className="text-[10px] text-slate-400">▾</span>
                      </button>

                      <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-2 hidden group-hover/cou:block z-50 animate-scale-in">
                        {countryOptions.map((c) => (
                          <button
                            key={c}
                            onClick={() => setSelectedCountry(c.replace('Tất cả quốc gia', 'Tất cả'))}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-white/10 font-medium transition-colors"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Năm Dropdown */}
                    <div className="relative group/yr">
                      <button className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                        <span>{selectedYear === 'Tất cả' ? 'Năm' : selectedYear}</span>
                        <span className="text-[10px] text-slate-400">▾</span>
                      </button>

                      <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-2 hidden group-hover/yr:block z-50 animate-scale-in">
                        {yearOptions.map((y) => (
                          <button
                            key={y}
                            onClick={() => setSelectedYear(y.replace('Tất cả năm', 'Tất cả'))}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-white/10 font-medium transition-colors"
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Filter Links */}
                    <button
                      onClick={() => setSelectedGenre('Cyberpunk 2049')}
                      className="py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Phim Bộ
                    </button>
                    <button
                      onClick={() => setSelectedGenre('Hành động Kịch tính')}
                      className="py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Phim Lẻ
                    </button>
                    <Link
                      href="/watch/ep-001"
                      className="py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      Lịch chiếu
                    </Link>
                  </nav>
                )}
              </div>

              {/* Middle/Right: Interactive Search Input & User Controls */}
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                {/* Search Bar Input */}
                {isAuthenticated && user && (
                  <div className="relative hidden md:block">
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-slate-400 text-sm pointer-events-none">🔍</span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        placeholder="Tìm kiếm phim, diễn viên..."
                        className="w-48 xl:w-64 pl-9 pr-8 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ruby/50 focus:w-64 xl:focus:w-80 transition-all duration-300"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Instant Search Suggestions Popover */}
                    {isSearchFocused && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-scale-in space-y-1 max-h-80 overflow-y-auto">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-muted-light px-2 py-1">
                          Kết Quả Tìm Kiếm ({searchResults.length})
                        </p>
                        {searchResults.map((m) => (
                          <Link
                            key={m.id}
                            href={`/watch/${m.episodes[0]?.id || 'ep-001'}`}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group"
                          >
                            <img
                              src={m.bannerUrl}
                              alt={m.title}
                              className="w-12 h-8 rounded object-cover shrink-0"
                            />
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-ruby transition-colors">
                                {m.title}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-muted-light">
                                {m.genre.join(' • ')}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isAuthenticated && user ? (
                  <>
                    {/* Notification Bell Dropdown */}
                    <div className="relative" ref={notifRef}>
                      <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white transition-colors cursor-pointer"
                        title="Thông báo"
                      >
                        <span className="text-base">🔔</span>
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-ruby animate-pulse" />
                      </button>

                      {isNotifOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-3 z-50 animate-scale-in space-y-2">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
                            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Thông Báo Mới</h4>
                            <span className="text-[10px] text-ruby font-bold">3 chưa đọc</span>
                          </div>

                          <div className="space-y-1.5 max-h-60 overflow-y-auto">
                            {mockNotifications.map((n) => (
                              <div
                                key={n.id}
                                className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-xs space-y-0.5 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                              >
                                <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                                <p className="text-[10px] text-slate-500 dark:text-muted-light">{n.time}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* VIP Sticker Pass */}
                    <button
                      onClick={toggleVIPMode}
                      className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer select-none group relative overflow-hidden ${
                        isVIPMode
                          ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 text-neutral-950 shadow-[0_2px_10px_rgba(245,158,11,0.35)] border border-yellow-100/80 -rotate-1 hover:rotate-0 hover:scale-105 active:scale-95'
                          : 'bg-slate-200 text-slate-700 dark:bg-neutral-800/90 dark:text-neutral-400 border border-slate-300 dark:border-neutral-700/80 hover:text-slate-900 dark:hover:text-neutral-200 hover:scale-105 active:scale-95 shadow-sm'
                      }`}
                      title="Bấm để chuyển đổi trạng thái VIP (Demo)"
                    >
                      {isVIPMode && (
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
                      )}

                      {isVIPMode ? (
                        <>
                          <svg className="w-3 h-3 fill-neutral-950 shrink-0" viewBox="0 0 24 24">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                          <span className="font-extrabold tracking-widest leading-none">VIP PASS</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-neutral-500 group-hover:bg-slate-600 dark:group-hover:bg-neutral-300 transition-colors" />
                          <span className="font-semibold tracking-wider leading-none text-[10px]">FREE TIER</span>
                        </>
                      )}
                    </button>

                    {/* Wallet Badge & Quick Deposit Button */}
                    <div className="flex items-center gap-1.5">
                      <WalletHeaderBadge />
                      <button
                        onClick={openDepositModal}
                        className="px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer hidden sm:flex items-center gap-1"
                        title="Nạp Coin"
                      >
                        <span>+ Nạp</span>
                      </button>
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                        className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-ruby/50 transition-all cursor-pointer"
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 object-cover"
                        />
                      </button>

                      {isUserDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#161922] p-3 shadow-2xl border border-slate-200 dark:border-white/15 rounded-2xl animate-scale-in z-50">
                          <div className="pb-3 mb-2 border-b border-slate-100 dark:border-white/10">
                            <p className="text-sm font-bold text-slate-900 dark:text-foreground truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-muted-light truncate">{user.email}</p>
                            <span
                              className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                                isVIPMode
                                  ? 'bg-coin/20 text-coin border border-coin/30'
                                  : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-muted-light'
                              }`}
                            >
                              {isVIPMode ? 'Hội viên VIP' : 'Tài khoản thường'}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <Link
                              href="/profile"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                              <span>👤 Hồ sơ cá nhân</span>
                              <span className="text-slate-400">›</span>
                            </Link>
                            <Link
                              href="/profile/subscription"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                              <span>👑 Gói dịch vụ hội viên</span>
                              <span className="text-slate-400">›</span>
                            </Link>
                            <Link
                              href="/profile/transactions"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                              <span>💳 Lịch sử giao dịch ví</span>
                              <span className="text-slate-400">›</span>
                            </Link>
                            <Link
                              href="/profile/history"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                              <span>🕒 Lịch sử xem phim</span>
                              <span className="text-slate-400">›</span>
                            </Link>

                            <button
                              onClick={() => {
                                setIsUserDropdownOpen(false);
                                openRightSidebar();
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                            >
                              <span>⚙️ Bảng điều khiển Sidebar</span>
                              <span className="text-slate-400">›</span>
                            </button>
                          </div>

                          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/10">
                            <button
                              onClick={() => {
                                setIsUserDropdownOpen(false);
                                logout();
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-ruby hover:bg-ruby/15 transition-colors cursor-pointer"
                            >
                              <span>Đăng xuất</span>
                              <span>→</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Theme Toggle */}
                    <ThemeToggle />
                  </>
                ) : (
                  /* Unauthenticated Header State */
                  <div className="flex items-center gap-2 sm:gap-3">
                    <ThemeToggle />
                    <button
                      onClick={() => openAuthModal('login')}
                      className="px-4 py-1.5 rounded-lg bg-ruby hover:bg-ruby-dark text-white text-xs sm:text-sm font-bold shadow-md shadow-ruby/20 transition-all active:scale-95 cursor-pointer"
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => openAuthModal('register')}
                      className="hidden sm:inline-block px-3 py-1.5 rounded-lg bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-foreground text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                    >
                      Đăng ký
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Render Right Sidebar Docked on the Right Side for Logged-In User Pages */}
      {isAuthenticated && user && !isDashboard && <RightSidebar />}

      {/* Main Content Area */}
      <main
        className={
          pathname.startsWith('/creator') || pathname.startsWith('/reviewer')
            ? 'flex-1 w-full p-0 m-0 bg-[#F8FAFC] dark:bg-[#0B0C10] transition-colors'
            : pathname === '/' && !isAuthenticated
            ? 'flex-1 w-full'
            : 'flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 transition-all'
        }
      >
        {children}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <DailyCheckInModal />
      <DepositModal />
      <UnlockEpisodeModal />

      {/* Global Floating Controls */}
      <DemoControlPanel />
      <SupportChatWidget />
      <ToastContainer />
    </>
  );
}
