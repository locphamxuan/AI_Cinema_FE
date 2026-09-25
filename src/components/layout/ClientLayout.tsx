'use client';

import { ReactNode, useEffect } from 'react';
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
import CatalogFilterNav from './header/CatalogFilterNav';
import HeaderSearch from './header/HeaderSearch';
import NotificationBell from './header/NotificationBell';
import UserMenu from './header/UserMenu';
import VipPassToggle from './header/VipPassToggle';

const DASHBOARD_PATHS = ['/creator', '/reviewer', '/staff', '/admin'];

function GuestActions() {
  const { openAuthModal } = useAppStore();
  return (
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
  );
}

function MemberActions() {
  const { openDepositModal } = useAppStore();
  return (
    <>
      <NotificationBell />
      <VipPassToggle />
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
      <UserMenu />
      <ThemeToggle />
    </>
  );
}

/** Consumer header: logo, catalog filters, search and account controls. */
function ConsumerHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl transition-colors">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-6 lg:gap-8 min-w-0">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ruby to-ruby-dark flex items-center justify-center text-white font-black text-sm shadow-md shadow-ruby/30 group-hover:scale-105 transition-transform">
                AI
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white group-hover:text-ruby transition-colors">
                CINEMA<span className="text-emerald-500">.</span>
              </span>
            </Link>
            {signedIn && <CatalogFilterNav />}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {signedIn && <HeaderSearch />}
            {signedIn ? <MemberActions /> : <GuestActions />}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, restoreSession, loadCatalog } = useAppStore();

  // Bring back the session saved by a previous login so a page reload stays authenticated.
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // The published catalog is public, so it loads regardless of login state.
  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const signedIn = isAuthenticated && !!user;
  const isDashboard = DASHBOARD_PATHS.some((path) => pathname.startsWith(path));
  // The chat assistant and the VIP/coin panel serve members; staff-side accounts never see them.
  const isMemberSide = !user || user.role === 'user' || user.role === 'vip';

  return (
    <>
      {/* The consumer header is hidden on the Creator, Reviewer, Staff and Admin dashboards. */}
      {!isDashboard && <ConsumerHeader signedIn={signedIn} />}

      {signedIn && !isDashboard && <RightSidebar />}

      <main
        className={
          isDashboard
            ? 'flex-1 w-full p-0 m-0 bg-[#F8FAFC] dark:bg-[#0B0C10] transition-colors'
            : pathname === '/' && !isAuthenticated
              ? 'flex-1 w-full'
              : 'flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 transition-all'
        }
      >
        {children}
      </main>

      <AuthModal />
      <DailyCheckInModal />
      <DepositModal />
      <UnlockEpisodeModal />

      {isMemberSide && !isDashboard && (
        <>
          <DemoControlPanel />
          <SupportChatWidget />
        </>
      )}
      <ToastContainer />
    </>
  );
}
