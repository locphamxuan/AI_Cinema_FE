'use client';

import Link from 'next/link';
import { Empty } from '@/features/production/components/shared/ui';
import { FEE_ENTRY } from '@/features/production/lib/labels';
import { formatDateTime, formatNumber } from '@/features/production/lib/format';
import type { ReviewerWallet, TokenHistoryEntry, TokenTotals } from '@/types/reviewer-token';

/** Left, granted and allocated Token, with the VND value at today's rate. */
export function TokenTotalsCards({ totals, rateVnd }: { totals: TokenTotals; rateVnd: number }) {
  const cards = [
    {
      label: 'Token còn lại',
      hint: 'Khả dụng để cấp dự án',
      value: totals.balanceTokens,
      vnd: totals.balanceTokens * rateVnd,
      primary: true,
    },
    {
      label: 'Admin đã cấp',
      hint: 'Tổng Token được phê duyệt',
      value: totals.grantedTokens,
      vnd: totals.grantedTokens * rateVnd,
      primary: false,
    },
    {
      label: 'Đã cấp cho dự án',
      hint: 'Chi phí sản xuất đã phân bổ',
      value: totals.allocatedTokens,
      vnd: totals.allocatedTokens * rateVnd,
      primary: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`relative rounded-2xl p-5 border transition-all duration-200 ${
            c.primary
              ? 'bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/25 shadow-xs'
              : 'bg-white dark:bg-[#141720] border-slate-200/80 dark:border-white/10 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
            {c.primary && (
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" title="Đang sẵn sàng sử dụng" />
            )}
          </div>
          <div className="mt-2.5">
            <p className={`text-2xl font-bold font-mono tracking-tight ${c.primary ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-white'}`}>
              {formatNumber(c.value)} <span className="text-sm font-semibold font-sans">Token</span>
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
              <span>Quy đổi:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">≈ {formatNumber(c.vnd)} ₫</span>
            </div>
          </div>
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
export function TokenHistoryTable({
  wallet,
  entries = wallet.history,
  projectHref,
}: {
  wallet: ReviewerWallet;
  /** A filtered part of the history; the whole history by default. */
  entries?: TokenHistoryEntry[];
  projectHref?: (movieId: string) => string;
}) {
  if (entries.length === 0) return <Empty>Chưa có giao dịch Token nào ở mục này.</Empty>;
  return (
    <div className="overflow-x-auto -mx-5 -my-5 p-5">
      <table className="w-full text-xs">
        <thead className="text-[11px] text-slate-500 dark:text-slate-400 text-left bg-slate-50/60 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
          <tr>
            <th className="py-2.5 px-4 font-semibold">Thời gian</th>
            <th className="py-2.5 px-4 font-semibold">Loại giao dịch</th>
            <th className="py-2.5 px-4 font-semibold">Dự án</th>
            <th className="py-2.5 px-4 font-semibold text-right">Biến động</th>
            <th className="py-2.5 px-5 font-semibold">Lý do</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {entries.map((e) => (
            <tr key={`${e.kind}:${e.id}`} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">{formatDateTime(e.createdAt)}</td>
              <td className="py-3 px-4">
                <span className="font-medium text-slate-800 dark:text-slate-200">{kindLabel(e)}</span>
                {e.by && <span className="block text-[10px] text-slate-400 mt-0.5">{e.by.fullName}</span>}
              </td>
              <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                {e.movie ? (
                  projectHref ? (
                    <Link href={projectHref(e.movie.id)} className="font-medium text-purple-600 dark:text-purple-400 hover:underline">
                      {e.movie.title}
                    </Link>
                  ) : (
                    e.movie.title
                  )
                ) : (
                  <span className="text-slate-400">—</span>
                )}
                {e.season && <span className="block text-[10px] text-slate-400 mt-0.5">Mùa {e.season.seasonNumber}{e.season.title ? ` — ${e.season.title}` : ''}</span>}
              </td>
              <td className={`py-3 px-4 text-right font-mono font-bold ${e.amountTokens < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {e.amountTokens > 0 ? '+' : ''}
                {formatNumber(e.amountTokens)} <span className="text-[10px] font-normal">Token</span>
              </td>
              <td className="py-3 px-5 text-slate-600 dark:text-slate-400 text-[11px] max-w-xs">{e.reason ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
