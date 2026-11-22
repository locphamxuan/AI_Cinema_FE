'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { rewardPrizeService } from '@/services/rewardPrizeService';
import type { RewardPrize, RewardPrizeType } from '@/types/billing';

/** The BE limits: plan days 1–30, weight 1–10 000 (chance = weight / sum of the active weights). */
const MAX_PLAN_DAYS = 30;
const MAX_WEIGHT = 10_000;

const isIntIn = (n: number, min: number, max = Number.MAX_SAFE_INTEGER) => Number.isInteger(n) && n >= min && n <= max;

/**
 * Adds a prize to the wheel, or edits one (BR-09). The type of a saved prize stays: the amount
 * edited is the one its type pays. Switched-off prizes come back with "Bật lại trên vòng quay".
 */
export function RewardPrizeModal({
  prize,
  takenCodes,
  onClose,
  onDone,
}: {
  prize: RewardPrize | null;
  takenCodes: Set<string>;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    code: '',
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
  const code = form.code.trim();
  const codeTaken = !prize && takenCodes.has(code.toLowerCase());
  const amountOk = plan ? isIntIn(amount, 1, MAX_PLAN_DAYS) : isIntIn(amount, 1);
  const valid =
    form.name.trim() && amountOk && isIntIn(weight, 1, MAX_WEIGHT) && (prize ? true : code.length >= 3 && !codeTaken);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountField = plan ? { planDays: amount } : { bonusCoins: amount };
    const done = prize
      ? await run(
          () => rewardPrizeService.updatePrize(prize.id, { name: form.name.trim(), weight, isActive: form.isActive, ...amountField }),
          'Đã lưu giải',
        )
      : await run(
          () => rewardPrizeService.createPrize({ code, name: form.name.trim(), type: form.type, weight, ...amountField }),
          'Đã thêm giải vào vòng quay',
        );
    if (done) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={prize ? `Sửa giải thưởng: ${prize.name}` : 'Thêm giải vào vòng quay'}>
      <form onSubmit={submit} className="space-y-4 pt-1">
        {!prize && (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mã giải (không đổi sau khi tạo)">
              <input
                value={form.code}
                onChange={(e) => set({ code: e.target.value })}
                maxLength={50}
                required
                className={fieldInputClass}
                placeholder="bonus_50, plan_30…"
              />
              {codeTaken && <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">Mã này đã có trên vòng quay.</p>}
            </FormField>
            <FormField label="Loại giải">
              <select value={form.type} onChange={(e) => set({ type: e.target.value as RewardPrizeType, amount: '' })} className={fieldInputClass}>
                <option value="BONUS_COIN">Coin thưởng</option>
                <option value="PLAN_DAYS">Ngày gói Tháng</option>
              </select>
            </FormField>
          </div>
        )}

        <FormField label="Tên hiển thị">
          <input
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            maxLength={255}
            required
            className={fieldInputClass}
            placeholder="Ví dụ: Ô 50 Coin…"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label={plan ? `Số ngày gói Tháng (1–${MAX_PLAN_DAYS})` : 'Số Coin thưởng'}>
            <input
              type="number"
              min={1}
              max={plan ? MAX_PLAN_DAYS : undefined}
              step={1}
              value={form.amount}
              onChange={(e) => set({ amount: e.target.value })}
              required
              className={fieldInputClass}
            />
          </FormField>
          <FormField label={`Trọng số (1–${MAX_WEIGHT.toLocaleString('vi-VN')})`}>
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
        </div>
        <p className="text-[11px] text-muted-foreground">
          Tỉ lệ trúng = trọng số của giải / tổng trọng số các giải đang bật. Member xem được tỉ lệ này trên vòng quay của app.
        </p>

        {prize && (
          <label className="flex items-center gap-2 text-xs font-medium text-secondary-foreground cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set({ isActive: e.target.checked })} className="w-4 h-4 accent-sky-600 rounded" />
            {prize.isActive ? 'Đang có trên vòng quay (bỏ chọn để tắt)' : 'Bật lại trên vòng quay'}
          </label>
        )}

        <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl px-4 text-xs font-semibold">
            Huỷ
          </Button>
          <Button type="submit" disabled={!valid || busy} className="rounded-xl px-5 text-xs font-bold">
            {busy ? 'Đang lưu…' : prize ? 'Lưu thay đổi' : 'Thêm giải'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
