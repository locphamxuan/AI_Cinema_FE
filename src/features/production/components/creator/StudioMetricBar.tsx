'use client';

import { Clapperboard, Tv, Scale, Coins } from 'lucide-react';
import type { StudioPortalMetrics } from './types';

interface StudioMetricBarProps {
  metrics: StudioPortalMetrics;
}

export function StudioMetricBar({ metrics }: StudioMetricBarProps) {
  return (
    <section aria-label="Thống kê hiệu suất Studio Partner" className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Tổng Số Dự Án */}
        <div className="relative overflow-hidden rounded-2xl bg-[#131722] border border-white/[0.08] p-5 shadow-lg hover:border-[#8B5CF6]/40 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tổng Số Dự Án
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA] group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-[#8B5CF6]/20">
              <Clapperboard className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
              {metrics.totalProjects}
            </span>
            <span className="text-xs font-medium text-slate-400">Dự án</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
            Series đang quản lý & sản xuất
          </p>
        </div>

        {/* Card 2: Tập Phim Đã Lên Sóng */}
        <div className="relative overflow-hidden rounded-2xl bg-[#131722] border border-white/[0.08] p-5 shadow-lg hover:border-[#10B981]/40 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tập Đã Lên Sóng
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#34D399] group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-[#10B981]/20">
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Đã phát hành OTT
            </span>
          </div>
        </div>

        {/* Card 3: Hồ Sơ Chờ Kiểm Định */}
        <div className="relative overflow-hidden rounded-2xl bg-[#131722] border border-white/[0.08] p-5 shadow-lg hover:border-[#F59E0B]/40 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chờ Kiểm Định
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#FBBF24] group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-[#F59E0B]/20">
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30">
              Chờ Reviewer kiểm tra Điều 44
            </span>
          </div>
        </div>

        {/* Card 4: Doanh Thu Chia Sẻ */}
        <div className="relative overflow-hidden rounded-2xl bg-[#131722] border border-white/[0.08] p-5 shadow-lg hover:border-[#E50914]/40 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Doanh Thu Chia Sẻ
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#F87171] group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-[#E50914]/20">
              <Coins className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
              {metrics.totalRevenueCoins.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-bold text-[#F87171]">Coin</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Tích luỹ từ lượt xem</span>
            <span className="text-emerald-400 font-semibold text-[11px]">
              ≈ {(metrics.totalRevenueCoins * 500).toLocaleString('vi-VN')} đ
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
