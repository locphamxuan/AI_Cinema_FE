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
    { label: 'Đang sản xuất', value: statusCounts.production, color: '#8b5cf6' },
    { label: 'Hoàn tất', value: statusCounts.done, color: '#10b981' },
    { label: 'Lên kế hoạch', value: statusCounts.plan, color: '#f59e0b' },
    { label: 'Đã huỷ', value: statusCounts.cancelled, color: '#ef4444' },
  ];

  // Top 5 active projects with episode counts
  const recentProjects = [...projects]
    .filter((p) => (p._count?.episodes ?? 0) > 0)
    .slice(0, 5);

  const barCategories = recentProjects.map((_, idx) => `Dự án ${idx + 1}`);
  const barSeries = [
    {
      name: 'Số tập',
      color: '#a855f7',
      values: recentProjects.map((p) => p._count?.episodes ?? 0),
    },
  ];

  const totalEpisodes = projects.reduce((acc, p) => acc + (p._count?.episodes ?? 0), 0);

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] shadow-sm overflow-hidden mb-6">
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
              Tổng quan phân bổ dự án và số lượng tập phim của {roleTitle}
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

      {/* ── Body ── */}
      {!collapsed && (
        <div className="p-6 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/30">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-300 shrink-0">
                <Clapperboard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Tổng dự án
                </p>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {projects.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Đã hoàn tất
                </p>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {statusCounts.done}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/30">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-300 shrink-0">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Tổng số tập phim
                </p>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {totalEpisodes}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
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

            {/* Bar Chart: Episode Output */}
            <div className="p-5 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.02]">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Số tập phim theo dự án
              </h4>
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
