'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, Film, TrendingUp, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChart } from '@/components/charts/BarChart';
import { useResource } from '@/features/production/hooks/useResource';
import { addDays, formatNumber } from '@/features/production/lib/format';
import { billingAdminService } from '@/services/billingAdminService';
import { productionService } from '@/services/productionService';
import { adminService } from '@/services/adminService';
import { ErrorNote, Loading } from '@/features/production/components/shared/ui';
import type { RevenueReport, ReportRange } from '@/types/billing';
import { AdminOverviewKpis } from './AdminOverviewKpis';

const today = () => new Date().toISOString().slice(0, 10);

const RANGES = [
  { key: '7d', label: '7 ngày qua', days: -7 },
  { key: '30d', label: '30 ngày qua', days: -30 },
  { key: '90d', label: '90 ngày qua', days: -90 },
] as const;

export function AdminOverviewDashboard() {
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d'>('30d');
  const daysOffset = RANGES.find((r) => r.key === selectedRange)?.days ?? -30;

  const fromDate = addDays(today(), daysOffset);
  const toDate = today();
  const query: ReportRange = { from: fromDate, to: `${toDate}T23:59:59.999Z` };
  const rangeKey = `${selectedRange}:${fromDate}:${toDate}`;

  // Resources
  const revenueRes = useResource<RevenueReport>(`admin:overview:revenue:${rangeKey}`, () =>
    billingAdminService.revenue(query),
  );
  const projectsRes = useResource('admin:overview:projects', () =>
    productionService.listProjects({ limit: 100 }),
  );
  const accountsRes = useResource('admin:overview:accounts', () =>
    adminService.listAccounts({ limit: 100 }),
  );

  const revenue = revenueRes.data;
  const projects = projectsRes.data?.data ?? [];
  const accounts = accountsRes.data?.data ?? [];

  // Project status breakdown
  const projectStats = {
    production: projects.filter((p) => p.status === 'IN_PRODUCTION' || p.status === 'UNDER_REVISION').length,
    done: projects.filter((p) => p.status === 'COMPLETED').length,
    plan: projects.filter((p) => p.status === 'DRAFT' || p.status === 'ASSIGNED').length,
    cancelled: projects.filter((p) => p.status === 'CANCELLED').length,
  };

  const projectDonutData = [
    { label: 'Đang sản xuất', value: projectStats.production, color: '#8b5cf6' },
    { label: 'Hoàn tất', value: projectStats.done, color: '#10b981' },
    { label: 'Lên kế hoạch', value: projectStats.plan, color: '#f59e0b' },
    { label: 'Đã huỷ', value: projectStats.cancelled, color: '#ef4444' },
  ];

  // Real-time episode output by project
  const topProjectsWithEpisodes = [...projects]
    .filter((p) => (p._count?.episodes ?? 0) > 0 || p.status === 'IN_PRODUCTION')
    .slice(0, 6);

  const episodeCategories = topProjectsWithEpisodes.map((p, idx) => {
    const title = p.title?.trim();
    if (title && title.length > 0) {
      return title.length > 14 ? `${title.slice(0, 12)}…` : title;
    }
    return `Dự án ${idx + 1}`;
  });

  const episodeBarSeries = [
    {
      name: 'Số tập phim',
      color: '#10b981',
      values: topProjectsWithEpisodes.map((p) => p._count?.episodes ?? 0),
    },
  ];

  // Revenue by Plan bar chart
  const planCategories = revenue?.byPlan.map((p) => p.plan.name) ?? [];
  const planBarSeries = [
    {
      name: 'Coin chính',
      color: '#8b5cf6',
      values: revenue?.byPlan.map((p) => p.mainCoins) ?? [],
    },
    {
      name: 'Coin thưởng',
      color: '#38bdf8',
      values: revenue?.byPlan.map((p) => p.bonusCoins) ?? [],
    },
  ];

  // Coin composition donut
  const coinCompositionData = [
    { label: 'Coin chính', value: revenue?.totals.mainCoins ?? 0, color: '#8b5cf6' },
    { label: 'Coin thưởng', value: revenue?.totals.bonusCoins ?? 0, color: '#38bdf8' },
  ];

  // User role breakdown
  const roleStats = {
    member: accounts.filter((a) => a.role === 'MEMBER').length,
    creator: accounts.filter((a) => a.role === 'CONTENT_CREATOR').length,
    reviewer: accounts.filter((a) => a.role === 'CONTENT_REVIEWER').length,
    staff: accounts.filter((a) => a.role === 'STAFF' || a.role === 'ADMIN').length,
  };

  const roleDonutData = [
    { label: 'Khán giả (Member)', value: roleStats.member, color: '#3b82f6' },
    { label: 'Creator', value: roleStats.creator, color: '#8b5cf6' },
    { label: 'Reviewer', value: roleStats.reviewer, color: '#10b981' },
    { label: 'Quản trị & Staff', value: roleStats.staff, color: '#f59e0b' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* ── Top Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-gradient-to-br from-slate-900 via-[#161928] to-purple-950/40 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Trung tâm chỉ huy Quản trị
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tổng quan hệ thống AI Cinema
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Theo dõi tình hình kinh doanh gói hội viên, tiến độ sản xuất phim và phân bổ tài khoản người dùng trên toàn nền tảng.
            </p>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 self-start md:self-auto">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setSelectedRange(r.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedRange === r.key
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AdminOverviewKpis
        revenue={revenue}
        projectCount={projects.length}
        completedProjects={projectStats.done}
        accountCount={accountsRes.data?.meta.totalItems ?? accounts.length}
      />

      {/* ── Main Analytics Grid: Revenue breakdown & Coin structure ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu theo gói (Bar Chart - 2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                Doanh thu phân bổ theo gói hội viên
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thống kê số Coin thu được từ từng gói hội viên trong khoảng thời gian đã chọn
              </p>
            </div>
            <Link
              href="/admin/membership-plans?tab=reports"
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              Chi tiết báo cáo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {revenueRes.loading && !revenue && <Loading />}
          {revenueRes.error && <ErrorNote message={revenueRes.error} onRetry={revenueRes.reload} />}

          {revenue && (
            <div className="pt-2">
              <BarChart
                categories={planCategories}
                series={planBarSeries}
                valueUnit="Coin"
                height={230}
              />
            </div>
          )}
        </div>

        {/* Cơ cấu Coin chính vs Coin thưởng (Donut - 1 Col) */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              Cơ cấu Coin thu được
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tỷ trọng giữa tiền nạp thật (Coin chính) và khuyến mãi (Coin thưởng)
            </p>
          </div>

          {revenue && (
            <div className="py-2 flex items-center justify-center">
              <DonutChart
                data={coinCompositionData}
                centerLabel="tổng Coin"
                centerValue={formatNumber(revenue.totals.coins)}
                valueUnit="Coin"
                size={190}
              />
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
            💡 Coin thưởng tính vào chi phí quảng bá, chỉ có Coin chính là doanh thu thực.
          </div>
        </div>
      </div>

      {/* ── Real-time Episode Output Chart ── */}
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-emerald-500" />
              Số tập phim theo dự án (Real-time)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dữ liệu số lượng tập phim thực tế đang được sản xuất hoặc hoàn tất từ các dự án tiêu biểu
            </p>
          </div>
          <Link
            href="/admin/projects"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            Quản lý dự án phim <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {episodeCategories.length > 0 ? (
          <div className="pt-2">
            <BarChart
              categories={episodeCategories}
              series={episodeBarSeries}
              valueUnit="tập"
              height={220}
            />
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            Chưa có dữ liệu tập phim từ các dự án hiện tại.
          </div>
        )}
      </div>

      {/* ── Secondary Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phân bổ trạng thái dự án */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-500" />
                Trạng thái dự án phim toàn sàn
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tỷ lệ các dự án đang sản xuất, đã hoàn tất và đang lên kế hoạch
              </p>
            </div>
            <Link
              href="/admin/projects"
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              Xem danh sách <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="py-3 flex items-center justify-center">
            <DonutChart
              data={projectDonutData}
              centerLabel="dự án"
              centerValue={projects.length}
              valueUnit="phim"
              size={190}
            />
          </div>
        </div>

        {/* Cơ cấu người dùng */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                Cơ cấu người dùng theo vai trò
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Phân bổ tài khoản khán giả, đội ngũ sáng tạo và quản trị
              </p>
            </div>
            <Link
              href="/admin/permissions?tab=accounts"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Quản lý tài khoản <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="py-3 flex items-center justify-center">
            <DonutChart
              data={roleDonutData}
              centerLabel="tài khoản"
              centerValue={accounts.length}
              valueUnit="user"
              size={190}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
