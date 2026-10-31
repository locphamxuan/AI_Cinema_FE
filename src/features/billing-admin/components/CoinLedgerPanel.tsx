'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { COIN_ENTRY_LABEL, COIN_ENTRY_TYPES, signed, describeLine } from '@/lib/coinEntry';
import { PERMISSION } from '@/lib/permissions';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { formatDateTime, formatDay, formatNumber } from '@/lib/format';
import { Empty, ErrorNote, Loading, Panel } from '@/components/data/ui';
import { billingAdminService } from '@/services/billingAdminService';
import type { CoinEntryType } from '@/types/billing';
import { MetaPager } from '@/components/data/MetaPager';

const LOT_SOURCE_LABEL: Record<string, string> = { ...COIN_ENTRY_LABEL, TOP_UP_PROMO: 'Khuyến mãi nạp' };

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
      description="Sổ cái chỉ ghi thêm: mỗi dòng là một lần Coin vào hoặc ra ví, kèm số dư ngay sau đó."
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
            <thead className="text-slate-500 dark:text-slate-400 text-left">
              <tr>
                <th className="py-2 font-medium">Thời gian</th>
                <th className="py-2 font-medium">Loại</th>
                <th className="py-2 font-medium hidden md:table-cell">Mô tả</th>
                <th className="py-2 font-medium text-right">Coin chính</th>
                <th className="py-2 font-medium text-right">Coin thưởng</th>
                <th className="py-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {ledger.data.data.map((line) => (
                <tr key={line.id}>
                  <td className="py-2 whitespace-nowrap">{formatDateTime(line.createdAt)}</td>
                  <td className="py-2">{COIN_ENTRY_LABEL[line.entryType]}</td>
                  <td className="py-2 hidden md:table-cell text-slate-600 dark:text-slate-300">{describeLine(line.description) ?? '-'}</td>
                  <td className="py-2 text-right tabular-nums">{signed(line.mainAmount)}</td>
                  <td className="py-2 text-right tabular-nums">{signed(line.bonusAmount)}</td>
                  <td className="py-2 text-right">
                    {canWallet && (
                      <Button size="sm" variant="ghost" aria-label="Xem ví của tài khoản này" onClick={() => setWalletOf(line.userId)}>
                        <Wallet className="w-3.5 h-3.5" />
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

function WalletModal({
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
    <Modal open onClose={onClose} title="Ví Coin" subtitle={`Tài khoản ${userId}`} maxWidth="max-w-xl">
      {wallet.error && <ErrorNote message={wallet.error} onRetry={wallet.reload} />}
      {wallet.loading && !w && <Loading />}
      {w && !adjusting && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 dark:border-white/10 p-3">
              <p className="text-slate-500">Coin chính</p>
              <p className="text-lg font-bold tabular-nums">{formatNumber(w.mainBalance)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-white/10 p-3">
              <p className="text-slate-500">Coin thưởng</p>
              <p className="text-lg font-bold tabular-nums">{formatNumber(w.bonusBalance)}</p>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-1">Lô Coin thưởng còn dùng được</p>
            {w.lots.length === 0 ? (
              <p className="text-slate-500">Không còn lô nào.</p>
            ) : (
              <ul className="space-y-1">
                {w.lots.map((lot) => (
                  <li key={lot.id} className="flex justify-between">
                    <span>
                      {LOT_SOURCE_LABEL[lot.source] ?? lot.source}: còn {lot.remainingAmount}/{lot.originalAmount}
                    </span>
                    <span className="text-slate-500">hết hạn {formatDay(lot.expiresAt)}</span>
                  </li>
                ))}
              </ul>
            )}
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
        <AdjustForm
          userId={userId}
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

function AdjustForm({ userId, onCancel, onDone }: { userId: string; onCancel: () => void; onDone: () => Promise<void> }) {
  const [main, setMain] = useState('');
  const [bonus, setBonus] = useState('');
  const [reason, setReason] = useState('');
  const { busy, run } = useAction();
  const mainAmount = Number(main || 0);
  const bonusAmount = Number(bonus || 0);
  const valid =
    Number.isInteger(mainAmount) && Number.isInteger(bonusAmount) && (mainAmount !== 0 || bonusAmount !== 0) && reason.trim().length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        billingAdminService.adjustWallet({
          userId,
          ...(mainAmount ? { mainAmount } : {}),
          ...(bonusAmount ? { bonusAmount } : {}),
          reason: reason.trim(),
        }),
      'Đã điều chỉnh ví',
    );
    if (done) await onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-xs text-slate-500">Số dương cộng thêm, số âm trừ bớt. Mỗi lần điều chỉnh ghi một dòng sổ cái và nhật ký kiểm toán.</p>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Coin chính">
          <input type="number" step={1} value={main} onChange={(e) => setMain(e.target.value)} className={fieldInputClass} />
        </FormField>
        <FormField label="Coin thưởng">
          <input type="number" step={1} value={bonus} onChange={(e) => setBonus(e.target.value)} className={fieldInputClass} />
        </FormField>
      </div>
      <FormField label="Lý do (bắt buộc)">
        <textarea rows={3} value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} className={fieldTextareaClass} />
      </FormField>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" disabled={!valid || busy}>
          Ghi điều chỉnh
        </Button>
      </div>
    </form>
  );
}
