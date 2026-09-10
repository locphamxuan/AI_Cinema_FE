'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProductionStore } from '@/store/useProductionStore';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { ProductionRole } from '@/types/production';

interface ProductionHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function ProductionHeader({ title, subtitle }: ProductionHeaderProps) {
  const pathname = usePathname();
  const { activeRole, setActiveRole, getProject } = useProductionStore();
  const currentProject = getProject();

  const handleRoleChange = (role: ProductionRole) => {
    setActiveRole(role);
  };

  const isReviewerRoute = pathname.startsWith('/reviewer');
  const isCreatorRoute = pathname.startsWith('/creator');

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0B0C10]/85 backdrop-blur-2xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Module Label */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ruby to-ruby-dark flex items-center justify-center text-white font-black text-sm shadow-md shadow-ruby/30 group-hover:scale-105 transition-transform">
                AI
              </div>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white group-hover:text-ruby transition-colors">
                CINEMA <span className="text-xs px-2 py-0.5 rounded bg-ruby/10 dark:bg-ruby/20 text-ruby font-bold ml-1 border border-ruby/20">STUDIO</span>
              </span>
            </Link>

            {/* Breadcrumb / Page Title */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 pl-4 border-l border-slate-200 dark:border-white/10">
              <span className="font-semibold text-slate-700 dark:text-zinc-300 truncate max-w-[200px]">
                {currentProject?.title || 'Dự Án AI Cinema'}
              </span>
              <span>/</span>
              <span className="text-ruby font-bold truncate">
                {title || (isReviewerRoute ? 'Thẩm Định Phim' : 'Sản Xuất Phim')}
              </span>
            </div>
          </div>

          {/* Quick Nav Links between Production Views */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold">
            <Link
              href="/reviewer/projects/create"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pathname === '/reviewer/projects/create'
                  ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Quản Lý Dự Án (Reviewer)
            </Link>
            <Link
              href="/reviewer/episodes/ep-prod-02/review"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pathname.includes('/reviewer/episodes')
                  ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Thẩm Định Tập 2
            </Link>
            <Link
              href="/creator/plans/ep-prod-04"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pathname.includes('/creator/plans')
                  ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kế Hoạch Tập 4 (Creator)
            </Link>
            <Link
              href="/creator/episodes/ep-prod-03/studio"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pathname.includes('/creator/episodes')
                  ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              AI Studio Tập 3
            </Link>
          </nav>

          {/* Right Controls: Maker-Checker Role Switcher & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Maker-Checker Role Toggle Capsule */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold">
              <button
                onClick={() => handleRoleChange('reviewer')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeRole === 'reviewer'
                    ? 'bg-ruby text-white shadow-sm shadow-ruby/30'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Đóng vai Reviewer (Checker / Quản lý)"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Reviewer</span>
              </button>

              <button
                onClick={() => handleRoleChange('creator')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeRole === 'creator'
                    ? 'bg-neon text-white shadow-sm shadow-neon/30'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Đóng vai Creator (Maker / Đạo diễn AI)"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Creator</span>
              </button>
            </div>

            {/* Light / Dark Mode Toggle */}
            <ThemeToggle />

            {/* Back to Viewer Home */}
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
