'use client';

import { useState } from 'react';
import { useResource } from '@/features/production/hooks/useResource';
import { productionPaths } from '@/features/production/lib/routes';
import { ErrorNote, Loading, Panel } from '@/features/production/components/shared/ui';
import { TokenRequestList } from '@/features/token-request/TokenRequestList';
import { reviewerTokenService } from '@/services/reviewerTokenService';
import type { ReviewerWallet, TokenHistoryEntry } from '@/types/reviewer-token';
import { CoinActivityView } from './CoinActivityView';
import { TokenHistoryTable, TokenTotalsCards } from './TokenWalletView';

type TabKey = 'all' | 'admin' | 'project' | 'request' | 'coin';

const TABS: { key: TabKey; label: string; description: string }[] = [
  { key: 'all', label: 'Tất cả', description: 'Mọi biến động Token, mới nhất trước. Không sửa, không xoá dòng cũ; nhầm thì ghi dòng điều chỉnh.' },
  { key: 'admin', label: 'Admin', description: 'Admin cấp ngân sách, thu hồi phần chưa dùng, và cấp bổ sung khi duyệt đề xuất (MF-1).' },
  { key: 'project', label: 'Dự án phim', description: 'Phí sản xuất bạn cấp cho từng dự án theo mùa: lần đầu, cấp thêm, điều chỉnh (MF-1).' },
  { key: 'request', label: 'Creator xin thêm', description: 'Yêu cầu thêm Token của Creator và khoản bạn đã cấp theo yêu cầu (MF-1).' },
  { key: 'coin', label: 'Coin người xem', description: 'Coin người xem dùng để mở khoá tập trong các phim bạn phụ trách, và phần đã hoàn khi gỡ tập (MF-2).' },
];

/** Sub-filters of the Admin and project tabs, so each kind of entry can be looked at alone. */
const SUBFILTERS: Partial<Record<TabKey, { key: string; label: string; match: (e: TokenHistoryEntry) => boolean }[]>> = {
  admin: [
    { key: 'GRANT', label: 'Cấp', match: (e) => e.kind === 'GRANT' },
    { key: 'REVOKE', label: 'Thu hồi', match: (e) => e.kind === 'REVOKE' },
  ],
  project: [
    { key: 'INITIAL', label: 'Cấp phí lần đầu', match: (e) => e.feeEntryType === 'INITIAL' },
    { key: 'TOP_UP', label: 'Cấp thêm', match: (e) => e.feeEntryType === 'TOP_UP' },
    { key: 'CORRECTION', label: 'Điều chỉnh', match: (e) => e.feeEntryType === 'CORRECTION' },
  ],
};

function entriesOf(wallet: ReviewerWallet, tab: TabKey): TokenHistoryEntry[] {
  if (tab === 'admin') return wallet.history.filter((e) => e.category === 'ADMIN');
  if (tab === 'project') return wallet.history.filter((e) => e.category === 'PROJECT');
  if (tab === 'request') return wallet.history.filter((e) => e.category === 'CREATOR_REQUEST');
  return wallet.history;
}

/** The Reviewer's Token: totals, then the history split by who moved it and why, and the MF-2 Coin of their movies. */
export function ReviewerTokensPage() {
  const wallet = useResource('reviewer-tokens:me', reviewerTokenService.mine);
  const [tab, setTab] = useState<TabKey>('all');
  const [sub, setSub] = useState<string | null>(null);
  const [movieFilter, setMovieFilter] = useState('');
  const projectHref = (id: string) => productionPaths.project('/reviewer', id, 'fee');
  const current = TABS.find((t) => t.key === tab)!;

  const select = (key: TabKey) => {
    setTab(key);
    setSub(null);
    setMovieFilter('');
  };

  const filtered = (data: ReviewerWallet) => {
    const match = SUBFILTERS[tab]?.find((f) => f.key === sub)?.match;
    return entriesOf(data, tab).filter((e) => (!match || match(e)) && (!movieFilter || e.movie?.id === movieFilter));
  };
  const movies = (data: ReviewerWallet) =>
    [...new Map(data.history.filter((e) => e.movie).map((e) => [e.movie!.id, e.movie!])).values()];

  return (
    <main className="w-full px-6 lg:px-8 py-6 space-y-6">
      <div className="border-b border-slate-200/60 dark:border-white/5 pb-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Ví Token Reviewer</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ngân sách do Admin phân bổ để cấp phí sản xuất các dự án phim.</p>
      </div>
      {wallet.error && <ErrorNote message={wallet.error} onRetry={wallet.reload} />}
      {wallet.loading && !wallet.data && <Loading />}
      {wallet.data && (
        <>
          <TokenTotalsCards totals={wallet.data} rateVnd={wallet.data.tokenRateVnd} />
          <div role="tablist" aria-label="Lịch sử Token" className="flex gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-white/5 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => select(t.key)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  tab === t.key ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Panel title={current.label} description={current.description}>
            {tab === 'coin' ? (
              <CoinActivityView activity={wallet.data.coinActivity} projectHref={projectHref} />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {SUBFILTERS[tab] &&
                    [{ key: null, label: 'Tất cả' }, ...SUBFILTERS[tab]!].map((f) => (
                      <button
                        key={f.key ?? 'all'}
                        type="button"
                        aria-pressed={sub === f.key}
                        onClick={() => setSub(f.key)}
                        className={`px-2.5 py-1 rounded-full text-xs border cursor-pointer ${
                          sub === f.key ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  {tab !== 'admin' && (
                    <select
                      value={movieFilter}
                      onChange={(e) => setMovieFilter(e.target.value)}
                      aria-label="Lọc theo dự án"
                      className="ml-auto rounded-lg border border-slate-200 dark:border-white/10 bg-transparent px-2 py-1 text-xs"
                    >
                      <option value="">Mọi dự án</option>
                      {movies(wallet.data).map((m) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  )}
                </div>
                {tab === 'request' && <TokenRequestList canAnswer projectHref={projectHref} />}
                <TokenHistoryTable wallet={wallet.data} entries={filtered(wallet.data)} projectHref={projectHref} />
              </div>
            )}
          </Panel>
        </>
      )}
    </main>
  );
}
