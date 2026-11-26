'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { useCan } from '@/hooks/useCan';
import { COIN_ENTRY_LABEL, COIN_ENTRY_TYPES, signed, describeLine } from '@/lib/coinEntry';
import { PERMISSION } from '@/lib/permissions';
import { useResource } from '@/hooks/useResource';
import { formatDateTime } from '@/lib/format';
import { Empty, ErrorNote, Loading, Panel } from '@/components/data/ui';
import { billingAdminService } from '@/services/billingAdminService';
import type { CoinEntryType, LedgerLine } from '@/types/billing';
import { MetaPager } from '@/components/data/MetaPager';
import { RefundPaymentButton, isRefundablePayment } from './RefundPaymentButton';
import { WalletModal } from './WalletModal';

/** How long the search box waits after the last key before asking the API. */
const SEARCH_DELAY_MS = 300;

/** MF-2: the Coin ledger of every wallet, each row naming its account. The Admin reads it and refunds payments. */
export function CoinLedgerPanel() {
  const can = useCan();
  const canWallet = can(PERMISSION.COIN_WALLET_READ);
  const canRefund = can(PERMISSION.COIN_REFUND);
  const [entryType, setEntryType] = useState<CoinEntryType | ''>('');
  const [search, setSearch] = useState('');
  const [account, setAccount] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timer = setTimeout(() => {
      setAccount(search.trim());
      setPage(1);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search]);
  const ledger = useResource(`admin:ledger:${entryType}:${account}:${page}`, () =>
    billingAdminService.ledger({ page, entryType: entryType || undefined, account: account || undefined }),
  );
  const [walletOf, setWalletOf] = useState<LedgerLine | null>(null);

  return (
    <Panel
      title="Giao dịch Coin"
      description="Mỗi dòng là một lần Coin vào hoặc ra ví của một tài khoản. Lịch sử không sửa, không xoá được."
      actions={
        <>
          <label className="relative">
            <span className="sr-only">Tìm theo tên hoặc email tài khoản</span>
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên hoặc email…"
              className={`${fieldInputClass} w-52 py-1 pl-8 text-xs`}
            />
          </label>
          <select
            aria-label="Lọc theo loại giao dịch"
            value={entryType}
            onChange={(e) => {
              setEntryType(e.target.value as CoinEntryType | '');
              setPage(1);
            }}
            className={`${fieldInputClass} py-1 text-xs w-44`}
          >
            <option value="">Mọi loại giao dịch</option>
            {COIN_ENTRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {COIN_ENTRY_LABEL[t]}
              </option>
            ))}
          </select>
        </>
      }
    >
      {ledger.error && <ErrorNote message={ledger.error} onRetry={ledger.reload} />}
      {ledger.loading && !ledger.data && <Loading />}
      {ledger.data?.data.length === 0 && <Empty>{account ? 'Không có giao dịch nào của tài khoản này.' : 'Chưa có giao dịch nào.'}</Empty>}
      {ledger.data && ledger.data.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs table-cells">
            <thead className="text-muted-foreground text-left">
              <tr>
                <th className="py-2 font-medium">Thời gian</th>
                <th className="py-2 font-medium">Tài khoản</th>
                <th className="py-2 font-medium">Loại</th>
                <th className="py-2 font-medium hidden md:table-cell">Mô tả</th>
                <th className="py-2 font-medium text-right">Coin chính</th>
                <th className="py-2 font-medium text-right">Coin thưởng</th>
                <th className="py-2">
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {ledger.data.data.map((line) => (
                <tr key={line.id}>
                  <td className="py-2 whitespace-nowrap">{formatDateTime(line.createdAt)}</td>
                  <td className="py-2">
                    <p className="font-medium">{line.account.fullName}</p>
                    <p className="text-muted-foreground">{line.account.email}</p>
                  </td>
                  <td className="py-2">{COIN_ENTRY_LABEL[line.entryType]}</td>
                  <td className="py-2 hidden md:table-cell text-muted-foreground">{describeLine(line.description) ?? '-'}</td>
                  <td className="py-2 text-right tabular-nums">{signed(line.mainAmount)}</td>
                  <td className="py-2 text-right tabular-nums">{signed(line.bonusAmount)}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    {canWallet && (
                      <Button size="sm" variant="ghost" aria-label={`Xem ví của ${line.account.fullName}`} onClick={() => setWalletOf(line)}>
                        Xem ví
                      </Button>
                    )}
                    {canRefund && isRefundablePayment(line) && <RefundPaymentButton line={line} onRefunded={ledger.reload} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <MetaPager meta={ledger.data.meta} onPage={setPage} />
        </div>
      )}
      {walletOf && <WalletModal userId={walletOf.userId} account={walletOf.account} onClose={() => setWalletOf(null)} />}
    </Panel>
  );
}
