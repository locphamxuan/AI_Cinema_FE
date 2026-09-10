'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import WalletHeaderBadge from '@/components/wallet/WalletHeaderBadge';
import DailyCheckInModal from '@/components/wallet/DailyCheckInModal';
import UnlockEpisodeModal from '@/components/watch/UnlockEpisodeModal';
import SupportChatWidget from '@/components/chat/SupportChatWidget';
import AuthModal from '@/components/auth/AuthModal';
import DemoControlPanel from '@/components/home/DemoControlPanel';
import ThemeToggle from '@/components/theme/ThemeToggle';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/watch/1', label: 'Xem phim' },
  { href: '/reviewer/projects/create', label: '🎬 Sản xuất phim AI' },
  { href: '/profile/subscription', label: 'Gói hội viên' },
  { href: '/profile/transactions', label: 'Lịch sử giao dịch' },
];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    user,
    isAuthenticated,
    isVIPMode,
    toggleVIPMode,
    openAuthModal,
    logout,
  } = useAppStore();

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-[#0B0C10]/90 backdrop-blur-2xl transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Clean Text Nav */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ruby to-ruby-dark flex items-center justify-center text-white font-black text-sm shadow-md shadow-ruby/30 group-hover:scale-105 transition-transform">
                  AI
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white group-hover:text-ruby transition-colors">
                  CINEMA
                </span>
              </Link>

              {/* Navigation Tabs (Clean typography like Netflix / Apple TV+) */}
              <nav className="hidden md:flex items-center gap-1.5">
                {navLinks.map((link) => {
                  const isActive =
                    pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-white/10 text-white font-bold shadow-sm'
                          : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right side: Login Button OR User Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              {isAuthenticated && user ? (
                <>
                  {/* VIP Mode Quick Sticker Tag */}
                  <button
                    onClick={toggleVIPMode}
                    className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer select-none group relative overflow-hidden ${
                      isVIPMode
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 text-neutral-950 shadow-[0_2px_10px_rgba(245,158,11,0.35)] border border-yellow-100/80 -rotate-1 hover:rotate-0 hover:scale-105 active:scale-95'
                        : 'bg-neutral-800/90 text-neutral-400 border border-neutral-700/80 hover:text-neutral-200 hover:border-neutral-500 hover:scale-105 active:scale-95 shadow-sm'
                    }`}
                    title="Bấm để chuyển đổi trạng thái VIP (Demo)"
                  >
                    {/* Glossy light streak across the sticker */}
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
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 group-hover:bg-neutral-300 transition-colors" />
                        <span className="font-semibold tracking-wider leading-none text-[10px]">FREE TIER</span>
                      </>
                    )}
                  </button>

                  {/* Wallet Badge */}
                  <WalletHeaderBadge />

                  {/* User Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-ruby/50 transition-all cursor-pointer"
                    >
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full bg-white/10 border border-white/20 object-cover"
                      />
                    </button>

                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 glass-card p-3 shadow-2xl border border-white/15 animate-scale-in z-50">
                        <div className="pb-3 mb-2 border-b border-white/10">
                          <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-light truncate">{user.email}</p>
                          <span
                            className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                              isVIPMode
                                ? 'bg-coin/20 text-coin border border-coin/30'
                                : 'bg-white/10 text-muted-light'
                            }`}
                          >
                            {isVIPMode ? 'Hội viên VIP' : 'Tài khoản thường'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <Link
                            href="/profile/subscription"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-white/10 transition-colors"
                          >
                            <span>Gói dịch vụ hội viên</span>
                            <span className="text-muted-light">›</span>
                          </Link>
                          <Link
                            href="/profile/transactions"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-white/10 transition-colors"
                          >
                            <span>Lịch sử giao dịch ví</span>
                            <span className="text-muted-light">›</span>
                          </Link>
                        </div>

                        <div className="pt-2 mt-2 border-t border-white/10">
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
                /* Unauthenticated Header State (Netflix Style) */
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

        {/* Mobile Nav */}
        <div className="md:hidden border-t border-white/10">
          <div className="flex overflow-x-auto px-2 py-1 gap-1 no-scrollbar">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white font-bold'
                      : 'text-muted-light hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">{children}</main>

      {/* Global Modals */}
      <AuthModal />
      <DailyCheckInModal />
      <UnlockEpisodeModal />

      {/* Global Floating Controls */}
      <DemoControlPanel />
      <SupportChatWidget />
    </>
  );
}
