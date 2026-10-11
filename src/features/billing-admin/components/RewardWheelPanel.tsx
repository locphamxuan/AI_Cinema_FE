'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { Empty, ErrorNote, Loading, Panel } from '@/features/production/components/shared/ui';
import { rewardSpinService } from '@/services/rewardSpinService';
import type { RewardPrize } from '@/types/episodeAccess';

/** Chance of a prize: its weight over the weights of every active prize. */
export function chanceOf(prize: RewardPrize, prizes: RewardPrize[]): number {
  if (!prize.isActive) return 0;
  const total = prizes.filter((p) => p.isActive).reduce((sum, p) => sum + (p.weight ?? 0), 0);
  return total ? ((prize.weight ?? 0) / total) * 100 : 0;
}

const amountOf = (p: RewardPrize) => (p.type === 'BONUS_COIN' ? `${p.bonusCoins} Coin thưởng` : `${p.planDays} ngày gói Tháng`);

/** BR-09: nine Coin slots and one 30-day plan slot with a 2% chance. */
export function RewardWheelPanel() {
  const prizes = useResource('admin:reward-prizes', rewardSpinService.getAdminPrizes);
  const [editing, setEditing] = useState<RewardPrize | null>(null);
  const list = prizes.data ?? [];

  return (
    <Panel
      title="Vòng quay thưởng"
      description="Có 10 ô: 9 giải Coin và 1 gói Tháng 30 ngày. Gói Tháng có tỉ lệ trúng 2%; nếu bạn chưa có gói, hệ thống sẽ kích hoạt gói không tự gia hạn."
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
              <th className="py-2 font-medium text-right">Tỉ lệ</th>
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
                <td className="py-2 text-right font-mono">{chanceOf(prize, list).toFixed(1)}%</td>
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
      {editing && <PrizeModal prize={editing} onClose={() => setEditing(null)} onDone={prizes.reload} />}
    </Panel>
  );
}

function PrizeModal({ prize, onClose, onDone }: { prize: RewardPrize; onClose: () => void; onDone: () => Promise<void> }) {
  const [form, setForm] = useState({
    name: prize?.name ?? '',
    amount: String(prize.bonusCoins ?? ''),
  });
  const { busy, run } = useAction();
  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });
  const amount = Number(form.amount);
  const valid = form.name.trim() && (prize.type === 'PLAN_DAYS' || (Number.isInteger(amount) && amount >= 1));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () => rewardSpinService.updatePrize(prize.id, { name: form.name.trim(), ...(prize.type === 'BONUS_COIN' ? { bonusCoins: amount } : {}) }),
      'Đã lưu giải',
    );
    if (done) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={`Sửa ${prize.name}`}>
      <form onSubmit={submit} className="space-y-3">
        <FormField label="Tên hiển thị">
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} maxLength={255} required className={fieldInputClass} />
        </FormField>
        {prize.type === 'BONUS_COIN' ? (
          <FormField label="Số Coin thưởng">
            <input type="number" min={1} step={1} value={form.amount} onChange={(e) => set({ amount: e.target.value })} required className={fieldInputClass} />
          </FormField>
        ) : (
          <p className="text-xs text-slate-500">Giải gói Tháng cố định 30 ngày, tỉ lệ 2%.</p>
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
