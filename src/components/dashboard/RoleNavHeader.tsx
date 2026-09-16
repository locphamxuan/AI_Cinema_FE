'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useAppStore } from '@/store/useAppStore';
import ThemeToggle from '@/components/theme/ThemeToggle';
import {
  Film,
  Zap,
  RotateCcw,
  LogOut,
  Home,
} from 'lucide-react';

export function RoleNavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentRole, project, activePackageId, resetDemoData } = useWorkflowStore();
  const { user, logout, openAuthModal } = useAppStore();

  const handleLogout = () => {
    logout();
    router.push('/');
    openAuthModal('login');
  };

  const isCreator = pathname.includes('/creator') || currentRole === 'creator';
  const currentPackage = project.episodes.find((e) => e.id === activePackageId) || project.episodes[0];
  const quotaPercent = project.allocated_tokens > 0 ? (project.consumed_tokens / project.allocated_tokens) * 100 : 0;
  const isQuotaWarning = quotaPercent >= 90;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLAN_DRAFT':
        return { label: 'Bản Nháp Brief', dot: 'bg-slate-400', badge: 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10' };
      case 'PLAN_PENDING':
        return { label: 'Chờ Duyệt Quota', dot: 'bg-amber-500', badge: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' };
      case 'QUOTA_ALLOCATED':
        return { label: 'Đã Cấp Quota AI', dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' };
      case 'IN_PRODUCTION':
        return { label: 'Đang Sản Xuất', dot: 'bg-blue-500', badge: 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' };
      case 'EPISODE_SUBMITTED':
        return { label: 'Chờ Thẩm Định Video', dot: 'bg-purple-500', badge: 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30' };
      case 'CHANGES_REQUESTED':
        return { label: 'Yêu Cầu Sửa Đổi', dot: 'bg-rose-500', badge: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30' };
      case 'COMPLIANCE_PASSED':
        return { label: 'Đạt Chuẩn Pháp Lý', dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' };
      case 'PUBLISHED':
        return { label: 'Đã Phát Hành', dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' };
      default:
        return { label: status, dot: 'bg-slate-400', badge: 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10' };
    }
  };

  const statusBadge = getStatusBadge(currentPackage?.status || 'PLAN_PENDING');

  return (
    <header className="bg-white dark:bg-[#12141A] border-b border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 sticky top-0 z-30 shadow-xs w-full transition-colors">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand / Project Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-ruby/10 border border-ruby/20 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4 text-ruby" />
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {project.title}
            </h1>
            <span className="hidden sm:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              {isCreator ? 'Maker Studio' : 'Checker Hub'}
            </span>
          </div>
        </div>

        {/* Center: Selected Episode Status Pill */}
        {currentPackage && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Tập {currentPackage.episode_number}:</span>
            <span className="text-slate-900 dark:text-slate-200 font-semibold truncate max-w-[140px]">{currentPackage.title}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusBadge.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              {statusBadge.label}
            </span>
          </div>
        )}

        {/* Right: Tokens, Role Identity & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Token Counter */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
            <Zap className={`w-3.5 h-3.5 ${isQuotaWarning ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
            <div className="flex items-center gap-1">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] hidden lg:inline">Tokens:</span>
              <span className={`font-mono font-bold text-[11px] ${isQuotaWarning ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>
                {project.consumed_tokens} <span className="text-slate-400 dark:text-slate-600">/</span> {project.allocated_tokens}
              </span>
            </div>
          </div>

          {/* Role badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
            {isCreator ? (
              <>
                <span className="w-2 h-2 rounded-full bg-ruby" />
                <span className="text-slate-700 dark:text-slate-200 font-medium">Creator</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                <span className="text-slate-700 dark:text-slate-200 font-medium">Reviewer</span>
              </>
            )}
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[100px]">
              {user?.name?.split(' ')[0] || (isCreator ? 'Huy' : 'Bảo')}
            </span>
          </div>

          {/* Theme Toggle Button (Chỉnh màu Tối / Sáng) */}
          <ThemeToggle />

          {/* Reset button */}
          <button
            onClick={resetDemoData}
            title="Khôi phục dữ liệu mẫu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* OTT Home Link */}
          <Link
            href="/"
            title="Trang chủ OTT"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Trang chủ</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-500/20 transition cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default RoleNavHeader;
