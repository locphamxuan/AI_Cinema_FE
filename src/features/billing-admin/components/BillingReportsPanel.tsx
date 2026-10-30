'use client';

import { useState } from 'react';
import { fieldInputClass } from '@/components/ui/FormField';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { useResource } from '@/features/production/hooks/useResource';
import { addDays, formatNumber } from '@/features/production/lib/format';
import { ErrorNote, Loading, Panel } from '@/features/production/components/shared/ui';
import { billingAdminService } from '@/services/billingAdminService';
import { BarChart } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { StatCard } from '@/components/data/StatCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import type { ChurnReport, ReportRange, RevenueReport } from '@/types/billing';

const today = () => new Date().toISOString().slice(0, 10);

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return <StatCard label={label} value={value} unit={hint === 'Coin' ? 'Coin' : undefined} note={hint === 'Coin' ? undefined : hint} />;
}

/** MF-2 reports over a date range: plan revenue (main and bonus Coins apart) and churn. */
export function BillingReportsPanel() {
  const can = useCan();
  const [range, setRange] = useState({ from: addDays(today(), -30), to: today() });
  // The end day is included: the BE reads `to` as an instant, so send the end of that day.
  const query: ReportRange = { from: range.from, to: `${range.to}T23:59:59.999Z` };
  const key = `${range.from}:${range.to}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 text-xs">
        <label className="space-y-1">
          <span className="block text-slate-500">Từ ngày</span>
          <input type="date" value={range.from} max={range.to} onChange={(e) => setRange({ ...range, from: e.target.value })} className={`${fieldInputClass} py-1`} />
        </label>
        <label className="space-y-1">
          <span className="block text-slate-500">Đến ngày</span>
          <input type="date" value={range.to} min={range.from} onChange={(e) => setRange({ ...range, to: e.target.value })} className={`${fieldInputClass} py-1`} />
        </label>
      </div>
      {can(PERMISSION.ANALYTICS_REVENUE_READ) && <RevenueSection rangeKey={key} query={query} />}
      {can(PERMISSION.ANALYTICS_CHURN_READ) && <ChurnSection rangeKey={key} query={query} />}
    </div>
  );
}

function RevenueSection({ rangeKey, query }: { rangeKey: string; query: ReportRange }) {
  const report = useResource<RevenueReport>(`report:revenue:${rangeKey}`, () => billingAdminService.revenue(query));
  const r = report.data;
  return (
    <Panel title="Doanh thu gói" description="Chỉ tính các kỳ đã thu Coin; Coin thưởng là chi phí khuyến mãi, không phải doanh thu tiền mặt.">
      {report.error && <ErrorNote message={report.error} onRetry={report.reload} />}
      {report.loading && !r && <Loading />}
      {r && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Kỳ đã thu" value={formatNumber(r.totals.paidCycles)} />
            <Stat label="Tổng giá gói" value={formatNumber(r.totals.coins)} hint="Coin" />
            <Stat label="Thu bằng Coin chính" value={formatNumber(r.totals.mainCoins)} hint="Coin" />
            <Stat label="Thu bằng Coin thưởng" value={formatNumber(r.totals.bonusCoins)} hint="Coin" />
          </div>

          {r.byPlan.length > 0 && (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Biểu đồ doanh thu từng gói</h4>
              <BarChart
                categories={r.byPlan.map((row) => row.plan.name)}
                series={[
                  { name: 'Coin chính', color: 'var(--chart-1)', values: r.byPlan.map((row) => row.mainCoins) },
                  { name: 'Coin thưởng', color: 'var(--chart-5)', values: r.byPlan.map((row) => row.bonusCoins) },
                ]}
                valueUnit="Coin"
                height={200}
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gói</TableHead>
                    <TableHead className="text-right">Kỳ</TableHead>
                    <TableHead className="text-right">Coin chính</TableHead>
                    <TableHead className="text-right">Coin thưởng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {r.byPlan.map((row) => (
                    <TableRow key={row.plan.id}>
                      <TableCell className="font-medium">{row.plan.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.cycles}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(row.mainCoins)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(row.bonusCoins)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

function ChurnSection({ rangeKey, query }: { rangeKey: string; query: ReportRange }) {
  const report = useResource<ChurnReport>(`report:churn:${rangeKey}`, () => billingAdminService.churn(query));
  const c = report.data;
  return (
    <Panel title="Rời gói" description="Gói bắt đầu, gia hạn và kết thúc trong khoảng thời gian đã chọn.">
      {report.error && <ErrorNote message={report.error} onRetry={report.reload} />}
      {report.loading && !c && <Loading />}
      {c && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Gói mới" value={formatNumber(c.started)} />
            <Stat label="Lượt gia hạn" value={formatNumber(c.renewed)} />
            <Stat label="Gói kết thúc" value={formatNumber(c.ended)} />
            <Stat label="Tỉ lệ rời gói" value={`${(c.churnRate * 100).toFixed(1)}%`} hint="kết thúc / gói mới" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-xl border p-5">
              <h3 className="mb-4 text-sm font-semibold">Gói vào và ra</h3>
              <BarChart
                categories={['Gói mới', 'Gia hạn', 'Kết thúc', 'Gia hạn lỗi']}
                series={[
                  { name: 'Số gói', color: 'var(--chart-1)', values: [c.started, c.renewed, c.ended, c.failedRenewals] },
                ]}
                valueUnit="gói"
                height={220}
              />
            </section>
            <section className="rounded-xl border p-5">
              <h3 className="mb-4 text-sm font-semibold">Vì sao gói kết thúc</h3>
              <DonutChart
                data={[
                  { label: 'Member tự huỷ', value: c.cancelledByMember, color: 'var(--chart-1)' },
                  { label: 'Admin huỷ', value: c.cancelledByAdmin, color: 'var(--chart-4)' },
                  { label: 'Hết hạn vì thiếu Coin', value: c.expiredForPayment, color: 'var(--chart-2)' },
                  { label: 'Hết kỳ, không gia hạn', value: c.expiredUnused, color: 'var(--chart-3)' },
                ]}
                centerLabel="gói kết thúc"
                valueUnit="gói"
                size={170}
              />
            </section>
          </div>
          <p className="text-sm text-muted-foreground">
            Đang chạy lúc này: <span className="font-medium text-foreground tabular-nums">{formatNumber(c.running)}</span> gói.
          </p>
        </div>
      )}
    </Panel>
  );
}
