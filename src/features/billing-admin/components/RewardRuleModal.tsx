'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/features/production/hooks/useAction';
import { billingAdminService } from '@/services/billingAdminService';
import type { RewardRule } from '@/types/billing';

/** The BE ladder runs seven streak days, then starts again at day 1. */
export const LADDER_LENGTH = 7;

/** Creates a ladder day, or edits one; a new rung takes the first free day. */
export function RewardRuleModal({
  rule,
  takenDays,
  onClose,
  onDone,
}: {
  rule: RewardRule | null;
  takenDays: Set<number>;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const firstFree = Array.from({ length: LADDER_LENGTH }, (_, i) => i + 1).find((d) => !takenDays.has(d)) ?? 1;
  const [form, setForm] = useState({
    code: '',
    name: rule?.name ?? '',
    streakDay: String(rule?.streakDay ?? firstFree),
    bonusCoins: String(rule?.bonusCoins ?? ''),
    isActive: rule?.isActive ?? true,
  });
  const { busy, run } = useAction();
  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });
  const day = Number(form.streakDay);
  const coins = Number(form.bonusCoins);
  // One active rung per day: the BE refuses a second one.
  const dayTaken = form.isActive && takenDays.has(day) && day !== rule?.streakDay;
  const valid = form.name.trim() && Number.isInteger(coins) && coins >= 1 && !dayTaken && (rule || form.code.trim().length >= 3);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = { name: form.name.trim(), streakDay: day, bonusCoins: coins, grantsSpin: day === LADDER_LENGTH };
    const done = rule
      ? await run(() => billingAdminService.updateRewardRule(rule.id, { ...input, isActive: form.isActive }), 'Đã lưu ngày điểm danh')
      : await run(() => billingAdminService.createRewardRule({ ...input, code: form.code.trim() }), 'Đã thêm ngày điểm danh');
    if (done) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={rule ? `Sửa ngày ${rule.streakDay}` : 'Thêm ngày điểm danh'}>
      <form onSubmit={submit} className="space-y-4">
        {!rule && (
          <FormField label="Mã định danh (không đổi sau khi tạo)">
            <input
              value={form.code}
              onChange={(e) => set({ code: e.target.value })}
              maxLength={50}
              placeholder="day_1, day_2..."
              required
              className={fieldInputClass}
            />
          </FormField>
        )}
        <FormField label="Tên mốc điểm danh">
          <input
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            maxLength={255}
            placeholder="Ví dụ: Ngày thứ 1 trong chuỗi"
            required
            className={fieldInputClass}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Ngày trong chuỗi">
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
          <FormField label="Số Coin thưởng">
            <input
              type="number"
              min={1}
              step={1}
              value={form.bonusCoins}
              onChange={(e) => set({ bonusCoins: e.target.value })}
              placeholder="Số Coin tặng..."
              required
              className={fieldInputClass}
            />
          </FormField>
        </div>
        {dayTaken && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            Ngày {day} đã có cấu hình đang dùng; hãy sửa hoặc tắt nó trước.
          </p>
        )}
        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 text-xs text-sky-800 dark:text-sky-300 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <span>
            {day === LADDER_LENGTH
              ? 'Ngày 7 là mốc chặng cuối chuỗi: hệ thống sẽ tự động tặng thêm 1 lượt quay may mắn.'
              : 'Lượt quay chỉ được tặng khi khán giả điểm danh đủ chuỗi 7 ngày liên tục.'}
          </span>
        </div>
        {rule && !rule.isActive && (
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set({ isActive: e.target.checked })}
              className="w-4 h-4 accent-sky-600 rounded"
            />
            Kích hoạt lại ngày này
          </label>
        )}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl px-4 py-2 text-xs">
            Hủy
          </Button>
          <Button type="submit" disabled={!valid || busy} className="rounded-xl px-5 py-2 text-xs font-bold">
            {busy ? 'Đang lưu…' : 'Lưu cấu hình'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
