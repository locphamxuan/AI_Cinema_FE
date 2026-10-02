'use client';

import Link from 'next/link';
import { Empty } from '@/features/production/components/shared/ui';
import { FEE_ENTRY } from '@/features/production/lib/labels';
import { formatDateTime, formatNumber } from '@/features/production/lib/format';
import type { ReviewerWallet, TokenHistoryEntry, TokenTotals } from '@/types/reviewer-token';

/** Left, granted and allocated Token, with the VND value at today's rate. */
export function TokenTotalsCards({ totals, rateVnd }: { totals: TokenTotals; rateVnd: number }) {
  const cards = [
    { label: 'Token còn lại', value: totals.balanceTokens, tone: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300' },
    { label: 'Admin đã cấp', value: totals.grantedTokens, tone: 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-100' },
    { label: 'Đã cấp cho dự án', value: totals.allocatedTokens, tone: 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-100' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-xl p-3 ${c.tone}`}>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.label}</p>
          <p className="text-lg font-bold">{formatNumber(c.value)} Token</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">≈ {formatNumber(c.value * rateVnd)} ₫</p>
        </div>
      ))}
    </div>
  );
}

function kindLabel(e: TokenHistoryEntry): string {
  if (e.kind === 'GRANT') return 'Admin cấp';
  if (e.kind === 'REVOKE') return 'Admin thu hồi';
  return `Cấp cho dự án · ${e.feeEntryType ? FEE_ENTRY[e.feeEntryType] : ''}`;
}

/** Grants, take-backs and production fees, newest first; `projectHref` links fee lines to their project. */
export function TokenHistoryTable({ wallet, projectHref }: { wallet: ReviewerWallet; projectHref?: (movieId: string) => string }) {
  if (wallet.history.length === 0) return <Empty>Chưa có giao dịch Token nào.</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-slate-500 dark:text-slate-400 text-left">
          <tr>
            <th className="py-2 font-medium">Thời gian</th>
            <th className="py-2 font-medium">Loại</th>
            <th className="py-2 font-medium">Dự án</th>
            <th className="py-2 font-medium text-right">Token</th>
            <th className="py-2 pl-4 font-medium">Lý do</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {wallet.history.map((e) => (
            <tr key={`${e.kind}:${e.id}`}>
              <td className="py-2 text-slate-500 whitespace-nowrap">{formatDateTime(e.createdAt)}</td>
              <td className="py-2 text-slate-700 dark:text-slate-200">
                {kindLabel(e)}
                {e.by && <span className="block text-[10px] text-slate-400">{e.by.fullName}</span>}
              </td>
              <td className="py-2 text-slate-700 dark:text-slate-200">
                {e.movie ? (
                  projectHref ? (
                    <Link href={projectHref(e.movie.id)} className="hover:underline">
                      {e.movie.title}
                    </Link>
                  ) : (
                    e.movie.title
                  )
                ) : (
                  '—'
                )}
              </td>
              <td className={`py-2 text-right font-mono ${e.amountTokens < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {e.amountTokens > 0 ? '+' : ''}
                {formatNumber(e.amountTokens)}
              </td>
              <td className="py-2 pl-4 text-slate-600 dark:text-slate-300">{e.reason ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
