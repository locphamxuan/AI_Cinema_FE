'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { rewardPrizeService } from '@/services/rewardPrizeService';
import type { RewardPrize, RewardPrizeType } from '@/types/billing';
import { MAX_PLAN_DAYS, MAX_REWARD_BONUS_COINS, MAX_WEIGHT, chanceWith, formatPercent } from './rewardOdds';

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
 * Adds a prize to the wheel, or edits one (BR-09). The type of a saved prize stays: the amount
 * edited is the one its type pays. While the Admin types the "tỉ lệ trúng" points, the modal shows
 * the percentage they give next to the other prizes that are on.
 */
export function RewardPrizeModal({
  prize,
  prizes,
  onClose,
  onDone,
}: {
  prize: RewardPrize | null;
  /** Every prize of the wheel, to work out the live percentage. */
  prizes: RewardPrize[];
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: prize?.name ?? '',
    type: (prize?.type ?? 'BONUS_COIN') as RewardPrizeType,
    amount: String((prize?.type === 'PLAN_DAYS' ? prize.planDays : prize?.bonusCoins) ?? ''),
    weight: String(prize?.weight ?? ''),
    isActive: prize?.isActive ?? true,
  });
  const { busy, run } = useAction();
  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });

  const plan = form.type === 'PLAN_DAYS';
  const amount = Number(form.amount);
  const weight = Number(form.weight);
  const amountOk = plan ? isIntIn(amount, 1, MAX_PLAN_DAYS) : isIntIn(amount, 1, MAX_REWARD_BONUS_COINS);
  const weightOk = isIntIn(weight, 1, MAX_WEIGHT);
  const defaultName = amountOk ? (plan ? `${amount} ngày gói Tháng` : `${amount} Coin thưởng`) : '';
  const name = form.name.trim() || defaultName;
  const valid = Boolean(name) && amountOk && weightOk;
  const chance = weightOk ? chanceWith(weight, prizes, prize?.id) : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountField = plan ? { planDays: amount } : { bonusCoins: amount };
    const done = prize
      ? await run(() => rewardPrizeService.updatePrize(prize.id, { name, weight, isActive: form.isActive, ...amountField }), 'Đã lưu giải')
      : await run(
          () =>
            rewardPrizeService.createPrize({ code: suggestPrizeCode(form.type, amount, prizes), name, type: form.type, weight, ...amountField }),
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
          label="Tỉ lệ trúng"
          hint={`Nhập số từ 1 đến ${MAX_WEIGHT.toLocaleString('vi-VN')}. Số càng lớn so với các giải khác thì giải càng dễ trúng.`}
          required
        >
          <input
            type="number"
            min={1}
            max={MAX_WEIGHT}
            step={1}
            value={form.weight}
            onChange={(e) => set({ weight: e.target.value })}
            required
            className={fieldInputClass}
          />
        </FormField>

        <div className="rounded-xl border border-border bg-muted/50 p-3" aria-live="polite">
          {weightOk ? (
            <>
              <p className="text-sm text-foreground">
                {form.isActive ? 'Giải này sẽ trúng khoảng ' : 'Khi bật lại, giải này sẽ trúng khoảng '}
                <strong className="tabular-nums">{formatPercent(chance)}</strong> số lượt quay.
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, chance)}%` }} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Nhập tỉ lệ trúng để xem phần trăm.</p>
          )}
        </div>

        {prize && (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
            <input
              type="checkbox"
              role="switch"
              checked={form.isActive}
              onChange={(e) => set({ isActive: e.target.checked })}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              <span className="block text-sm font-semibold text-foreground">Bật giải trên vòng quay</span>
              <span className="block text-xs text-muted-foreground">
                {form.isActive ? 'Đang bật: Member có thể trúng giải này.' : 'Đang tắt: giải vẫn nằm trong danh sách nhưng không ai trúng.'}
              </span>
            </span>
          </label>
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
