import type { ReactNode } from 'react';
import { Clapperboard, CreditCard, Receipt, Users } from 'lucide-react';
import { formatNumber } from '@/features/production/lib/format';
import type { RevenueReport } from '@/types/billing';

// Full class names so Tailwind keeps them.
const TONES = {
  purple: {
    icon: 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
    note: 'text-purple-600 dark:text-purple-400',
  },
  emerald: {
    icon: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    note: 'text-emerald-600 dark:text-emerald-400',
  },
  sky: {
    icon: 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400',
    note: 'text-sky-600 dark:text-sky-400',
  },
  amber: {
    icon: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
    note: 'text-amber-600 dark:text-amber-400',
  },
} as const;

interface KpiCardProps {
  icon: ReactNode;
  tone: keyof typeof TONES;
  label: string;
  value: ReactNode;
  note: ReactNode;
}

function KpiCard({ icon, tone, label, value, note }: KpiCardProps) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-card shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${TONES[tone].icon}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black font-mono text-slate-900 dark:text-white truncate">{value}</p>
        <p className={`text-[11px] font-medium truncate ${TONES[tone].note}`}>{note}</p>
      </div>
    </div>
  );
}

interface AdminOverviewKpisProps {
  revenue?: RevenueReport | null;
  projectCount: number;
  completedProjects: number;
  accountCount: number;
}

/** The four headline numbers of the Admin overview. */
export function AdminOverviewKpis({ revenue, projectCount, completedProjects, accountCount }: AdminOverviewKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        icon={<Receipt className="w-6 h-6" />}
        tone="purple"
        label="Doanh thu gói"
        value={
          <>
            {formatNumber(revenue?.totals.coins ?? 0)}{' '}
            <span className="text-xs font-sans font-medium text-slate-400">Coin</span>
          </>
        }
        note={`${formatNumber(revenue?.totals.mainCoins ?? 0)} Coin chính`}
      />
      <KpiCard
        icon={<CreditCard className="w-6 h-6" />}
        tone="emerald"
        label="Kỳ thanh toán"
        value={formatNumber(revenue?.totals.paidCycles ?? 0)}
        note="Giao dịch gói thành công"
      />
      <KpiCard
        icon={<Clapperboard className="w-6 h-6" />}
        tone="sky"
        label="Dự án phim"
        value={projectCount}
        note={`${completedProjects} phim đã hoàn tất`}
      />
      <KpiCard
        icon={<Users className="w-6 h-6" />}
        tone="amber"
        label="Tài khoản"
        value={accountCount}
        note="Đang hoạt động trên sàn"
      />
    </div>
  );
}
