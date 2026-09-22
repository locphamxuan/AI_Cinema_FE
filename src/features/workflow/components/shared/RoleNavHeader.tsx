'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useAppStore } from '@/store/useAppStore';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { Film } from 'lucide-react';
import { AccountMenu } from './AccountMenu';

/** Slim top bar for both role workspaces: who you are working as, theme, and the account menu — nothing else. */
export function RoleNavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentRole, resetDemoData } = useWorkflowStore();
  const { user, logout, openAuthModal } = useAppStore();

  const isCreator = pathname.includes('/creator') || (!pathname.includes('/reviewer') && currentRole === 'creator');
  const roleLabel = isCreator ? 'Người sản xuất nội dung' : 'Người kiểm duyệt nội dung';
  const displayName = user?.name || (isCreator ? 'Huy' : 'Bảo');

  const handleLogout = () => {
    logout();
    router.push('/');
    openAuthModal('login');
  };

  return (
    <header className="bg-white dark:bg-[#12141A] border-b border-slate-200 dark:border-white/10 sticky top-0 z-30 w-full transition-colors">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-600/20 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
          </div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {isCreator ? 'Sản xuất nội dung' : 'Kiểm duyệt nội dung'}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <AccountMenu name={displayName} roleLabel={roleLabel} onResetDemo={resetDemoData} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}

export default RoleNavHeader;
