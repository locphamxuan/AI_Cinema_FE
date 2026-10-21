'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { walletService } from '@/services/walletService';
import TransactionList from '@/components/wallet/TransactionList';
import { COIN_ENTRY_LABEL, COIN_ENTRY_TYPES } from '@/lib/coinEntry';
import type { CoinEntryType, StatementKind, StatementLine } from '@/types/billing';
import type { Page } from '@/types/production';

const KINDS: { value: StatementKind; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'MAIN', label: '🟡 Coin chính' },
  { value: 'BONUS', label: '🎁 Coin thưởng' },
];

const chip = (active: boolean) =>
  `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
    active
      ? 'bg-neon/20 text-neon border border-neon/30'
      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:text-muted-light dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
  }`;

interface Loaded {
  key: string;
  page?: Page<StatementLine>;
  error?: string;
}

/** MF-2: the member's Coin history straight from the BE ledger (GET /wallet/statements). */
export default function TransactionsPage() {
  const { isAuthenticated, wallet } = useAppStore();
  const [kind, setKind] = useState<StatementKind>('ALL');
  const [entryType, setEntryType] = useState<CoinEntryType | ''>('');
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  const key = `${kind}|${entryType}|${page}`;
  useEffect(() => {
    if (!isAuthenticated) return;
    const failed = 'Không tải được lịch sử giao dịch.';
    walletService
      .getStatements({ page, kind, entryType: entryType || undefined })
      .then((res) => setLoaded(res.success ? { key, page: res.data } : { key, error: res.message || failed }))
      .catch(() => setLoaded({ key, error: failed }));
  }, [isAuthenticated, kind, entryType, page, key]);

  if (!isAuthenticated) {
    return <p className="py-20 text-center text-sm text-slate-500">Đăng nhập để xem lịch sử giao dịch.</p>;
  }

  const loading = loaded?.key !== key;
  const meta = loaded?.page?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const refilter = (apply: () => void) => {
    apply();
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">📋 Lịch Sử Giao Dịch</h1>
        <p className="text-muted-light text-sm mt-1">Mọi lần Coin vào và ra ví, ghi nhận từ sổ cái của hệ thống.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="glass-card-sm p-4">
          <p className="text-[10px] text-muted-light uppercase tracking-wider">Coin chính</p>
          <p className="text-2xl font-bold text-coin mt-1">{wallet.mainCoin.toLocaleString('vi-VN')}</p>
        </div>
        <div className="glass-card-sm p-4">
          <p className="text-[10px] text-muted-light uppercase tracking-wider">Coin thưởng</p>
          <p className="text-2xl font-bold text-neon mt-1">{wallet.bonusCoin.toLocaleString('vi-VN')}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <fieldset className="flex flex-wrap gap-2 flex-1">
          <legend className="sr-only">Loại Coin</legend>
          {KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              aria-pressed={kind === k.value}
              onClick={() => refilter(() => setKind(k.value))}
              className={chip(kind === k.value)}
            >
              {k.label}
            </button>
          ))}
        </fieldset>
        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-muted-light">
          <span>Loại giao dịch</span>
          <select
            value={entryType}
            onChange={(e) => refilter(() => setEntryType(e.target.value as CoinEntryType | ''))}
            className="bg-slate-100 dark:bg-[#161922] border border-slate-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-foreground"
          >
            <option value="">Tất cả</option>
            {COIN_ENTRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {COIN_ENTRY_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!loading && loaded?.error && (
        <p role="alert" className="text-sm text-rose-600">
          {loaded.error}
        </p>
      )}
      {loading ? <p className="text-sm text-slate-500">Đang tải…</p> : <TransactionList lines={loaded?.page?.data ?? []} />}

      {meta && totalPages > 1 && (
        <nav aria-label="Phân trang" className="flex items-center justify-center gap-3 text-xs">
          <button type="button" className={chip(false)} disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ← Trước
          </button>
          <span>
            Trang {meta.currentPage}/{totalPages}
          </span>
          <button type="button" className={chip(false)} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Sau →
          </button>
        </nav>
      )}
    </div>
  );
}
