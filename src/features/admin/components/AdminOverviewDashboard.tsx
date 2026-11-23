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
import type { RevenueReport } from '@/types/billing';
import type { ProjectSummary } from '@/types/production';
import { PageHeader } from '@/components/data/PageHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { AdminOverviewKpis } from './AdminOverviewKpis';
import { OverviewChartCard } from './OverviewChartCard';

const today = () => new Date().toISOString().slice(0, 10);

const RANGES = [
  { key: '7d', label: '7 ngày qua', period: '7 ngày', days: -7 },
  { key: '30d', label: '30 ngày qua', period: '30 ngày', days: -30 },
  { key: '90d', label: '90 ngày qua', period: '90 ngày', days: -90 },
] as const;
type RangeKey = (typeof RANGES)[number]['key'];

/** Each entity keeps one hue of the dashboard palette on every chart: Coin chính violet, Coin thưởng amber… */
const HUE = { main: 'var(--viz-1)', bonus: 'var(--viz-2)', done: 'var(--viz-3)', member: 'var(--viz-4)', cancelled: 'var(--viz-5)' };

const endOfDay = (ymd: string) => `${ymd}T23:59:59.999Z`;
const shortTitle = (p: ProjectSummary, i: number) => {
  const title = p.title?.trim();
  if (!title) return `Dự án ${i + 1}`;
  return title.length > 14 ? `${title.slice(0, 12)}…` : title;
};

