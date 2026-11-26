import { Coins, FolderKanban, ReceiptText, Users } from 'lucide-react';
import { StatCard } from '@/components/data/StatCard';
import { formatNumber } from '@/lib/format';
import type { RevenueReport } from '@/types/billing';

/** Change from `before` to `now` in percent, one decimal; `null` when the period before had nothing to compare with. */
export function percentChange(now: number, before: number | undefined): number | null {
  if (before === undefined || before === 0) return null;
  return Math.round(((now - before) / before) * 1000) / 10;
}

interface AdminOverviewKpisProps {
  revenue?: RevenueReport | null;
  /** The same report for the period just before, to show the change. */
  previous?: RevenueReport | null;
  /** "7 ngày", "30 ngày"… the length of the period, for the trend line. */
  periodLabel: string;
  projectCount: number;
  completedProjects: number;
  accountCount: number;
}

/** The four headline numbers of the Admin overview; the revenue figures carry their change against the period before. */
export function AdminOverviewKpis({ revenue, previous, periodLabel, projectCount, completedProjects, accountCount }: AdminOverviewKpisProps) {
  const vsBefore = `so với ${periodLabel} trước đó`;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        featured
        icon={Coins}
        label="Doanh thu gói"
        value={formatNumber(revenue?.totals.coins ?? 0)}
        unit="Coin"
        trend={revenue ? { delta: percentChange(revenue.totals.coins, previous?.totals.coins), label: vsBefore } : undefined}
        note={`${formatNumber(revenue?.totals.mainCoins ?? 0)} Coin chính`}
      />
      <StatCard
        icon={ReceiptText}
        accent={1}
        label="Kỳ thanh toán"
        value={formatNumber(revenue?.totals.paidCycles ?? 0)}
        trend={revenue ? { delta: percentChange(revenue.totals.paidCycles, previous?.totals.paidCycles), label: vsBefore } : undefined}
        note="Kỳ gói đã thu Coin"
      />
      <StatCard icon={FolderKanban} accent={2} label="Dự án phim" value={projectCount} note={`${completedProjects} phim đã hoàn tất`} noteTone="good" />
      <StatCard icon={Users} accent={3} label="Tài khoản" value={formatNumber(accountCount)} note="Đang hoạt động trên nền tảng" />
    </div>
  );
}
