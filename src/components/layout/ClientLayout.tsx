'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import WalletHeaderBadge from '@/components/wallet/WalletHeaderBadge';
import DailyCheckInModal from '@/components/wallet/DailyCheckInModal';
import UnlockEpisodeModal from '@/components/watch/UnlockEpisodeModal';
import SupportChatWidget from '@/components/chat/SupportChatWidget';

const navLinks = [
  { href: '/', label: 'Trang chủ', icon: '🏠' },
  { href: '/watch/ep-001', label: 'Xem phim', icon: '🎬' },
  { href: '/profile/subscription', label: 'Gói hội viên', icon: '👑' },
  { href: '/profile/transactions', label: 'Giao dịch', icon: '📋' },
];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isVIPMode, toggleVIPMode } = useAppStore();

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Nav */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl">🎬</span>
                <span className="text-lg font-bold gradient-text-ruby hidden sm:inline">
                  AI Cinema
                </span>
              </Link>

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

            {/* Right side: VIP Toggle + Wallet + User */}
            <div className="flex items-center gap-4">
              {/* VIP Mode Toggle (for testing) */}
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

              {/* User Avatar */}
              <div className="flex items-center gap-2">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full bg-white/10"
                />
              </div>
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
      <DailyCheckInModal />
      <UnlockEpisodeModal />

      {/* Support Chat */}
      <SupportChatWidget />
    </>
  );
}
