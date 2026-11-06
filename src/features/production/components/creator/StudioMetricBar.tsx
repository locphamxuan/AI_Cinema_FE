'use client';

import { Film, Tv, Scale, Coins } from 'lucide-react';
import type { StudioPortalMetrics } from './types';

interface StudioMetricBarProps {
  metrics: StudioPortalMetrics;
}

export function StudioMetricBar({ metrics }: StudioMetricBarProps) {
  return (
    <section aria-label="Thống kê hiệu suất Studio Partner" className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ── Card 1: Tổng Series Bản Quyền ── */}
        <div className="relative overflow-hidden rounded-2xl bg-[#121622] border border-white/[0.08] p-5 shadow-xl hover:border-white/20 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tổng Series Bản Quyền
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-500/15 text-[#E50914] border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <Film className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
              {metrics.totalProjects}
            </span>
            <span className="text-xs font-medium text-slate-400">Series</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
            Series đang quản lý & phân phối
          </p>
        </div>

        {/* ── Card 2: Tập Đã Chiếu OTT ── */}
        <div className="relative overflow-hidden rounded-2xl bg-[#121622] border border-white/[0.08] p-5 shadow-xl hover:border-white/20 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tập Đã Chiếu OTT
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <Tv className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
              {metrics.publishedEpisodes}
            </span>
            <span className="text-xs font-medium text-slate-400">Tập</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Đã phát hành OTT
            </span>
          </div>
        </div>

        {/* ── Card 3: Hồ Sơ Chờ Kiểm Định ── */}
        <div className="relative overflow-hidden rounded-2xl bg-[#121622] border border-white/[0.08] p-5 shadow-xl hover:border-white/20 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Hồ Sơ Chờ Kiểm Định
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <Scale className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
              {metrics.pendingReviews}
            </span>
            <span className="text-xs font-medium text-slate-400">Hồ sơ</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Chờ Reviewer duyệt Điều 44
            </span>
          </div>
        </div>

        {/* ── Card 4: Doanh Thu Chia Sẻ ── */}
        <div className="relative overflow-hidden rounded-2xl bg-[#121622] border border-white/[0.08] p-5 shadow-xl hover:border-white/20 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Doanh Thu Chia Sẻ
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xs">
              <Coins className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums font-mono">
              {metrics.totalRevenueCoins.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-bold text-red-400">Coin</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Tích luỹ từ lượt xem</span>
            <span className="text-emerald-400 font-semibold text-[11px] font-mono">
              ≈ {(metrics.totalRevenueCoins * 500).toLocaleString('vi-VN')} đ
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
