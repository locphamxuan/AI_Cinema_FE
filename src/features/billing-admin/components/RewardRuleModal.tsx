'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { billingAdminService } from '@/services/billingAdminService';
import type { RewardRule } from '@/types/billing';
import { MAX_REWARD_BONUS_COINS } from './rewardOdds';

/** The BE ladder runs seven streak days, then starts again at day 1. */
export const LADDER_LENGTH = 7;

/**
 * Creates a ladder day, or edits one; a new rung takes `initialDay` or the first free day. The
 * unique code the BE needs is made from the day (`day_3`, `day_3_2`…), never typed by the Admin.
 */
export function RewardRuleModal({
  rule,
  initialDay,
  takenDays,
  takenCodes = new Set<string>(),
  onClose,
  onDone,
}: {
  rule: RewardRule | null;
  /** The day a new rung starts on, e.g. the empty day card the Admin clicked. */
  initialDay?: number;
  takenDays: Set<number>;
  /** Codes already used by any rule, active or not: the BE keeps them unique. */
  takenCodes?: Set<string>;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const firstFree =
    initialDay ?? Array.from({ length: LADDER_LENGTH }, (_, i) => i + 1).find((d) => !takenDays.has(d)) ?? 1;
  const [form, setForm] = useState({
    name: rule?.name ?? '',
    streakDay: String(rule?.streakDay ?? firstFree),
    bonusCoins: String(rule?.bonusCoins ?? ''),
    isActive: rule?.isActive ?? true,
  });
  const { busy, run } = useAction();
  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });
  const day = Number(form.streakDay);
  const coins = Number(form.bonusCoins);
  // One active rung per day: the BE refuses a second one. A rule only "owns" its day while it is active,
  // so reactivating a switched-off rule whose day another rule now holds is refused too.
  const ownsDay = Boolean(rule?.isActive) && day === rule?.streakDay;
  const dayTaken = form.isActive && takenDays.has(day) && !ownsDay;
  const name = form.name.trim() || `Ngày ${day}`;
  const coinsOk = Number.isInteger(coins) && coins >= 1 && coins <= MAX_REWARD_BONUS_COINS;
  const valid = coinsOk && !dayTaken;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = { name, streakDay: day, bonusCoins: coins, grantsSpin: day === LADDER_LENGTH };
    const done = rule
      ? await run(() => billingAdminService.updateRewardRule(rule.id, { ...input, isActive: form.isActive }), 'Đã lưu ngày điểm danh')
      : await run(() => billingAdminService.createRewardRule({ ...input, code: suggestCode(day, takenCodes) }), 'Đã thêm ngày điểm danh');
    if (done) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={rule ? `Sửa thưởng Ngày ${rule.streakDay}` : 'Đặt thưởng cho một ngày'}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Ngày thứ mấy trong chuỗi">
            <select
              value={form.streakDay}
              onChange={(e) => set({ streakDay: e.target.value })}
              disabled={Boolean(rule?.isActive)}
              className={fieldInputClass}
            >
              {Array.from({ length: LADDER_LENGTH }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Ngày {d}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label="Số Coin thưởng"
            error={form.bonusCoins && !coinsOk ? `Nhập số nguyên từ 1 đến ${MAX_REWARD_BONUS_COINS.toLocaleString('vi-VN')}.` : null}
            required
          >
            <input
              type="number"
              min={1}
              max={MAX_REWARD_BONUS_COINS}
              step={1}
              value={form.bonusCoins}
              onChange={(e) => set({ bonusCoins: e.target.value })}
              placeholder="Ví dụ: 10"
              required
              className={fieldInputClass}
            />
          </FormField>
        </div>
        <FormField label="Tên hiển thị (không bắt buộc)">
          <input
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            maxLength={255}
            placeholder={`Ngày ${day}`}
            className={fieldInputClass}
          />
        </FormField>
        {dayTaken && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            Ngày {day} đã có thưởng đang dùng; hãy sửa hoặc tắt thưởng đó trước.
          </p>
        )}
        <div className="rounded-xl border border-border bg-muted/50 p-3 text-sm text-foreground">
          <span>
            {day === LADDER_LENGTH
              ? 'Ngày 7 là ngày cuối chuỗi: ngoài Coin thưởng, Member được tặng thêm 1 lượt quay.'
              : 'Ngày này chỉ tặng Coin thưởng. Lượt quay được tặng vào Ngày 7.'}
          </span>
        </div>
        {rule && (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
            <input
              type="checkbox"
              role="switch"
              checked={form.isActive}
              onChange={(e) => set({ isActive: e.target.checked })}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              <span className="block text-sm font-semibold text-foreground">Dùng thưởng này</span>
              <span className="block text-xs text-muted-foreground">
                {form.isActive ? 'Đang bật: Member điểm danh ngày này được nhận thưởng.' : 'Đang tắt: ngày này không có thưởng.'}
              </span>
            </span>
          </label>
        )}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl px-4 py-2 text-xs">
            Huỷ
          </Button>
          <Button type="submit" disabled={!valid || busy} className="rounded-xl px-5 py-2 text-xs font-bold">
            {busy ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** `day_N`, or `day_N_2`, `day_N_3`… when an older (switched-off) rule already holds that code. */
function suggestCode(day: number, taken: Set<string>): string {
  const base = `day_${day}`;
  let code = base;
  for (let i = 2; taken.has(code); i += 1) code = `${base}_${i}`;
  return code;
}
