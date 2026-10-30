'use client';

import { COIN_ENTRY_LABEL, signed } from '@/lib/coinEntry';
import type { CoinEntryType, StatementLine } from '@/types/billing';

const TYPE_COLOR: Partial<Record<CoinEntryType, string>> = {
  TOP_UP: 'bg-verified/20 text-verified',
  DAILY_REWARD: 'bg-neon/20 text-neon',
  REWARD_SPIN: 'bg-neon/20 text-neon',
  SIGNUP_BONUS: 'bg-neon/20 text-neon',
  EPISODE_PURCHASE: 'bg-ruby/20 text-ruby',
  PLAN_PAYMENT: 'bg-coin/20 text-coin',
  PLAN_RENEWAL: 'bg-coin/20 text-coin',
  REFUND: 'bg-info/20 text-info',
};
const typeClass = (type: CoinEntryType) => TYPE_COLOR[type] ?? 'bg-slate-500/15 text-slate-500';

const amountClass = (amount: number, gain: string) => {
  if (amount === 0) return 'text-slate-400 dark:text-muted';
  return amount > 0 ? gain : 'text-ruby';
};

const when = (iso: string) => {
  const date = new Date(iso);
  return {
    day: date.toLocaleDateString('vi-VN'),
    time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  };
};

const HEAD = 'px-4 py-3 text-[10px] text-slate-500 dark:text-muted-light font-bold';

/** The member's Coin ledger: a table on desktop, cards on mobile, balances as the BE recorded them. */
export default function TransactionList({ lines }: Readonly<{ lines: StatementLine[] }>) {
  return (
    <div className="glass-card overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-white/[0.02]">
              <th className={`text-left ${HEAD}`}>Loại</th>
              <th className={`text-left ${HEAD}`}>Mô tả</th>
              <th className={`text-right ${HEAD}`}>Coin chính</th>
              <th className={`text-right ${HEAD}`}>Coin thưởng</th>
              <th className={`text-right ${HEAD}`}>Số dư sau</th>
              <th className={`text-right ${HEAD}`}>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const { day, time } = when(line.createdAt);
              return (
                <tr
                  key={line.id}
                  className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${typeClass(line.entryType)}`}>
                      {COIN_ENTRY_LABEL[line.entryType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-foreground">{line.description ?? '-'}</td>
                  <td className={`px-4 py-3 text-right text-sm font-bold ${amountClass(line.mainAmount, 'text-verified')}`}>
                    {signed(line.mainAmount)}
                  </td>
                  <td className={`px-4 py-3 text-right text-sm font-bold ${amountClass(line.bonusAmount, 'text-neon')}`}>
                    {signed(line.bonusAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-slate-600 dark:text-muted-light whitespace-nowrap">
                    {line.mainBalanceAfter} 🟡 · {line.bonusBalanceAfter} 🎁
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-slate-600 dark:text-muted-light font-medium">{day}</span>
                    <br />
                    <span className="text-[10px] text-slate-400 dark:text-muted">{time}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="sm:hidden divide-y divide-slate-200 dark:divide-white/5">
        {lines.map((line) => (
          <li key={line.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeClass(line.entryType)}`}>
                {COIN_ENTRY_LABEL[line.entryType]}
              </span>
              <span className="text-[10px] text-muted">{when(line.createdAt).day}</span>
            </div>
            {line.description && <p className="text-sm text-foreground">{line.description}</p>}
            <div className="flex gap-3 text-xs font-bold">
              {line.mainAmount !== 0 && (
                <span className={amountClass(line.mainAmount, 'text-verified')}>🟡 {signed(line.mainAmount)}</span>
              )}
              {line.bonusAmount !== 0 && (
                <span className={amountClass(line.bonusAmount, 'text-neon')}>🎁 {signed(line.bonusAmount)}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {lines.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-foreground font-medium">Chưa có giao dịch nào</p>
          <p className="text-muted-light text-sm mt-1">Thử đổi bộ lọc, hoặc nạp Coin để bắt đầu.</p>
        </div>
      )}
    </div>
  );
}
