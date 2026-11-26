'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { rewardPrizeService } from '@/services/rewardPrizeService';
import type { RewardPrize, RewardPrizeType } from '@/types/billing';
import { MAX_PLAN_DAYS, MAX_REWARD_BONUS_COINS, activeTotal, formatChance, parsePercent, percentInput, totalProblem } from './rewardOdds';

const isIntIn = (n: number, min: number, max = Number.MAX_SAFE_INTEGER) => Number.isInteger(n) && n >= min && n <= max;

/** The prize key the BE needs (unique, never shown to the Admin): `bonus_50`, then `bonus_50_2`… */
export function suggestPrizeCode(type: RewardPrizeType, amount: number, prizes: RewardPrize[]): string {
  const taken = new Set(prizes.map((p) => p.code.toLowerCase()));
  const base = `${type === 'PLAN_DAYS' ? 'plan' : 'bonus'}_${amount}`;
  let code = base;
  for (let i = 2; taken.has(code); i += 1) code = `${base}_${i}`;
  return code;
}

/**
 * Adds a prize to the wheel, or edits one (BR-09). The Admin types the chance in percent; the prizes switched on
 * must still add up to exactly 100 % after the save, so the modal shows the new total and refuses otherwise. A
 * new prize can be added switched off and switched on later with "Chia lại tỉ lệ".
 */
export function RewardPrizeModal({
  prize,
  prizes,
  onClose,
  onDone,
  onRebalance,
}: {
  prize: RewardPrize | null;
  /** Every prize of the wheel, to work out the new total. */
  prizes: RewardPrize[];
  onClose: () => void;
  onDone: () => Promise<void>;
  /** Opens "Chia lại tỉ lệ" instead, when one prize alone cannot keep the wheel at 100 %. */
  onRebalance: () => void;
}) {
  const [form, setForm] = useState({
    name: prize?.name ?? '',
    type: (prize?.type ?? 'BONUS_COIN') as RewardPrizeType,
    amount: String((prize?.type === 'PLAN_DAYS' ? prize.planDays : prize?.bonusCoins) ?? ''),
    chance: prize?.weight ? percentInput(prize.weight) : '',
    isActive: prize?.isActive ?? true,
  });
  const { busy, run } = useAction();
  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });

  const plan = form.type === 'PLAN_DAYS';
  const amount = Number(form.amount);
  const weight = parsePercent(form.chance);
  const amountOk = plan ? isIntIn(amount, 1, MAX_PLAN_DAYS) : isIntIn(amount, 1, MAX_REWARD_BONUS_COINS);
  const defaultName = amountOk ? (plan ? `${amount} ngày gói Tháng` : `${amount} Coin thưởng`) : '';
  const name = form.name.trim() || defaultName;

  // Only a change of the chances on the wheel is checked, as the API does: renaming a prize never is.
  const touchesWheel = !prize || form.isActive !== prize.isActive || (form.isActive && weight !== prize.weight);
  const others = prizes.filter((p) => p.id !== prize?.id);
  const total = activeTotal(others) + (form.isActive ? (weight ?? 0) : 0);
  const anyOn = form.isActive || others.some((p) => p.isActive);
  const problem = weight !== null && touchesWheel ? totalProblem(total, anyOn) : null;
  const valid = Boolean(name) && amountOk && weight !== null && !problem;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (weight === null) return;
    const amountField = plan ? { planDays: amount } : { bonusCoins: amount };
    const done = prize
      ? await run(() => rewardPrizeService.updatePrize(prize.id, { name, weight, isActive: form.isActive, ...amountField }), 'Đã lưu giải')
      : await run(
          () =>
            rewardPrizeService.createPrize({
              code: suggestPrizeCode(form.type, amount, prizes),
              name,
              type: form.type,
              weight,
              isActive: form.isActive,
              ...amountField,
            }),
          'Đã thêm giải vào vòng quay',
        );
    if (done) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={prize ? `Sửa giải: ${prize.name}` : 'Thêm giải vào vòng quay'}>
      <form onSubmit={submit} className="space-y-4 pt-1">
        {!prize && (
          <FormField label="Loại giải">
            <select value={form.type} onChange={(e) => set({ type: e.target.value as RewardPrizeType, amount: '' })} className={fieldInputClass}>
              <option value="BONUS_COIN">Coin thưởng</option>
              <option value="PLAN_DAYS">Ngày dùng gói Tháng</option>
            </select>
          </FormField>
        )}

        <FormField
          label={plan ? `Số ngày gói Tháng (1–${MAX_PLAN_DAYS})` : `Số Coin thưởng (1–${MAX_REWARD_BONUS_COINS.toLocaleString('vi-VN')})`}
          error={form.amount && !amountOk ? 'Nhập số nguyên trong khoảng cho phép.' : null}
          required
        >
          <input
            type="number"
            min={1}
            max={plan ? MAX_PLAN_DAYS : MAX_REWARD_BONUS_COINS}
            step={1}
            value={form.amount}
            onChange={(e) => set({ amount: e.target.value })}
            required
            className={fieldInputClass}
          />
        </FormField>

        <FormField label="Tên hiện trên vòng quay">
          <input
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            maxLength={255}
            className={fieldInputClass}
            placeholder={defaultName || 'Ví dụ: 50 Coin thưởng'}
          />
        </FormField>

        <FormField
          label="Tỉ lệ trúng (%)"
          hint="Từ 0,01 đến 100, tối đa 2 số lẻ."
          error={form.chance && weight === null ? 'Nhập số từ 0,01 đến 100, tối đa 2 số lẻ.' : null}
          required
        >
          <input inputMode="decimal" value={form.chance} onChange={(e) => set({ chance: e.target.value })} required className={fieldInputClass} />
        </FormField>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3">
          <input
            type="checkbox"
            role="switch"
            checked={form.isActive}
            onChange={(e) => set({ isActive: e.target.checked })}
            className="size-4 accent-primary"
          />
          <span className="text-sm font-semibold text-foreground">Bật giải trên vòng quay</span>
        </label>

        {weight !== null && touchesWheel && (
          <div className="rounded-xl border border-border bg-muted/50 p-3 text-sm" aria-live="polite">
            <p>
              Tổng các giải đang bật sau khi lưu: <strong className="tabular-nums">{formatChance(total)}</strong>
            </p>
            {problem && (
              <p role="alert" className="mt-1 text-destructive">
                Tổng phải đúng 100%, đang {problem}.{' '}
                <button type="button" onClick={onRebalance} className="font-semibold underline underline-offset-2">
                  Chia lại tỉ lệ
                </button>{' '}
                {prize ? 'để sửa nhiều giải cùng lúc.' : 'hoặc tắt giải này rồi lưu.'}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2.5 border-t border-border pt-3">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl px-4">
            Huỷ
          </Button>
          <Button type="submit" disabled={!valid || busy} className="rounded-xl px-5">
            {busy ? 'Đang lưu…' : prize ? 'Lưu thay đổi' : 'Thêm giải'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
