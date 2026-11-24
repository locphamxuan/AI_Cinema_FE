'use client';

import { useState } from 'react';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { useAction } from '@/hooks/useAction';
import { formatNumber } from '@/lib/format';
import { randomId } from '@/lib/random';
import { billingAdminService } from '@/services/billingAdminService';
import type { AdminWallet } from '@/types/billing';

/** The largest correction the API takes in either direction (WalletAdjustmentRequestDto). */
export const MAX_ADJUST_COINS = 1_000_000_000;

/** What stops a correction before it reaches the API (coin-adjust.service.ts), or null when it can be sent. */
export function adjustmentProblem(main: number, bonus: number, wallet: Pick<AdminWallet, 'mainBalance' | 'bonusBalance'>) {
  if (!Number.isInteger(main) || !Number.isInteger(bonus)) return 'Số Coin phải là số nguyên.';
  if (Math.abs(main) > MAX_ADJUST_COINS || Math.abs(bonus) > MAX_ADJUST_COINS) {
    return `Mỗi lần chỉ điều chỉnh tối đa ${formatNumber(MAX_ADJUST_COINS)} Coin mỗi loại.`;
  }
  if (main === 0 && bonus === 0) return 'Nhập số Coin chính hoặc Coin thưởng cần điều chỉnh.';
  if (bonus < 0 && main !== 0) return 'Khi trừ Coin thưởng, hãy để Coin chính bằng 0 và điều chỉnh Coin chính ở một lần khác.';
  if (wallet.mainBalance + main < 0) return `Ví chỉ còn ${formatNumber(wallet.mainBalance)} Coin chính, không trừ quá số này.`;
  if (wallet.bonusBalance + bonus < 0) return `Ví chỉ còn ${formatNumber(wallet.bonusBalance)} Coin thưởng, không trừ quá số này.`;
  return null;
}

const signedCoins = (n: number) => (n > 0 ? `+${formatNumber(n)}` : formatNumber(n));

/**
 * The Admin's manual wallet correction: checked as the API checks it, confirmed with the balances before and after,
 * and sent once with an Idempotency-Key kept for the whole form so a retry never credits twice.
 */
export function WalletAdjustForm({ wallet, onCancel, onDone }: { wallet: AdminWallet; onCancel: () => void; onDone: () => Promise<void> }) {
  const [main, setMain] = useState('');
  const [bonus, setBonus] = useState('');
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [idempotencyKey] = useState(() => randomId('adjust-'));
  const { busy, run } = useAction();
  const mainAmount = Number(main || 0);
  const bonusAmount = Number(bonus || 0);
  const problem = main || bonus ? adjustmentProblem(mainAmount, bonusAmount, wallet) : null;
  const valid = !problem && (mainAmount !== 0 || bonusAmount !== 0) && reason.trim().length > 0;

  const submit = async () => {
    const done = await run(
      () =>
        billingAdminService.adjustWallet(
          {
            userId: wallet.userId,
            ...(mainAmount ? { mainAmount } : {}),
            ...(bonusAmount ? { bonusAmount } : {}),
            reason: reason.trim(),
          },
          idempotencyKey,
        ),
      'Đã điều chỉnh ví',
    );
    setConfirming(false);
    if (done) await onDone();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) setConfirming(true);
      }}
      className="space-y-3"
    >
      <p className="text-xs text-muted-foreground">Số dương cộng thêm, số âm trừ bớt. Mỗi lần điều chỉnh được ghi vào lịch sử giao dịch Coin và nhật ký thao tác.</p>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Coin chính">
          <input type="number" step={1} value={main} onChange={(e) => setMain(e.target.value)} className={fieldInputClass} />
        </FormField>
        <FormField label="Coin thưởng">
          <input type="number" step={1} value={bonus} onChange={(e) => setBonus(e.target.value)} className={fieldInputClass} />
        </FormField>
      </div>
      {problem && (
        <p role="alert" className="text-xs text-destructive">
          {problem}
        </p>
      )}
      <FormField label="Lý do" required>
        <textarea rows={3} value={reason} maxLength={500} required onChange={(e) => setReason(e.target.value)} className={fieldTextareaClass} />
      </FormField>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" disabled={!valid || busy}>
          Ghi điều chỉnh
        </Button>
      </div>
      <ConfirmModal
        open={confirming}
        tone="warning"
        title="Xác nhận điều chỉnh ví"
        description="Số dư của thành viên thay đổi ngay và không sửa lại được; muốn hoàn tác phải ghi một lần điều chỉnh ngược."
        details={[
          ['Coin chính', `${formatNumber(wallet.mainBalance)} → ${formatNumber(wallet.mainBalance + mainAmount)} (${signedCoins(mainAmount)})`],
          ['Coin thưởng', `${formatNumber(wallet.bonusBalance)} → ${formatNumber(wallet.bonusBalance + bonusAmount)} (${signedCoins(bonusAmount)})`],
          ['Lý do', reason.trim()],
        ]}
        confirmLabel="Điều chỉnh ví"
        busy={busy}
        onClose={() => setConfirming(false)}
        onConfirm={submit}
      />
    </form>
  );
}
