'use client';

import { useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp, Clapperboard, Film, CheckCircle2 } from 'lucide-react';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChart } from '@/components/charts/BarChart';
import type { ProjectSummary } from '@/types/production';

interface CreatorAnalyticsSectionProps {
  projects: ProjectSummary[];
  roleTitle?: string;
}

export function CreatorAnalyticsSection({ projects, roleTitle = 'Creator' }: CreatorAnalyticsSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Status breakdown
  const statusCounts = {
    plan: projects.filter((p) => p.status === 'DRAFT' || p.status === 'ASSIGNED').length,
    production: projects.filter((p) => p.status === 'IN_PRODUCTION' || p.status === 'UNDER_REVISION').length,
    done: projects.filter((p) => p.status === 'COMPLETED').length,
    cancelled: projects.filter((p) => p.status === 'CANCELLED').length,
  };

  const donutData = [
    { label: 'Đang sản xuất', value: statusCounts.production, color: 'var(--chart-1)' },
    { label: 'Hoàn tất', value: statusCounts.done, color: 'var(--chart-3)' },
    { label: 'Lên kế hoạch', value: statusCounts.plan, color: 'var(--chart-2)' },
    { label: 'Đã huỷ', value: statusCounts.cancelled, color: 'var(--chart-4)' },
  ];

  // Real-time active projects with episode counts (Top 6)
  const recentProjects = [...projects]
    .filter((p) => (p._count?.episodes ?? 0) > 0 || p.status === 'IN_PRODUCTION')
    .slice(0, 6);

  // Use real project titles (shortened if needed) for real-time fidelity
  const barCategories = recentProjects.map((p, idx) => {
    const title = p.title?.trim();
    if (title && title.length > 0) {
      return title.length > 15 ? `${title.slice(0, 13)}…` : title;
    }
    return `Dự án ${idx + 1}`;
  });

  const barSeries = [
    {
      name: 'Số tập đã quay / dựng',
      color: 'var(--chart-3)',
      values: recentProjects.map((p) => p._count?.episodes ?? 0),
    },
  ];

  const totalEpisodes = projects.reduce((acc, p) => acc + (p._count?.episodes ?? 0), 0);

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-card shadow-sm overflow-hidden mb-6">
      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Thống kê & Tiến độ sản xuất
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tổng quan phân bổ dự án và số lượng tập phim thực tế của {roleTitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          {collapsed ? (
            <>
              <span>Mở biểu đồ</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Thu gọn</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* ── Collapsible Body ── */}
      {!collapsed && (
        <div className="p-6 space-y-6 animate-fade-in">
          {/* 3 KPI Summary Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tổng số dự án
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {projects.length}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Clapperboard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tổng tập hoàn thành
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {totalEpisodes}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Dự án đã đóng máy
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {statusCounts.done}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Row: 2 Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Donut Chart: Project Status Distribution */}
            <div className="p-5 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.02]">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Phân bổ trạng thái dự án
              </h4>
              <DonutChart
                data={donutData}
                centerLabel="dự án"
                centerValue={projects.length}
                valueUnit="phim"
                size={180}
              />
            </div>

            {/* Bar Chart: Episode Output (Real-time data) */}
            <div className="p-5 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Số tập phim theo dự án
                </h4>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  Real-time Data
                </span>
              </div>
              {barCategories.length > 0 ? (
                <BarChart
                  categories={barCategories}
                  series={barSeries}
                  valueUnit="tập"
                  height={180}
                />
              ) : (
                <div className="flex items-center justify-center h-[180px] text-xs text-slate-400">
                  Chưa có dữ liệu tập phim cho các dự án.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
