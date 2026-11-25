'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { COIN_ENTRY_LABEL, COIN_ENTRY_TYPES, signed, describeLine } from '@/lib/coinEntry';
import { PERMISSION } from '@/lib/permissions';
import { useResource } from '@/hooks/useResource';
import { formatDateTime, formatNumber } from '@/lib/format';
import { Empty, ErrorNote, Loading, Panel } from '@/components/data/ui';
import { billingAdminService } from '@/services/billingAdminService';
import type { CoinEntryType } from '@/types/billing';
import { MetaPager } from '@/components/data/MetaPager';
import { RefundPaymentButton, isRefundablePayment } from './RefundPaymentButton';
import { WalletAdjustForm } from './WalletAdjustForm';

/** MF-2: the Coin ledger of every wallet. Reading a wallet and correcting it by hand need their own permissions. */
export function CoinLedgerPanel() {
  const can = useCan();
  const canWallet = can(PERMISSION.COIN_WALLET_READ);
  const canAdjust = can(PERMISSION.COIN_ADJUST);
  const [entryType, setEntryType] = useState<CoinEntryType | ''>('');
  const [page, setPage] = useState(1);
  const ledger = useResource(`admin:ledger:${entryType}:${page}`, () =>
    billingAdminService.ledger({ page, entryType: entryType || undefined }),
  );
  const [walletOf, setWalletOf] = useState<string | null>(null);

  return (
    <Panel
      title="Giao dịch Coin"
      description="Lịch sử giao dịch Coin (không sửa, không xoá): mỗi dòng là một lần Coin vào hoặc ra ví, kèm số dư ngay sau đó. Hoàn Coin trả lại cả khoản thanh toán và thu hồi tập hoặc kỳ gói đã mua."
      actions={
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
      }
    >
      {ledger.error && <ErrorNote message={ledger.error} onRetry={ledger.reload} />}
      {ledger.loading && !ledger.data && <Loading />}
      {ledger.data?.data.length === 0 && <Empty>Chưa có giao dịch nào.</Empty>}
      {ledger.data && ledger.data.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs table-cells">
            <thead className="text-muted-foreground text-left">
              <tr>
                <th className="py-2 font-medium">Thời gian</th>
                <th className="py-2 font-medium">Loại</th>
                <th className="py-2 font-medium hidden md:table-cell">Mô tả</th>
                <th className="py-2 font-medium text-right">Coin chính</th>
                <th className="py-2 font-medium text-right">Coin thưởng</th>
                <th className="py-2 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {ledger.data.data.map((line) => (
                <tr key={line.id}>
                  <td className="py-2 whitespace-nowrap">{formatDateTime(line.createdAt)}</td>
                  <td className="py-2">{COIN_ENTRY_LABEL[line.entryType]}</td>
                  <td className="py-2 hidden md:table-cell text-muted-foreground">{describeLine(line.description) ?? '-'}</td>
                  <td className="py-2 text-right tabular-nums">{signed(line.mainAmount)}</td>
                  <td className="py-2 text-right tabular-nums">{signed(line.bonusAmount)}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    {canAdjust && isRefundablePayment(line) && <RefundPaymentButton line={line} onRefunded={ledger.reload} />}
                    {canWallet && (
                      <Button size="sm" variant="ghost" aria-label="Xem ví của tài khoản này" onClick={() => setWalletOf(line.userId)}>
                        <Wallet className="w-3.5 h-3.5" aria-hidden="true" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <MetaPager meta={ledger.data.meta} onPage={setPage} />
        </div>
      )}
      {walletOf && <WalletModal userId={walletOf} canAdjust={canAdjust} onClose={() => setWalletOf(null)} onAdjusted={ledger.reload} />}
    </Panel>
  );
}

export function WalletModal({
  userId,
  canAdjust,
  onClose,
  onAdjusted,
}: {
  userId: string;
  canAdjust: boolean;
  onClose: () => void;
  onAdjusted: () => Promise<void>;
}) {
  const wallet = useResource(`admin:wallet:${userId}`, () => billingAdminService.wallet(userId));
  const [adjusting, setAdjusting] = useState(false);
  const w = wallet.data;

  return (
    <Modal open onClose={onClose} title="Ví Coin" subtitle="Ví Coin" maxWidth="max-w-xl">
      {wallet.error && <ErrorNote message={wallet.error} onRetry={wallet.reload} />}
      {wallet.loading && !w && <Loading />}
      {w && !adjusting && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-muted-foreground">Coin chính</p>
              <p className="text-lg font-bold tabular-nums">{formatNumber(w.mainBalance)}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-muted-foreground">Coin thưởng</p>
              <p className="text-lg font-bold tabular-nums">{formatNumber(w.bonusBalance)}</p>
            </div>
          </div>
          {canAdjust && (
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setAdjusting(true)}>
                Điều chỉnh số dư
              </Button>
            </div>
          )}
        </div>
      )}
      {w && adjusting && (
        <WalletAdjustForm
          wallet={w}
          onCancel={() => setAdjusting(false)}
          onDone={async () => {
            setAdjusting(false);
            await Promise.all([wallet.reload(), onAdjusted()]);
          }}
        />
      )}
    </Modal>
  );
}
