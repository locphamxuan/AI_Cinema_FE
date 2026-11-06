'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Empty } from '@/features/production/components/shared/ui';
import { Pager, pageOf } from '@/features/production/components/shared/Pager';
import { formatNumber } from '@/features/production/lib/format';
import type { CoinActivity } from '@/types/reviewer-token';
import { sanitizeTitle } from '../lib/tokenMockHelper';

const PAGE_SIZE = 10;

function formatFintechDateTime(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${time} • ${date}`;
}

/** MF-2 seen from the Reviewer: Coin viewers paid for episodes of the Reviewer's movies, per movie and line by line. */
export function CoinActivityView({
  activity,
  projectHref,
}: {
  activity?: CoinActivity;
  projectHref: (movieId: string) => string;
}) {
  const [page, setPage] = useState(1);
  if (!activity || activity.entries.length === 0) {
    return <Empty>Chưa có người xem nào mở khoá tập trong các phim bạn phụ trách.</Empty>;
  }

  const { rows, totalPages } = pageOf(activity.entries, page, PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* ── Movie Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {activity.movies.map((m, idx) => {
          const cleanTitle = sanitizeTitle(m.movie.title, idx);
          return (
            <div
              key={m.movie.id}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 p-4 text-xs bg-slate-50/70 dark:bg-white/[0.02] hover:-translate-y-0.5 hover:shadow-sm hover:border-indigo-200 dark:hover:border-white/20 transition-all duration-200"
            >
              <Link
                href={projectHref(m.movie.id)}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline line-clamp-1 text-sm block"
              >
                {cleanTitle}
              </Link>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-mono">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatNumber(m.purchases)}</span> lượt mở khoá ·{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{formatNumber(m.coins)} Coin</span>
                {m.refundedCoins > 0 && (
                  <span className="text-rose-600 dark:text-rose-400"> · hoàn {formatNumber(m.refundedCoins)} Coin</span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Activity Table ── */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/10">
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/10">
            <tr>
              <th scope="col" className="py-3 px-4">Thời gian</th>
              <th scope="col" className="py-3 px-4">Loại giao dịch</th>
              <th scope="col" className="py-3 px-4">Phim / Tập</th>
              <th scope="col" className="py-3 px-4 text-right">Coin thu được</th>
              <th scope="col" className="py-3 px-4 text-right">≈ VND</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
            {rows.map((e, idx) => {
              const cleanTitle = sanitizeTitle(e.movie.title, idx);
              const isPositive = e.coins > 0;
              return (
                <tr
                  key={e.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition-colors duration-150 cursor-default"
                >
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px] whitespace-nowrap">
                    {formatFintechDateTime(e.at)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        e.kind === 'REFUND'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20'
                      }`}
                    >
                      {e.kind === 'REFUND' ? 'Hoàn Coin khi gỡ tập' : 'Mở khoá tập phim'}
                    </span>
                    {e.note && <span className="block text-xs text-slate-400 mt-0.5">{e.note}</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                    {cleanTitle} <span className="font-normal text-slate-500">• Tập {e.episodeNumber}</span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {formatNumber(e.coins)} Coin
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                    ≈ {formatNumber(e.vnd)} ₫
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
