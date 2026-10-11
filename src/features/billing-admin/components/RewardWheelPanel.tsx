'use client';

import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { Empty, ErrorNote, Loading, Panel, StatusPill } from '@/features/production/components/shared/ui';
import { rewardSpinService } from '@/services/rewardSpinService';
import type { RewardPrize, RewardPrizeType } from '@/types/episodeAccess';

/** Chance of a prize: its weight over the weights of every active prize. */
export function chanceOf(prize: RewardPrize, prizes: RewardPrize[]): number {
  if (!prize.isActive) return 0;
  const total = prizes.filter((p) => p.isActive).reduce((sum, p) => sum + (p.weight ?? 0), 0);
  return total ? ((prize.weight ?? 0) / total) * 100 : 0;
}

const amountOf = (p: RewardPrize) => (p.type === 'BONUS_COIN' ? `${p.bonusCoins} Coin thưởng` : `${p.planDays} ngày gói Tháng`);

/** BR-09: the prizes of the reward wheel and their weights. Plan days are a promotion cost (BR-49). */
export function RewardWheelPanel() {
  const prizes = useResource('admin:reward-prizes', rewardSpinService.getAdminPrizes);
  const [editing, setEditing] = useState<RewardPrize | 'new' | null>(null);
  const list = prizes.data ?? [];

  return (
    <Panel
      title="Vòng quay thưởng"
      description="Mỗi lượt quay trúng đúng một giải theo tỉ lệ trọng số. Giải ngày gói cộng vào gói đang chạy, hoặc mở gói Tháng không tự gia hạn."
      actions={
        <Button size="sm" onClick={() => setEditing('new')}>
          <Plus className="w-3.5 h-3.5" /> Thêm giải
        </Button>
      }
    >
      {prizes.error && <ErrorNote message={prizes.error} onRetry={prizes.reload} />}
      {prizes.loading && !prizes.data && <Loading />}
      {prizes.data?.length === 0 && <Empty>Vòng quay chưa có giải nào — Member có lượt cũng không quay được.</Empty>}
      {list.length > 0 && (
        <table className="w-full text-xs">
          <thead className="text-slate-500 dark:text-slate-400 text-left">
            <tr>
              <th className="py-2 font-medium">Giải</th>
              <th className="py-2 font-medium">Phần thưởng</th>
              <th className="py-2 font-medium text-right">Trọng số</th>
              <th className="py-2 font-medium text-right">Tỉ lệ</th>
              <th className="py-2 font-medium">Trạng thái</th>
              <th className="py-2 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {list.map((prize) => (
              <tr key={prize.id}>
                <td className="py-2">
                  <p className="font-medium text-slate-900 dark:text-white">{prize.name}</p>
                  <p className="text-[11px] font-mono text-slate-500">{prize.code}</p>
                </td>
                <td className="py-2">{amountOf(prize)}</td>
                <td className="py-2 text-right font-mono">{prize.weight}</td>
                <td className="py-2 text-right font-mono">{chanceOf(prize, list).toFixed(1)}%</td>
                <td className="py-2">
                  <StatusPill label={prize.isActive ? 'Trên vòng quay' : 'Đã gỡ'} tone={prize.isActive ? 'emerald' : 'neutral'} />
                </td>
                <td className="py-2 text-right">
                  <Button size="sm" variant="ghost" aria-label={`Sửa ${prize.name}`} onClick={() => setEditing(prize)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing && <PrizeModal prize={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onDone={prizes.reload} />}
    </Panel>
  );
}

function PrizeModal({ prize, onClose, onDone }: { prize: RewardPrize | null; onClose: () => void; onDone: () => Promise<void> }) {
  const [form, setForm] = useState({
    code: '',
    name: prize?.name ?? '',
    type: prize?.type ?? ('BONUS_COIN' as RewardPrizeType),
    amount: String((prize?.type === 'PLAN_DAYS' ? prize.planDays : prize?.bonusCoins) ?? ''),
    weight: String(prize?.weight ?? ''),
    isActive: prize?.isActive ?? true,
  });
  const { busy, run } = useAction();
  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });
  const amount = Number(form.amount);
  const weight = Number(form.weight);
  const maxAmount = form.type === 'PLAN_DAYS' ? 30 : Number.MAX_SAFE_INTEGER;
  const valid =
    form.name.trim() &&
    Number.isInteger(amount) &&
    amount >= 1 &&
    amount <= maxAmount &&
    Number.isInteger(weight) &&
    weight >= 1 &&
    weight <= 10_000 &&
    (prize || form.code.trim().length >= 3);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = form.type === 'BONUS_COIN' ? { bonusCoins: amount } : { planDays: amount };
    const done = prize
      ? await run(() => rewardSpinService.updatePrize(prize.id, { name: form.name.trim(), weight, isActive: form.isActive, ...value }), 'Đã lưu giải')
      : await run(
          () => rewardSpinService.createPrize({ code: form.code.trim(), name: form.name.trim(), type: form.type, weight, ...value }),
          'Đã thêm giải',
        );
    if (done) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={prize ? `Sửa ${prize.name}` : 'Thêm giải vòng quay'}>
      <form onSubmit={submit} className="space-y-3">
        {!prize && (
          <>
            <FormField label="Mã (không đổi được sau khi tạo)">
              <input value={form.code} onChange={(e) => set({ code: e.target.value })} maxLength={50} required className={fieldInputClass} />
            </FormField>
            <FormField label="Loại giải">
              <select value={form.type} onChange={(e) => set({ type: e.target.value as RewardPrizeType })} className={fieldInputClass}>
                <option value="BONUS_COIN">Coin thưởng</option>
                <option value="PLAN_DAYS">Ngày gói Tháng</option>
              </select>
            </FormField>
          </>
        )}
        <FormField label="Tên hiển thị">
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label={form.type === 'BONUS_COIN' ? 'Số Coin thưởng' : 'Số ngày (tối đa 30)'}>
            <input type="number" min={1} max={maxAmount} step={1} value={form.amount} onChange={(e) => set({ amount: e.target.value })} required className={fieldInputClass} />
          </FormField>
          <FormField label="Trọng số (1–10.000)">
            <input type="number" min={1} max={10_000} step={1} value={form.weight} onChange={(e) => set({ weight: e.target.value })} required className={fieldInputClass} />
          </FormField>
        </div>
        {prize && (
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set({ isActive: e.target.checked })} className="accent-purple-600" />
            Đang ở trên vòng quay
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
