'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { walletService } from '@/services/walletService';
import TransactionList from '@/components/wallet/TransactionList';
import { COIN_ENTRY_LABEL, COIN_ENTRY_TYPES } from '@/lib/coinEntry';
import type { CoinEntryType, StatementKind, StatementLine } from '@/types/billing';
import type { Page } from '@/types/production';
import { DataPagination } from '@/components/data/DataPagination';
import { PageHeader } from '@/components/data/PageHeader';
import { StatCard } from '@/components/data/StatCard';
import { TrendChart, type TrendPoint } from '@/components/charts/TrendChart';
import { Card } from '@/components/shadcn/card';
import { fieldInputClass } from '@/components/ui/FormField';
import { Loading } from '@/features/production/components/shared/ui';

const KINDS: { value: StatementKind; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'MAIN', label: 'Coin chính' },
  { value: 'BONUS', label: 'Coin thưởng' },
];

const chip = (active: boolean) =>
  `rounded-md px-3.5 py-1.5 text-sm transition-colors cursor-pointer ${
    active ? 'bg-background font-medium text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
  }`;

interface Loaded {
  key: string;
  page?: Page<StatementLine>;
  error?: string;
}

/** Main plus bonus balance after each line on this page, oldest first. */
function balanceTrend(lines: StatementLine[]): TrendPoint[] {
  return [...lines].reverse().map((l) => ({
    label: new Date(l.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    value: l.mainBalanceAfter + l.bonusBalanceAfter,
  }));
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
    return <p className="py-20 text-center text-sm text-muted-foreground">Đăng nhập để xem lịch sử giao dịch.</p>;
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
      <PageHeader title="Lịch sử giao dịch" description="Mọi lần Coin vào và ra ví, ghi nhận từ sổ cái của hệ thống." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <StatCard featured label="Coin chính" value={wallet.mainCoin.toLocaleString('vi-VN')} unit="Coin" note="Nạp bằng tiền, dùng trước" />
          <StatCard label="Coin thưởng" value={wallet.bonusCoin.toLocaleString('vi-VN')} unit="Coin" note="Từ điểm danh và vòng quay" noteTone="brand" />
        </div>
        <Card className="gap-2 px-5 py-4 lg:col-span-2">
          <p className="text-sm font-medium">Tổng số dư sau mỗi giao dịch</p>
          <TrendChart points={balanceTrend(loaded?.page?.data ?? [])} name="Số dư" valueUnit="Coin" height={170} />
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <fieldset className="inline-flex w-fit flex-wrap gap-1 rounded-lg bg-muted p-1">
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
        <label className="flex items-center gap-2 text-sm text-muted-foreground sm:ml-auto">
          <span>Loại giao dịch</span>
          <select
            value={entryType}
            onChange={(e) => refilter(() => setEntryType(e.target.value as CoinEntryType | ''))}
            className={`${fieldInputClass} w-auto py-1.5`}
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
        <p role="alert" className="text-sm text-destructive">
          {loaded.error}
        </p>
      )}
      {loading ? <Loading /> : <TransactionList lines={loaded?.page?.data ?? []} />}

      {meta && (
        <DataPagination
          page={page}
          totalPages={totalPages}
          totalItems={meta.totalItems}
          pageSize={meta.itemsPerPage}
          unit="giao dịch"
          onChange={setPage}
        />
      )}
    </div>
  );
}
