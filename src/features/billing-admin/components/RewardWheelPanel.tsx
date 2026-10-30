'use client';

import { useState } from 'react';
import { Pencil, Sparkles, Coins, Crown, Trophy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { Empty, ErrorNote, Loading } from '@/features/production/components/shared/ui';
import { rewardSpinService } from '@/services/rewardSpinService';
import type { RewardPrize } from '@/types/episodeAccess';

/** Chance of a prize: its weight over the weights of every active prize. */
export function chanceOf(prize: RewardPrize, prizes: RewardPrize[]): number {
  if (!prize.isActive) return 0;
  const total = prizes.filter((p) => p.isActive).reduce((sum, p) => sum + (p.weight ?? 0), 0);
  return total ? ((prize.weight ?? 0) / total) * 100 : 0;
}

/** BR-09: nine Coin slots and one 30-day plan slot with a 2% chance. */
export function RewardWheelPanel() {
  const prizes = useResource('admin:reward-prizes', rewardSpinService.getAdminPrizes);
  const [editing, setEditing] = useState<RewardPrize | null>(null);
  const list = prizes.data ?? [];

  const activePrizes = list.filter((p) => p.isActive);
  const coinPrizesCount = list.filter((p) => p.type === 'BONUS_COIN').length;
  const planPrizesCount = list.filter((p) => p.type === 'PLAN_DAYS').length;
  const totalWeight = activePrizes.reduce((sum, p) => sum + (p.weight ?? 0), 0);

  return (
    <section className="bg-white dark:bg-card rounded-3xl border border-sky-100 dark:border-white/10 overflow-hidden shadow-sm">
      {/* ── Panel Header ── */}
      <div className="p-6 border-b border-slate-100 dark:border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Vòng quay may mắn
                  <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    Cơ cấu 10 ô giải
                  </span>
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Cơ cấu chuẩn gồm 10 ô: 9 giải Coin và 1 giải Gói VIP Tháng 30 ngày (tỉ lệ trúng 2.0%). Nếu thành viên trúng giải gói VIP mà chưa kích hoạt gói, hệ thống sẽ tự động kích hoạt gói VIP không tự gia hạn.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {activePrizes.length}/10 ô đang mở
            </span>
          </div>
        </div>

        {/* ── Summary Badges ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tổng ô giải thưởng</p>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{list.length} ô</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Giải Coin thưởng</p>
            <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">{coinPrizesCount} giải</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/5 border border-purple-500/10">
            <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-400">Giải Gói VIP 30 ngày</p>
            <p className="text-base font-black text-purple-600 dark:text-purple-400 mt-0.5">{planPrizesCount} giải (2%)</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Tổng trọng số kích hoạt</p>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">{totalWeight}</p>
          </div>
        </div>
      </div>

      {/* ── Error & Loading States ── */}
      {prizes.error && (
        <div className="p-6">
          <ErrorNote message={prizes.error} onRetry={prizes.reload} />
        </div>
      )}
      {prizes.loading && !prizes.data && (
        <div className="p-12">
          <Loading />
        </div>
      )}
      {prizes.data?.length === 0 && (
        <div className="p-12">
          <Empty>Vòng quay chưa có giải nào - Thành viên có lượt cũng không quay được.</Empty>
        </div>
      )}

      {/* ── Modern Prizes Table ── */}
      {list.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                <th className="py-3.5 px-6">Vị trí & Tên giải</th>
                <th className="py-3.5 px-4">Mã nhận diện</th>
                <th className="py-3.5 px-4">Phần thưởng</th>
                <th className="py-3.5 px-4 text-center">Trọng số</th>
                <th className="py-3.5 px-6">Tỉ lệ trúng thưởng</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
              {list.map((prize, idx) => {
                const chance = chanceOf(prize, list);
                const isVip = prize.type === 'PLAN_DAYS';

                return (
                  <tr key={prize.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    {/* Position & Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center tabular-nums font-bold text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{prize.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {isVip ? 'Ô giải đặc biệt' : 'Ô thưởng thông thường'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="py-4 px-4 tabular-nums text-slate-500 dark:text-slate-400 text-[11px]">
                      {prize.code}
                    </td>

                    {/* Reward */}
                    <td className="py-4 px-4">
                      {isVip ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-xs">
                          <Crown className="w-3.5 h-3.5 text-purple-500" />
                          {prize.planDays} ngày VIP Tháng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold tabular-nums text-xs">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          +{prize.bonusCoins} Coin
                        </span>
                      )}
                    </td>

                    {/* Weight */}
                    <td className="py-4 px-4 text-center tabular-nums font-bold text-slate-700 dark:text-slate-300">
                      {prize.weight ?? 0}
                    </td>

                    {/* Chance percentage + Mini visual bar */}
                    <td className="py-4 px-6">
                      <div className="space-y-1.5 max-w-[140px]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`tabular-nums font-bold ${isVip ? 'text-purple-600 dark:text-purple-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {chance.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isVip ? 'bg-purple-500' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(chance, 3))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      {prize.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Đang dùng
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                          Tắt
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Sửa ${prize.name}`}
                        onClick={() => setEditing(prize)}
                        className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 p-2"
                      >
                        <Pencil className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && <PrizeModal prize={editing} onClose={() => setEditing(null)} onDone={prizes.reload} />}
    </section>
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
    <Modal open onClose={onClose} title={`Sửa giải thưởng: ${prize.name}`}>
      <form onSubmit={submit} className="space-y-4 pt-1">
        <FormField label="Tên hiển thị">
          <input
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            maxLength={255}
            required
            className={fieldInputClass}
            placeholder="Ví dụ: Ô 50 Coin..."
          />
        </FormField>

        {prize.type === 'BONUS_COIN' ? (
          <FormField label="Số Coin thưởng">
            <input
              type="number"
              min={1}
              step={1}
              value={form.amount}
              onChange={(e) => set({ amount: e.target.value })}
              required
              className={fieldInputClass}
              placeholder="Nhập số coin (vd: 50)"
            />
          </FormField>
        ) : (
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-800 dark:text-purple-300">
            <p className="font-bold flex items-center gap-1.5 mb-1">
              <Crown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Giải thưởng đặc biệt (Gói VIP Tháng)
            </p>
            <p className="text-[11px] leading-relaxed opacity-90">
              Giải gói Tháng cố định 30 ngày, tỉ lệ trúng 2.0% theo BR-09. Không cần cấu hình số Coin.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/5">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl px-4 text-xs font-semibold">
            Huỷ
          </Button>
          <Button type="submit" disabled={!valid || busy} className="rounded-xl px-5 text-xs font-bold">
            {busy ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
