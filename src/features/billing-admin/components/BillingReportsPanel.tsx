'use client';

import { useState } from 'react';
import { fieldInputClass } from '@/components/ui/FormField';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { useResource } from '@/hooks/useResource';
import { addDays, formatNumber } from '@/lib/format';
import { ErrorNote, Loading, Panel } from '@/components/data/ui';
import { billingAdminService } from '@/services/billingAdminService';
import { BarChart } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { StatCard } from '@/components/data/StatCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import type { ChurnReport, ReportRange, RevenueReport } from '@/types/billing';

const today = () => new Date().toISOString().slice(0, 10);

function Stat({ label, value, unit, note }: { label: string; value: string; unit?: string; note?: string }) {
  return <StatCard label={label} value={value} unit={unit} note={note} />;
}

/** MF-2 reports over a date range: Monthly-plan revenue (main and bonus Coins apart) and who leaves the plan. */
export function BillingReportsPanel() {
  const can = useCan();
  const [range, setRange] = useState({ from: addDays(today(), -30), to: today() });
  // Date-only bounds: the BE reads each as a whole Vietnam business day, the end day included (report-range.ts).
  const query: ReportRange = { from: range.from, to: range.to };
  // A cleared box or a start after the end keeps the last valid range instead of sending a request the BE refuses.
  const pick = (next: { from: string; to: string }) => {
    if (next.from && next.to && next.from <= next.to) setRange(next);
  };
  const key = `${range.from}:${range.to}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 text-xs">
        <label className="space-y-1">
          <span className="block text-muted-foreground">Từ ngày</span>
          <input type="date" value={range.from} max={range.to} onChange={(e) => pick({ ...range, from: e.target.value })} className={`${fieldInputClass} py-1`} />
        </label>
        <label className="space-y-1">
          <span className="block text-muted-foreground">Đến ngày</span>
          <input type="date" value={range.to} min={range.from} onChange={(e) => pick({ ...range, to: e.target.value })} className={`${fieldInputClass} py-1`} />
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
    <Panel title="Doanh thu gói Tháng" description="Chỉ tính các kỳ gói đã trả. Coin thưởng là khuyến mãi, không phải tiền thật.">
      {report.error && <ErrorNote message={report.error} onRetry={report.reload} />}
      {report.loading && !r && <Loading />}
      {r && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Kỳ gói đã trả" value={formatNumber(r.totals.paidCycles)} />
            <Stat label="Tổng Coin thu" value={formatNumber(r.totals.coins)} unit="Coin" />
            <Stat label="Trả bằng Coin chính" value={formatNumber(r.totals.mainCoins)} unit="Coin" />
            <Stat label="Trả bằng Coin thưởng" value={formatNumber(r.totals.bonusCoins)} unit="Coin" />
          </div>

          {r.byPlan.length > 0 && (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-secondary-foreground">Coin thu theo từng gói</h4>
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
                    <TableHead className="text-right">Kỳ đã trả</TableHead>
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
    <Panel title="Đăng ký và rời gói Tháng" description="Số gói Tháng trong khoảng ngày đã chọn.">
      {report.error && <ErrorNote message={report.error} onRetry={report.reload} />}
      {report.loading && !c && <Loading />}
      {c && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Gói Tháng mới đăng ký" value={formatNumber(c.started)} />
            <Stat label="Lượt gia hạn" value={formatNumber(c.renewed)} />
            <Stat label="Gói Tháng đã huỷ hoặc hết hạn" value={formatNumber(c.ended)} />
            <Stat label="Tỉ lệ rời gói" value={`${(c.churnRate * 100).toFixed(1)}%`} note="= gói huỷ hoặc hết hạn ÷ gói mới đăng ký" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-xl border p-5">
              <h3 className="mb-4 text-sm font-semibold">Đăng ký mới, gia hạn và rời gói</h3>
              <BarChart
                categories={['Đăng ký mới', 'Gia hạn', 'Huỷ hoặc hết hạn']}
                series={[{ name: 'Gói Tháng', color: 'var(--chart-1)', values: [c.started, c.renewed, c.ended] }]}
                valueUnit="gói"
                height={220}
              />
            </section>
            <section className="rounded-xl border p-5">
              <h3 className="mb-4 text-sm font-semibold">Lý do rời gói</h3>
              <DonutChart
                data={[
                  { label: 'Member tự huỷ', value: c.cancelledByMember, color: 'var(--chart-1)' },
                  { label: 'Admin huỷ', value: c.cancelledByAdmin, color: 'var(--chart-4)' },
                  { label: 'Không đủ Coin để gia hạn', value: c.expiredForPayment, color: 'var(--chart-2)' },
                  { label: 'Hết hạn, không gia hạn', value: c.expiredUnused, color: 'var(--chart-3)' },
                ]}
                centerLabel="gói rời đi"
                valueUnit="gói"
                size={170}
              />
            </section>
          </div>
          <p className="text-sm text-muted-foreground">
            Gói Tháng đang hoạt động: <span className="font-medium text-foreground tabular-nums">{formatNumber(c.running)}</span> · Gia hạn
            không thành công: <span className="font-medium text-foreground tabular-nums">{formatNumber(c.failedRenewals)}</span> lần
          </p>
        </div>
      )}
    </Panel>
  );
}
