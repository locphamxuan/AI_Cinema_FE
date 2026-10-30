import { StatCard } from '@/components/data/StatCard';
import { formatNumber } from '@/features/production/lib/format';
import type { RevenueReport } from '@/types/billing';

interface AdminOverviewKpisProps {
  revenue?: RevenueReport | null;
  projectCount: number;
  completedProjects: number;
  accountCount: number;
}

/** The four headline numbers of the Admin overview. */
export function AdminOverviewKpis({ revenue, projectCount, completedProjects, accountCount }: AdminOverviewKpisProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Doanh thu gói"
        value={formatNumber(revenue?.totals.coins ?? 0)}
        unit="Coin"
        note={`${formatNumber(revenue?.totals.mainCoins ?? 0)} Coin chính`}
        featured
      />
      <StatCard
        label="Kỳ thanh toán"
        value={formatNumber(revenue?.totals.paidCycles ?? 0)}
        note="Kỳ gói đã thu Coin"
      />
      <StatCard
        label="Dự án phim"
        value={projectCount}
        note={`${completedProjects} phim đã hoàn tất`}
        noteTone="good"
      />
      <StatCard label="Tài khoản" value={accountCount} note="Đang hoạt động trên nền tảng" />
    </div>
  );
}
