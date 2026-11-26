'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { toast } from '@/components/ui/Toast';
import { useAction } from '@/hooks/useAction';
import { COIN_ENTRY_LABEL } from '@/lib/coinEntry';
import { formatDateTime, formatNumber } from '@/lib/format';
import { billingAdminService } from '@/services/billingAdminService';
import type { CoinEntryType, LedgerLine, PaymentRefund } from '@/types/billing';

/** The payments an Admin can refund: an episode unlock or a plan payment. */
const REFUNDABLE: ReadonlySet<CoinEntryType> = new Set(['EPISODE_PURCHASE', 'PLAN_PAYMENT', 'PLAN_RENEWAL']);

/** A payment is refunded from its first row; the bonus rows of the same payment point at that row. */
export const isRefundablePayment = (line: LedgerLine) =>
  REFUNDABLE.has(line.entryType) && (!line.paymentId || line.paymentId === line.id);

/** What the toast says the refund took back, in plain words. */
export function refundSummary(refund: PaymentRefund): string {
  const coins = `${formatNumber(refund.mainCoins)} Coin chính và ${formatNumber(refund.bonusCoins)} Coin thưởng đã về lại ví.`;
  if (refund.episodeAccessId) return `${coins} Member không còn quyền xem tập đã mua.`;
  if (refund.subscriptionCycleId) {
    return refund.subscriptionEnded
      ? `${coins} Kỳ gói được ghi Đã hoàn Coin và gói đang chạy đã kết thúc.`
      : `${coins} Kỳ gói được ghi Đã hoàn Coin.`;
  }
  return coins;
}

/** Refunds the whole Coin payment of a ledger row, after a confirm that says what is taken back. */
export function RefundPaymentButton({ line, onRefunded }: { line: LedgerLine; onRefunded: () => Promise<void> }) {
  const [asking, setAsking] = useState(false);
  const { busy, run } = useAction({ onStale: onRefunded });
  const isEpisode = line.entryType === 'EPISODE_PURCHASE';

  const confirm = async () => {
    const refund = await run(() => billingAdminService.refundPayment(line.id));
    setAsking(false);
    if (!refund) return;
    toast.success('Đã hoàn toàn bộ khoản thanh toán', refundSummary(refund));
    await onRefunded();
  };

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setAsking(true)}>
        Hoàn Coin
      </Button>
      <ConfirmModal
        open={asking}
        tone="warning"
        title="Hoàn toàn bộ khoản thanh toán?"
        description="Mọi Coin của khoản thanh toán này được trả lại một lần: Coin chính về Coin chính, Coin thưởng về Coin thưởng."
        details={[
          ['Tài khoản', `${line.account.fullName} · ${line.account.email}`],
          ['Loại', COIN_ENTRY_LABEL[line.entryType]],
          ['Thời gian', formatDateTime(line.createdAt)],
        ]}
        consequence={
          isEpisode
            ? 'Member mất quyền xem tập đã mua bằng khoản này. Mỗi khoản chỉ hoàn được một lần.'
            : 'Kỳ gói được ghi Đã hoàn Coin; nếu gói đang chạy bằng kỳ này thì gói kết thúc ngay. Mỗi khoản chỉ hoàn được một lần.'
        }
        confirmLabel="Hoàn toàn bộ"
        busy={busy}
        onClose={() => setAsking(false)}
        onConfirm={confirm}
      />
    </>
  );
}
