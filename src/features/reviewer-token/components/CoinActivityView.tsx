'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Empty } from '@/components/data/ui';
import { Pager, pageOf } from '@/components/data/Pager';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { CoinActivity } from '@/types/reviewer-token';

const PAGE_SIZE = 15;

/** MF-2 seen from the Reviewer: Coin viewers paid for episodes of the Reviewer's movies, per movie and line by line. */
export function CoinActivityView({ activity, projectHref }: { activity?: CoinActivity; projectHref: (movieId: string) => string }) {
  const [page, setPage] = useState(1);
  if (!activity || activity.entries.length === 0) return <Empty>Chưa có người xem nào mở khoá tập trong các phim bạn phụ trách.</Empty>;
  const { rows, totalPages } = pageOf(activity.entries, page, PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {activity.movies.map((m) => (
          <div key={m.movie.id} className="rounded-xl border border-sky-100 dark:border-white/10 p-3 text-xs">
            <Link href={projectHref(m.movie.id)} className="font-semibold text-sky-700 dark:text-sky-500 hover:underline">
              {m.movie.title}
            </Link>
            <p className="text-slate-500 mt-1">
              {formatNumber(m.purchases)} lượt mở khoá · {formatNumber(m.coins)} Coin
              {m.refundedCoins > 0 && <span className="text-rose-600"> · hoàn {formatNumber(m.refundedCoins)} Coin</span>}
            </p>
          </div>
        ))}
      </div>
      <table className="w-full text-xs">
        <thead className="text-[11px] text-slate-500 text-left border-b border-slate-100 dark:border-white/5">
          <tr>
            <th className="py-2 px-2">Thời gian</th>
            <th className="py-2 px-2">Loại</th>
            <th className="py-2 px-2">Phim / tập</th>
            <th className="py-2 px-2 text-right">Coin</th>
            <th className="py-2 px-2 text-right">≈ VND</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {rows.map((e) => (
            <tr key={e.id}>
              <td className="py-2 px-2 text-slate-500 whitespace-nowrap">{formatDateTime(e.at)}</td>
              <td className="py-2 px-2">
                {e.kind === 'REFUND' ? 'Hoàn Coin khi gỡ tập' : 'Mở khoá tập'}
                {e.note && <span className="block text-xs text-slate-400">{e.note}</span>}
              </td>
              <td className="py-2 px-2">{e.movie.title} · tập {e.episodeNumber}</td>
              <td className={`py-2 px-2 text-right tabular-nums ${e.coins < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {e.coins > 0 ? '+' : ''}
                {formatNumber(e.coins)}
              </td>
              <td className="py-2 px-2 text-right tabular-nums text-slate-500">{formatNumber(e.vnd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
