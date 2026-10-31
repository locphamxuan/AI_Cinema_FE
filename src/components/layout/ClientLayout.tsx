'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { AREAS, homeAreaOf, isMemberRole } from '@/lib/permissions';
import RewardShortcuts from '@/components/wallet/RewardShortcuts';
import WalletHeaderBadge from '@/components/wallet/WalletHeaderBadge';
import DailyCheckInModal from '@/components/wallet/DailyCheckInModal';
import RewardSpinModal from '@/components/wallet/RewardSpinModal';
import DepositModal from '@/components/wallet/DepositModal';
import UnlockEpisodeModal from '@/components/watch/UnlockEpisodeModal';
import AuthModal from '@/components/auth/AuthModal';
import ThemeToggle from '@/components/theme/ThemeToggle';
import RightSidebar from '@/components/layout/RightSidebar';
import { ToastContainer } from '@/components/ui/Toast';
import CatalogFilterNav from './header/CatalogFilterNav';
import HeaderSearch from './header/HeaderSearch';
import NotificationBell from './header/NotificationBell';
import UserMenu from './header/UserMenu';

// Work areas without the consumer header, sidebar and widgets; /studio/ is the outside studio's portal.
const DASHBOARD_PATHS = ['/creator', '/reviewer', '/staff', '/admin', '/studio/'];

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
      <RewardShortcuts light />
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
  const router = useRouter();
  const { user, isAuthenticated, restoreSession, loadCatalog, syncAccount, syncRewards } = useAppStore();

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
  // The viewer's discovery and browse pages carry their own navbar.
  const isHome = pathname === '/' || pathname === '/phim';
  const withSidebar = signedIn && !isDashboard && !isHome;
  // The wallet serves members; staff-side accounts never see it.
  const isMemberSide = !user || isMemberRole(user.role);
  const userId = user?.id;

  // A member's wallet, plan, check-in and spins live on the BE; reload them for each signed-in member.
  useEffect(() => {
    if (!userId || !isMemberSide) return;
    syncAccount().catch(() => undefined);
    syncRewards().catch(() => undefined);
  }, [userId, isMemberSide, syncAccount, syncRewards]);

  // The viewer site is the members'; a Creator, Reviewer, Staff or Admin goes to their own area.
  const staffArea = signedIn ? homeAreaOf(user?.role) : null;
  useEffect(() => {
    if (staffArea && !isDashboard) router.replace(AREAS[staffArea].path);
  }, [staffArea, isDashboard, router]);

  return (
    <>
      {/* The consumer header is hidden on Home (uses dedicated NetflixNavbar) and Dashboards. */}
      {withSidebar && <RightSidebar />}

      {/* The member sidebar is fixed on wide screens; the page keeps its width clear of it. */}
      <div className={withSidebar ? 'flex flex-1 flex-col lg:pr-80' : 'contents'}>
        {!isDashboard && !isHome && <ConsumerHeader signedIn={signedIn} />}

        <main
          className={
            isDashboard
              ? 'flex-1 w-full p-0 m-0 bg-background'
              : isHome
                ? 'dark flex-1 w-full p-0 m-0 bg-background text-foreground overflow-x-hidden'
                : 'flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 transition-all'
          }
        >
          {children}
        </main>
      </div>

      <AuthModal />
      <DailyCheckInModal />
      <RewardSpinModal />
      <DepositModal />
      <UnlockEpisodeModal />

      <ToastContainer />
    </>
  );
}
