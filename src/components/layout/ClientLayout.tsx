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

const navLinks = [
  { href: '/', label: 'Trang chủ', icon: '🏠' },
  { href: '/watch/ep-001', label: 'Xem phim', icon: '🎬' },
  { href: '/profile/subscription', label: 'Gói hội viên', icon: '👑' },
  { href: '/profile/transactions', label: 'Giao dịch', icon: '📋' },
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
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Nav */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl">🎬</span>
                <span className="text-lg font-bold gradient-text-ruby">
                  AI Cinema
                </span>
              </Link>

              {/* Navigation only shown when authenticated or for explore */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                        ? 'bg-white/10 text-foreground'
                        : 'text-muted-light hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    <span className="mr-1.5">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right side: Login Button OR User Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              {isAuthenticated && user ? (
                <>
                  {/* VIP Mode Toggle */}
                  <button
                    onClick={toggleVIPMode}
                    className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isVIPMode
                        ? 'bg-coin/20 text-coin border border-coin/30'
                        : 'bg-white/5 text-muted-light border border-white/10'
                    }`}
                    title="Toggle chế độ VIP (dùng để test)"
                  >
                    <span>{isVIPMode ? '👑' : '👤'}</span>
                    {isVIPMode ? 'VIP' : 'Thường'}
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
                          <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isVIPMode ? 'bg-coin/20 text-coin' : 'bg-white/10 text-muted-light'
                          }`}>
                            {isVIPMode ? '👑 Thành viên VIP' : '👤 Tài khoản thường'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <Link
                            href="/profile/subscription"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-white/10 transition-colors"
                          >
                            <span>👑</span>
                            <span>Gói dịch vụ hội viên</span>
                          </Link>
                          <Link
                            href="/profile/transactions"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-white/10 transition-colors"
                          >
                            <span>📋</span>
                            <span>Lịch sử giao dịch ví</span>
                          </Link>
                        </div>

                        <div className="pt-2 mt-2 border-t border-white/10">
                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-ruby hover:bg-ruby/15 transition-colors"
                          >
                            <span>🚪</span>
                            <span>Đăng xuất (Logout)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Unauthenticated Header State (Netflix Style) */
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-1.5 rounded-lg bg-ruby hover:bg-ruby-dark text-white text-xs sm:text-sm font-bold shadow-md shadow-ruby/20 transition-all active:scale-95 cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="hidden sm:inline-block px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-foreground text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden border-t border-border">
          <div className="flex overflow-x-auto px-2 py-1 gap-1 no-scrollbar">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted-light'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

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
