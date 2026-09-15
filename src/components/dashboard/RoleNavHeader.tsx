'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useAppStore } from '@/store/useAppStore';
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
      case 'DRAFT':
        return { label: 'Bản Nháp', dot: 'bg-zinc-400', badge: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60' };
      case 'ASSIGNED':
        return { label: 'Đã Gán Creator', dot: 'bg-zinc-400', badge: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60' };
      case 'PLANNING':
        return { label: 'Đang Soạn Kế Hoạch', dot: 'bg-zinc-400', badge: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60' };
      case 'PLAN_REVIEW':
        return { label: 'Chờ Duyệt Kế Hoạch', dot: 'bg-amber-400', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
      case 'PLAN_CHANGES_REQUESTED':
        return { label: 'Kế Hoạch Cần Sửa', dot: 'bg-rose-400', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20' };
      case 'PLAN_APPROVED':
        return { label: 'Kế Hoạch Đã Duyệt', dot: 'bg-teal-400', badge: 'bg-teal-500/10 text-teal-300 border-teal-500/20' };
      case 'READY_FOR_PRODUCTION':
        return { label: 'Đã Cấp Quota AI', dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' };
      case 'IN_PRODUCTION':
        return { label: 'Đang Sản Xuất', dot: 'bg-blue-400', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20' };
      case 'CONTENT_REVIEW':
        return { label: 'Chờ Thẩm Định Video', dot: 'bg-purple-400', badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20' };
      case 'CHANGES_REQUESTED':
        return { label: 'Nội Dung Cần Sửa', dot: 'bg-rose-400', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20' };
      case 'APPROVED':
        return { label: 'Nội Dung Đã Duyệt', dot: 'bg-teal-400', badge: 'bg-teal-500/10 text-teal-300 border-teal-500/20' };
      case 'COMPLIANCE_REVIEW':
        return { label: 'Đang Kiểm Định Pháp Lý', dot: 'bg-purple-400', badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20' };
      case 'COMPLIANCE_CHANGES_REQUESTED':
        return { label: 'Pháp Lý Chưa Đạt', dot: 'bg-rose-400', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20' };
      case 'COMPLIANCE_PASSED':
        return { label: 'Đạt Chuẩn Pháp Lý', dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' };
      case 'SCHEDULED':
        return { label: 'Đã Lên Lịch', dot: 'bg-blue-400', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20' };
      case 'PUBLISHED':
        return { label: 'Đã Phát Hành', dot: 'bg-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'ARCHIVED':
        return { label: 'Đã Lưu Trữ', dot: 'bg-zinc-500', badge: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
      default:
        return { label: status, dot: 'bg-zinc-400', badge: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  const statusBadge = getStatusBadge(currentPackage?.status || 'DRAFT');

  return (
    <header className="bg-[#0C0E14] border-b border-white/[0.08] text-white sticky top-0 z-30 backdrop-blur-xl w-full">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand / Project Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-ruby/15 border border-ruby/30 flex items-center justify-center shrink-0 shadow-sm">
            <Film className="w-4 h-4 text-ruby-light" />
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-tight truncate">
              {project.title}
            </h1>
            <span className="hidden sm:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 border border-white/[0.08]">
              {isCreator ? 'Maker Studio' : 'Checker Hub'}
            </span>
          </div>
        </div>

        {/* Center: Selected Episode Status Pill */}
        {currentPackage && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs">
            <span className="text-zinc-400 font-medium">Tập {currentPackage.episode_number}:</span>
            <span className="text-white font-semibold truncate max-w-[140px]">{currentPackage.title}</span>
            <span className="text-zinc-600">•</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusBadge.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              {statusBadge.label}
            </span>
          </div>
        )}

        {/* Right: Tokens, Role Identity & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Token Counter */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs">
            <Zap className={`w-3.5 h-3.5 ${isQuotaWarning ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 text-[11px] hidden lg:inline">Tokens:</span>
              <span className={`font-mono font-semibold text-[11px] ${isQuotaWarning ? 'text-rose-400' : 'text-zinc-200'}`}>
                {project.consumed_tokens} <span className="text-zinc-500">/</span> {project.allocated_tokens}
              </span>
            </div>
          </div>

          {/* Role badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs">
            {isCreator ? (
              <>
                <span className="w-2 h-2 rounded-full bg-ruby" />
                <span className="text-zinc-300 font-medium">Creator</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                <span className="text-zinc-300 font-medium">Reviewer</span>
              </>
            )}
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 text-[11px] truncate max-w-[100px]">
              {user?.name?.split(' ')[0] || (isCreator ? 'Huy' : 'Bảo')}
            </span>
          </div>

          {/* Reset button */}
          <button
            onClick={resetDemoData}
            title="Khôi phục dữ liệu mẫu"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* OTT Home Link */}
          <Link
            href="/"
            title="Trang chủ OTT"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Trang chủ</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-rose-300 bg-white/[0.04] hover:bg-rose-500/10 border border-white/[0.07] hover:border-rose-500/20 transition cursor-pointer"
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