export function AdminOverviewDashboard() {
  const [selectedRange, setSelectedRange] = useState<RangeKey>('30d');
  const range = RANGES.find((r) => r.key === selectedRange) ?? RANGES[1];

  const toDate = today();
  const fromDate = addDays(toDate, range.days);
  // The period just before, of the same length, for the change shown on the revenue figures.
  const prevTo = addDays(fromDate, -1);
  const prevFrom = addDays(fromDate, range.days - 1);
  const rangeKey = `${selectedRange}:${fromDate}:${toDate}`;

  const revenueRes = useResource<RevenueReport>(`admin:overview:revenue:${rangeKey}`, () =>
    billingAdminService.revenue({ from: fromDate, to: endOfDay(toDate) }),
  );
  const previousRes = useResource<RevenueReport>(`admin:overview:revenue-prev:${rangeKey}`, () =>
    billingAdminService.revenue({ from: prevFrom, to: endOfDay(prevTo) }),
  );
  const projectsRes = useResource('admin:overview:projects', () => productionService.listProjects({ limit: 100 }));
  const accountsRes = useResource('admin:overview:accounts', () => adminService.listAccounts({ limit: 100 }));

  const revenue = revenueRes.data;
  const projects = projectsRes.data?.data ?? [];
  const accounts = accountsRes.data?.data ?? [];
  const countProjects = (...statuses: ProjectSummary['status'][]) => projects.filter((p) => statuses.includes(p.status)).length;
  const countRole = (...roles: string[]) => accounts.filter((a) => roles.includes(a.role)).length;
  const doneProjects = countProjects('COMPLETED');

  const projectDonutData = [
    { label: 'Đang sản xuất', value: countProjects('IN_PRODUCTION', 'UNDER_REVISION'), color: HUE.main },
    { label: 'Lên kế hoạch', value: countProjects('DRAFT', 'ASSIGNED'), color: HUE.bonus },
    { label: 'Hoàn tất', value: doneProjects, color: HUE.done },
    { label: 'Đã huỷ', value: countProjects('CANCELLED'), color: HUE.cancelled },
  ];

  const withEpisodes = projects.filter((p) => (p._count?.episodes ?? 0) > 0 || p.status === 'IN_PRODUCTION').slice(0, 6);

  const planBarSeries = [
    { name: 'Coin chính', color: HUE.main, values: revenue?.byPlan.map((p) => p.mainCoins) ?? [] },
    { name: 'Coin thưởng', color: HUE.bonus, values: revenue?.byPlan.map((p) => p.bonusCoins) ?? [] },
  ];

  const coinCompositionData = [
    { label: 'Coin chính', value: revenue?.totals.mainCoins ?? 0, color: HUE.main },
    { label: 'Coin thưởng', value: revenue?.totals.bonusCoins ?? 0, color: HUE.bonus },
  ];

  const roleDonutData = [
    { label: 'Khán giả (Member)', value: countRole('MEMBER'), color: HUE.member },
    { label: 'Creator', value: countRole('CONTENT_CREATOR'), color: HUE.main },
    { label: 'Reviewer', value: countRole('CONTENT_REVIEWER'), color: HUE.done },
    { label: 'Quản trị & Staff', value: countRole('STAFF', 'ADMIN'), color: HUE.bonus },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Tổng quan hệ thống"
        description="Doanh thu gói thành viên, tiến độ sản xuất phim và tài khoản trên toàn nền tảng."
        actions={
          <Tabs value={selectedRange} onValueChange={(v) => setSelectedRange(v as RangeKey)}>
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
        previous={previousRes.data}
        periodLabel={range.period}
        projectCount={projects.length}
        completedProjects={doneProjects}
        accountCount={accountsRes.data?.meta.totalItems ?? accounts.length}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <OverviewChartCard
          className="lg:col-span-2"
          title="Doanh thu theo gói thành viên"
          description="Số Coin thu được từ từng gói thành viên trong khoảng thời gian đã chọn"
          link={{ href: '/admin/membership-plans?tab=reports', label: 'Chi tiết báo cáo' }}
        >
          {revenueRes.loading && !revenue && <Loading />}
          {revenueRes.error && <ErrorNote message={revenueRes.error} onRetry={revenueRes.reload} />}
          {revenue && <BarChart categories={revenue.byPlan.map((p) => p.plan.name)} series={planBarSeries} valueUnit="Coin" height={240} />}
        </OverviewChartCard>

        <OverviewChartCard title="Cơ cấu Coin thu được" description="Tỉ trọng giữa Coin chính (nạp tiền) và Coin thưởng (khuyến mãi)">
          {revenue && (
            <DonutChart data={coinCompositionData} centerLabel="tổng Coin" centerValue={formatNumber(revenue.totals.coins)} valueUnit="Coin" size={180} />
          )}
          <p className="mt-auto rounded-lg border border-projector/40 bg-projector/10 px-3 py-2 text-xs text-foreground">
            Coin thưởng tính vào chi phí quảng bá, chỉ có Coin chính là doanh thu thực.
          </p>
        </OverviewChartCard>
      </div>

      <OverviewChartCard
        title="Số tập phim theo dự án"
        description="Số tập đang sản xuất hoặc đã hoàn tất của các dự án gần đây"
        link={{ href: '/admin/projects', label: 'Quản lý dự án phim' }}
      >
        {projectsRes.loading && !projectsRes.data && <Loading />}
        {projectsRes.error && <ErrorNote message={projectsRes.error} onRetry={projectsRes.reload} />}
        {projectsRes.data &&
          (withEpisodes.length > 0 ? (
            <BarChart
              categories={withEpisodes.map(shortTitle)}
              series={[{ name: 'Số tập phim', color: HUE.done, values: withEpisodes.map((p) => p._count?.episodes ?? 0) }]}
              valueUnit="tập"
              height={220}
            />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">Chưa có dự án nào có tập phim.</p>
          ))}
      </OverviewChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OverviewChartCard
          title="Trạng thái dự án phim"
          description="Tỉ lệ dự án đang sản xuất, lên kế hoạch, hoàn tất và đã huỷ"
          link={{ href: '/admin/projects', label: 'Xem danh sách' }}
        >
          <DonutChart data={projectDonutData} centerLabel="dự án" centerValue={projects.length} valueUnit="phim" size={180} />
        </OverviewChartCard>

        <OverviewChartCard
          title="Tài khoản theo vai trò"
          description="Khán giả, đội ngũ sáng tạo và quản trị trên nền tảng"
          link={{ href: '/admin/permissions?tab=accounts', label: 'Quản lý tài khoản' }}
        >
          {accountsRes.error && <ErrorNote message={accountsRes.error} onRetry={accountsRes.reload} />}
          <DonutChart data={roleDonutData} centerLabel="tài khoản" centerValue={accounts.length} valueUnit="tài khoản" size={180} />
        </OverviewChartCard>
      </div>
    </div>
  );
}
