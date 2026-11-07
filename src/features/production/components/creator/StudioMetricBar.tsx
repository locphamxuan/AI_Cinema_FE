'use client';

import { FileText, Clock, Edit3, Handshake } from 'lucide-react';
import type { ScreenwriterMetrics } from './types';

interface StudioMetricBarProps {
  metrics: ScreenwriterMetrics;
}

export function StudioMetricBar({ metrics }: StudioMetricBarProps) {
  return (
    <section aria-label="Thống kê dự án kịch bản phân cảnh" className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ── Card 1: Dự án kịch bản được giao ── */}
        <div className="relative overflow-hidden rounded-2xl bg-[#111420] border border-white/[0.08] p-5 shadow-xl hover:border-white/20 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Kịch Bản Được Giao
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-500/15 text-[#E50914] border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
              {metrics.totalProjects}
            </span>
            <span className="text-xs font-medium text-slate-400">Dự án</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
            Định hướng từ Admin System
          </p>
        </div>

        {/* ── Card 2: Đang chờ Reviewer duyệt ── */}
        <div className="relative overflow-hidden rounded-2xl bg-[#111420] border border-white/[0.08] p-5 shadow-xl hover:border-white/20 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chờ Reviewer Duyệt
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
              {metrics.pendingReviews}
            </span>
            <span className="text-xs font-medium text-slate-400">Kịch bản</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Thẩm định nội dung phân cảnh
            </span>
          </div>
        </div>

        {/* ── Card 3: Cần chỉnh sửa phân cảnh ── */}
        <div className="relative overflow-hidden rounded-2xl bg-[#111420] border border-white/[0.08] p-5 shadow-xl hover:border-white/20 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cần Chỉnh Sửa
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <Edit3 className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
              {metrics.revisionNeeded}
            </span>
            <span className="text-xs font-medium text-slate-400">Kịch bản</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              Reviewer phản hồi hiệu đính
            </span>
          </div>
        </div>

        {/* ── Card 4: Đã chuyển giao Studio sản xuất ── */}
        <div className="relative overflow-hidden rounded-2xl bg-[#111420] border border-white/[0.08] p-5 shadow-xl hover:border-white/20 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chuyển Giao Studio
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <Handshake className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
              {metrics.handedOffProjects}
            </span>
            <span className="text-xs font-medium text-slate-400">Dự án đã ký HĐ</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Studio ngoài đang gia công phim
          </p>
        </div>
      </div>
    </section>
  );
}
