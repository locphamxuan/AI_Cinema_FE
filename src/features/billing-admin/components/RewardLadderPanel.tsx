'use client';

import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { Empty, ErrorNote, Loading, Panel, StatusPill } from '@/features/production/components/shared/ui';
import { billingAdminService } from '@/services/billingAdminService';
import type { RewardRule } from '@/types/billing';

/** The BE ladder runs seven streak days, then starts again at day 1. */
export const LADDER_LENGTH = 7;

/** BR-05 / BR-09: what each streak day pays in bonus Coins, and which day also grants a spin. */
export function RewardLadderPanel() {
  const rules = useResource('admin:reward-rules', billingAdminService.listRewardRules);
  const [editing, setEditing] = useState<RewardRule | 'new' | null>(null);
  const takenDays = new Set(rules.data?.filter((r) => r.isActive).map((r) => r.streakDay));

  return (
    <Panel
      title="Điểm danh hằng ngày"
      description="Điểm danh chỉ trả Coin thưởng (có hạn dùng). Bỏ một ngày thì chuỗi quay về ngày 1; ngày mốc tặng thêm một lượt quay."
      actions={
        <Button size="sm" onClick={() => setEditing('new')} disabled={takenDays.size >= LADDER_LENGTH}>
          <Plus className="w-3.5 h-3.5" /> Thêm ngày
        </Button>
      }
    >
      {rules.error && <ErrorNote message={rules.error} onRetry={rules.reload} />}
      {rules.loading && !rules.data && <Loading />}
      {rules.data?.length === 0 && <Empty>Chưa cấu hình ngày nào — Member điểm danh sẽ không nhận gì.</Empty>}
      {rules.data && rules.data.length > 0 && (
        <table className="w-full text-xs">
          <thead className="text-slate-500 dark:text-slate-400 text-left">
            <tr>
              <th className="py-2 font-medium">Ngày</th>
              <th className="py-2 font-medium">Tên</th>
              <th className="py-2 font-medium text-right">Coin thưởng</th>
              <th className="py-2 font-medium">Lượt quay</th>
              <th className="py-2 font-medium">Trạng thái</th>
              <th className="py-2 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {rules.data.map((rule) => (
              <tr key={rule.id}>
                <td className="py-2 font-semibold">Ngày {rule.streakDay}</td>
                <td className="py-2">{rule.name}</td>
                <td className="py-2 text-right font-mono">+{rule.bonusCoins}</td>
                <td className="py-2">{rule.grantsSpin ? '🎯 Có' : '—'}</td>
                <td className="py-2">
                  <StatusPill label={rule.isActive ? 'Đang dùng' : 'Đã tắt'} tone={rule.isActive ? 'emerald' : 'neutral'} />
                </td>
                <td className="py-2 text-right">
                  <Button size="sm" variant="ghost" aria-label={`Sửa ngày ${rule.streakDay}`} onClick={() => setEditing(rule)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing && (
        <RuleModal rule={editing === 'new' ? null : editing} takenDays={takenDays} onClose={() => setEditing(null)} onDone={rules.reload} />
      )}
    </Panel>
  );
}

function RuleModal({
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
    grantsSpin: rule?.grantsSpin ?? false,
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
    const input = { name: form.name.trim(), streakDay: day, bonusCoins: coins, grantsSpin: form.grantsSpin };
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
      <form onSubmit={submit} className="space-y-3">
        {!rule && (
          <FormField label="Mã (không đổi được sau khi tạo)">
            <input value={form.code} onChange={(e) => set({ code: e.target.value })} maxLength={50} required className={fieldInputClass} />
          </FormField>
        )}
        <FormField label="Tên">
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Ngày trong chuỗi">
            <select value={form.streakDay} onChange={(e) => set({ streakDay: e.target.value })} className={fieldInputClass}>
              {Array.from({ length: LADDER_LENGTH }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Ngày {d}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Coin thưởng">
            <input type="number" min={1} step={1} value={form.bonusCoins} onChange={(e) => set({ bonusCoins: e.target.value })} required className={fieldInputClass} />
          </FormField>
        </div>
        {dayTaken && <p className="text-xs text-rose-600">Ngày {day} đã có cấu hình đang dùng; hãy sửa hoặc tắt nó trước.</p>}
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={form.grantsSpin} onChange={(e) => set({ grantsSpin: e.target.checked })} className="accent-purple-600" />
          Ngày mốc: tặng thêm 1 lượt quay thưởng
        </label>
        {rule && (
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set({ isActive: e.target.checked })} className="accent-purple-600" />
            Đang dùng
          </label>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={!valid || busy}>
            Lưu
          </Button>
        </div>
      </form>
    </Modal>
  );
}
