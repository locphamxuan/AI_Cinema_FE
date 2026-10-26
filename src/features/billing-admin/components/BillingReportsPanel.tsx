'use client';

import { useState } from 'react';
import { fieldInputClass } from '@/components/ui/FormField';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { useResource } from '@/features/production/hooks/useResource';
import { addDays, formatNumber } from '@/features/production/lib/format';
import { ErrorNote, Loading, Panel } from '@/features/production/components/shared/ui';
import { billingAdminService } from '@/services/billingAdminService';
import type { ChurnReport, ReportRange, RevenueReport } from '@/types/billing';

const today = () => new Date().toISOString().slice(0, 10);

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-white/10 p-3">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{value}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Kỳ đã thu" value={formatNumber(r.totals.paidCycles)} />
            <Stat label="Tổng giá gói" value={formatNumber(r.totals.coins)} hint="Coin" />
            <Stat label="Thu bằng Coin chính" value={formatNumber(r.totals.mainCoins)} hint="Coin" />
            <Stat label="Thu bằng Coin thưởng" value={formatNumber(r.totals.bonusCoins)} hint="Coin" />
          </div>
          {r.byPlan.length > 0 && (
            <table className="w-full text-xs">
              <thead className="text-slate-500 text-left">
                <tr>
                  <th className="py-1 font-medium">Gói</th>
                  <th className="py-1 font-medium text-right">Kỳ</th>
                  <th className="py-1 font-medium text-right">Coin chính</th>
                  <th className="py-1 font-medium text-right">Coin thưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {r.byPlan.map((row) => (
                  <tr key={row.plan.id}>
                    <td className="py-1">{row.plan.name}</td>
                    <td className="py-1 text-right font-mono">{row.cycles}</td>
                    <td className="py-1 text-right font-mono">{formatNumber(row.mainCoins)}</td>
                    <td className="py-1 text-right font-mono">{formatNumber(row.bonusCoins)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Gói mới" value={formatNumber(c.started)} />
          <Stat label="Lượt gia hạn" value={formatNumber(c.renewed)} />
          <Stat label="Gói kết thúc" value={formatNumber(c.ended)} />
          <Stat label="Tỉ lệ rời gói" value={`${(c.churnRate * 100).toFixed(1)}%`} hint="kết thúc / gói mới" />
          <Stat label="Member tự huỷ" value={formatNumber(c.cancelledByMember)} />
          <Stat label="Admin huỷ" value={formatNumber(c.cancelledByAdmin)} />
          <Stat label="Hết hạn vì thiếu Coin" value={formatNumber(c.expiredForPayment)} />
          <Stat label="Hết kỳ, không gia hạn" value={formatNumber(c.expiredUnused)} />
          <Stat label="Gia hạn thất bại" value={formatNumber(c.failedRenewals)} />
          <Stat label="Gói đang chạy" value={formatNumber(c.running)} hint="tại thời điểm hiện tại" />
        </div>
      )}
    </Panel>
  );
}
