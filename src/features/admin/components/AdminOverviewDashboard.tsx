'use client';

import { useState } from 'react';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChart } from '@/components/charts/BarChart';
import { useResource } from '@/hooks/useResource';
import { addDays, formatNumber } from '@/lib/format';
import { billingAdminService } from '@/services/billingAdminService';
import { productionService } from '@/services/productionService';
import { adminService } from '@/services/adminService';
import { ErrorNote, Loading } from '@/components/data/ui';
import type { RevenueReport, ReportRange } from '@/types/billing';
import { PageHeader } from '@/components/data/PageHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { AdminOverviewKpis } from './AdminOverviewKpis';
import { OverviewChartCard } from './OverviewChartCard';

const today = () => new Date().toISOString().slice(0, 10);

const RANGES = [
  { key: '7d', label: '7 ngày qua', days: -7 },
  { key: '30d', label: '30 ngày qua', days: -30 },
  { key: '90d', label: '90 ngày qua', days: -90 },
] as const;

const PURPLE_LINK = 'text-purple-600 dark:text-purple-400';
const EMERALD_LINK = 'text-emerald-600 dark:text-emerald-400';

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
    { label: 'Đang sản xuất', value: projectStats.production, color: 'var(--chart-1)' },
    { label: 'Hoàn tất', value: projectStats.done, color: 'var(--chart-3)' },
    { label: 'Lên kế hoạch', value: projectStats.plan, color: 'var(--chart-2)' },
    { label: 'Đã huỷ', value: projectStats.cancelled, color: 'var(--chart-4)' },
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
      color: 'var(--chart-3)',
      values: topProjectsWithEpisodes.map((p) => p._count?.episodes ?? 0),
    },
  ];

  // Revenue by Plan bar chart
  const planCategories = revenue?.byPlan.map((p) => p.plan.name) ?? [];
  const planBarSeries = [
    {
      name: 'Coin chính',
      color: 'var(--chart-1)',
      values: revenue?.byPlan.map((p) => p.mainCoins) ?? [],
    },
    {
      name: 'Coin thưởng',
      color: 'var(--chart-5)',
      values: revenue?.byPlan.map((p) => p.bonusCoins) ?? [],
    },
  ];

  // Coin composition donut
  const coinCompositionData = [
    { label: 'Coin chính', value: revenue?.totals.mainCoins ?? 0, color: 'var(--chart-1)' },
    { label: 'Coin thưởng', value: revenue?.totals.bonusCoins ?? 0, color: 'var(--chart-5)' },
  ];

  // User role breakdown
  const roleStats = {
    member: accounts.filter((a) => a.role === 'MEMBER').length,
    creator: accounts.filter((a) => a.role === 'CONTENT_CREATOR').length,
    reviewer: accounts.filter((a) => a.role === 'CONTENT_REVIEWER').length,
    staff: accounts.filter((a) => a.role === 'STAFF' || a.role === 'ADMIN').length,
  };

  const roleDonutData = [
    { label: 'Khán giả (Member)', value: roleStats.member, color: 'var(--chart-5)' },
    { label: 'Creator', value: roleStats.creator, color: 'var(--chart-1)' },
    { label: 'Reviewer', value: roleStats.reviewer, color: 'var(--chart-3)' },
    { label: 'Quản trị & Staff', value: roleStats.staff, color: 'var(--chart-2)' },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Tổng quan hệ thống"
        description="Doanh thu gói hội viên, tiến độ sản xuất phim và tài khoản trên toàn nền tảng."
        actions={
          <Tabs value={selectedRange} onValueChange={(v) => setSelectedRange(v as typeof selectedRange)}>
            <TabsList>
              {RANGES.map((r) => (
                <TabsTrigger key={r.key} value={r.key}>
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      />

      <AdminOverviewKpis
        revenue={revenue}
        projectCount={projects.length}
        completedProjects={projectStats.done}
        accountCount={accountsRes.data?.meta.totalItems ?? accounts.length}
      />

      {/* ── Main Analytics Grid: Revenue breakdown & Coin structure ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OverviewChartCard
          className="lg:col-span-2"
          title="Doanh thu phân bổ theo gói hội viên"
          description="Thống kê số Coin thu được từ từng gói hội viên trong khoảng thời gian đã chọn"
          link={{ href: '/admin/membership-plans?tab=reports', label: 'Chi tiết báo cáo', className: PURPLE_LINK }}
        >
          {revenueRes.loading && !revenue && <Loading />}
          {revenueRes.error && <ErrorNote message={revenueRes.error} onRetry={revenueRes.reload} />}
          {revenue && (
            <div className="pt-2">
              <BarChart categories={planCategories} series={planBarSeries} valueUnit="Coin" height={230} />
            </div>
          )}
        </OverviewChartCard>

        <OverviewChartCard
          className="flex flex-col justify-between"
          title="Cơ cấu Coin thu được"
          description="Tỷ trọng giữa tiền nạp thật (Coin chính) và khuyến mãi (Coin thưởng)"
        >
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
             Coin thưởng tính vào chi phí quảng bá, chỉ có Coin chính là doanh thu thực.
          </div>
        </OverviewChartCard>
      </div>

      {/* ── Real-time Episode Output Chart ── */}
      <OverviewChartCard
        title="Số tập phim theo dự án (Real-time)"
        description="Dữ liệu số lượng tập phim thực tế đang được sản xuất hoặc hoàn tất từ các dự án tiêu biểu"
        link={{ href: '/admin/projects', label: 'Quản lý dự án phim', className: EMERALD_LINK }}
      >
        {episodeCategories.length > 0 ? (
          <div className="pt-2">
            <BarChart categories={episodeCategories} series={episodeBarSeries} valueUnit="tập" height={220} />
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            Chưa có dữ liệu tập phim từ các dự án hiện tại.
          </div>
        )}
      </OverviewChartCard>

      {/* ── Secondary Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OverviewChartCard
          title="Trạng thái dự án phim toàn sàn"
          description="Tỷ lệ các dự án đang sản xuất, đã hoàn tất và đang lên kế hoạch"
          link={{ href: '/admin/projects', label: 'Xem danh sách', className: PURPLE_LINK }}
        >
          <div className="py-3 flex items-center justify-center">
            <DonutChart
              data={projectDonutData}
              centerLabel="dự án"
              centerValue={projects.length}
              valueUnit="phim"
              size={190}
            />
          </div>
        </OverviewChartCard>

        <OverviewChartCard
          title="Cơ cấu người dùng theo vai trò"
          description="Phân bổ tài khoản khán giả, đội ngũ sáng tạo và quản trị"
          link={{ href: '/admin/permissions?tab=accounts', label: 'Quản lý tài khoản', className: EMERALD_LINK }}
        >
          <div className="py-3 flex items-center justify-center">
            <DonutChart
              data={roleDonutData}
              centerLabel="tài khoản"
              centerValue={accounts.length}
              valueUnit="user"
              size={190}
            />
          </div>
        </OverviewChartCard>
      </div>
    </div>
  );
}
