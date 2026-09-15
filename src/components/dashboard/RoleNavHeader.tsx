'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import {
  Film,
  ShieldCheck,
  Zap,
  Sparkles,
  RotateCcw,
  Layers,
  Sliders,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
} from 'lucide-react';

export function RoleNavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentRole, setRole, project, activePackageId, setActivePackage, resetDemoData } = useWorkflowStore();

  const isCreator = pathname.includes('/creator') || currentRole === 'creator';
  const isReviewer = pathname.includes('/reviewer') || currentRole === 'reviewer';

  const currentPackage = project.episodes.find((e) => e.id === activePackageId) || project.episodes[0];
  const quotaPercent = project.allocated_tokens > 0 ? (project.consumed_tokens / project.allocated_tokens) * 100 : 0;
  const isQuotaWarning = quotaPercent >= 90;

  const handleRoleChange = (newRole: 'creator' | 'reviewer') => {
    setRole(newRole);
    if (newRole === 'creator') {
      router.push('/creator');
    } else {
      router.push('/reviewer');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLAN_DRAFT':
        return { label: 'Bản Nháp Brief', color: 'bg-slate-800 text-slate-300 border-slate-700' };
      case 'PLAN_PENDING':
        return { label: 'Chờ Duyệt Kế Hoạch & Quota', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'QUOTA_ALLOCATED':
        return { label: 'Đã Cấp Quota AI', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'IN_PRODUCTION':
        return { label: 'Đang Sản Xuất Studio', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'EPISODE_SUBMITTED':
        return { label: 'Chờ Thẩm Định Video', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'CHANGES_REQUESTED':
        return { label: 'Yêu Cầu Sửa Đổi', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
      case 'COMPLIANCE_PASSED':
        return { label: 'Đạt Chuẩn Pháp Lý', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'PUBLISHED':
        return { label: 'Đã Phát Hành OTT', color: 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50' };
      default:
        return { label: status, color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const statusBadge = getStatusBadge(currentPackage?.status || 'PLAN_PENDING');

  return (
    <div className="bg-[#11141D] border-b border-white/10 text-white sticky top-16 z-30 shadow-2xl backdrop-blur-xl w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        {/* Top bar: Project Meta & Role Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Project title & Active Episode Selector */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ruby via-ruby-dark to-purple-900 flex items-center justify-center shadow-lg shadow-ruby/20 border border-white/10 shrink-0">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-ruby/20 text-ruby-light border border-ruby/40">
                  Main Flow 1: Maker - Checker
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                <span className="text-xs text-slate-400 hidden sm:inline font-mono">PostgreSQL Aligned</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>{project.title}</span>
              </h2>
            </div>
          </div>

          {/* Center: Maker - Checker Segmented Toggle */}
          <div className="flex items-center bg-[#161922] p-1 rounded-xl border border-white/15 shadow-inner">
            <button
              onClick={() => handleRoleChange('creator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isCreator
                  ? 'bg-gradient-to-r from-ruby to-ruby-dark text-white shadow-md shadow-ruby/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Creator (Maker)</span>
            </button>

            <button
              onClick={() => handleRoleChange('reviewer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isReviewer
                  ? 'bg-gradient-to-r from-neon-dark to-neon text-white shadow-md shadow-neon/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Reviewer (Checker)</span>
            </button>
          </div>

          {/* Right: Token Quota & Quick Reset */}
          <div className="flex items-center gap-3">
            <div className="bg-[#161922] px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Zap className={`w-4 h-4 ${isQuotaWarning ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <span className="text-slate-400">Tokens:</span>
                    <span className={isQuotaWarning ? 'text-red-400 font-mono' : 'text-amber-300 font-mono'}>
                      {project.consumed_tokens} / {project.allocated_tokens}
                    </span>
                  </div>
                  {/* Mini Progress Bar */}
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isQuotaWarning ? 'bg-red-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, quotaPercent)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={resetDemoData}
              title="Khôi phục dữ liệu mẫu ban đầu"
              className="p-2 rounded-xl bg-[#161922] hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom bar: Episode Pills & State tracker */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {/* Episode Tabs */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Tập phim:
            </span>
            {project.episodes.map((ep) => {
              const isSelected = ep.id === currentPackage?.id;
              const epBadge = getStatusBadge(ep.status);

              return (
                <button
                  key={ep.id}
                  onClick={() => setActivePackage(ep.id)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 border-white/30 text-white font-bold shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <span>Tập {ep.episode_number}</span>
                  <span className={`w-2 h-2 rounded-full ${ep.status === 'PUBLISHED' ? 'bg-emerald-400' : ep.status === 'EPISODE_SUBMITTED' ? 'bg-purple-400' : 'bg-amber-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Active Package Status Badge */}
          {currentPackage && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Trạng thái tập đang chọn:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoleNavHeader;
