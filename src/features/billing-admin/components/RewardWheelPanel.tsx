'use client';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { Empty, ErrorNote, Loading } from '@/components/data/ui';
import { rewardPrizeService } from '@/services/rewardPrizeService';
import type { RewardPrize } from '@/types/billing';
import { RewardPrizeModal } from './RewardPrizeModal';

/** Chance of a prize: its weight over the weights of every active prize. */
export function chanceOf(prize: RewardPrize, prizes: RewardPrize[]): number {
  if (!prize.isActive) return 0;
  const total = prizes.filter((p) => p.isActive).reduce((sum, p) => sum + (p.weight ?? 0), 0);
  return total ? ((prize.weight ?? 0) / total) * 100 : 0;
}

/** BR-09: nine Coin slots and one 30-day plan slot with a 2% chance. */
export function RewardWheelPanel() {
  const prizes = useResource('admin:reward-prizes', rewardPrizeService.getAdminPrizes);
  const [editing, setEditing] = useState<RewardPrize | 'new' | null>(null);
  const { run } = useAction();
  const list = prizes.data ?? [];
  const takenCodes = new Set(list.map((p) => p.code.toLowerCase()));

  const activePrizes = list.filter((p) => p.isActive);
  const coinPrizesCount = list.filter((p) => p.type === 'BONUS_COIN').length;
  const planPrizesCount = list.filter((p) => p.type === 'PLAN_DAYS').length;
  const totalWeight = activePrizes.reduce((sum, p) => sum + (p.weight ?? 0), 0);
  // The plan-days share follows the weights the Admin set, not a fixed number.
  const planChance = list.filter((p) => p.type === 'PLAN_DAYS').reduce((sum, p) => sum + chanceOf(p, list), 0);

  /** DELETE takes the prize off the wheel (history kept); it comes back from "Sửa" → "Bật lại". */
  const switchOff = async (prize: RewardPrize) => {
    if (!window.confirm(`Tắt giải "${prize.name}" khỏi vòng quay? Lịch sử trúng giải vẫn được giữ.`)) return;
    if (await run(() => rewardPrizeService.deletePrize(prize.id), 'Đã tắt giải')) await prizes.reload();
  };

  return (
    <section className="bg-card rounded-3xl border border-sky-100 dark:border-white/10 overflow-hidden shadow-sm">
      {/* ── Panel Header ── */}
      <div className="p-6 border-b border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  Vòng quay may mắn
                  <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    Cơ cấu 10 ô giải
                  </span>
                </h2>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Cơ cấu chuẩn gồm 10 ô: 9 giải Coin và 1 giải 30 ngày gói Tháng (tỉ lệ trúng 2%). Admin chỉnh được số Coin, số ngày, trọng số và thêm / tắt giải; Member xem trước giải và tỉ lệ trên app. Trúng giải ngày gói Tháng: đang có gói thì cộng thêm số ngày, chưa có thì kích hoạt gói không tự gia hạn.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" onClick={() => setEditing('new')} className="rounded-xl px-4 text-xs font-bold">
              Thêm giải
            </Button>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-muted text-muted-foreground border border-border">
              {activePrizes.length}/10 ô đang mở
            </span>
          </div>
        </div>

        {/* ── Summary Badges ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-muted/60 border border-border">
            <p className="text-[11px] font-semibold text-muted-foreground">Tổng ô giải thưởng</p>
            <p className="text-base font-black text-foreground mt-0.5">{list.length} ô</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Giải Coin thưởng</p>
            <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">{coinPrizesCount} giải</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/5 border border-purple-500/10">
            <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-400">Giải 30 ngày gói Tháng</p>
            <p className="text-base font-black text-purple-600 dark:text-purple-400 mt-0.5">{planPrizesCount} giải ({planChance.toFixed(1)}%)</p>
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
          <Empty>Vòng quay chưa có giải nào: Member có lượt quay cũng chưa quay được.</Empty>
        </div>
      )}

      {/* ── Modern Prizes Table ── */}
      {list.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-muted/60 border-b border-border text-muted-foreground text-[11px] font-bold">
                <th className="py-3.5 px-6">Vị trí & Tên giải</th>
                <th className="py-3.5 px-4">Mã nhận diện</th>
                <th className="py-3.5 px-4">Phần thưởng</th>
                <th className="py-3.5 px-4 text-center">Tỉ lệ xuất hiện</th>
                <th className="py-3.5 px-6">Tỉ lệ trúng thưởng</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-6 text-right">Thao tác</th>
                <th className="py-3.5 px-4 text-center">Tắt</th>
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
                        <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center tabular-nums font-bold text-[11px] text-muted-foreground shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-foreground text-xs">{prize.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {isVip ? 'Ô giải đặc biệt' : 'Ô thưởng thông thường'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="py-4 px-4 tabular-nums text-muted-foreground text-[11px]">
                      {prize.code}
                    </td>

                    {/* Reward */}
                    <td className="py-4 px-4">
                      {isVip ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-xs">
                          {prize.planDays} ngày VIP Tháng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold tabular-nums text-xs">
                          +{prize.bonusCoins} Coin
                        </span>
                      )}
                    </td>

                    {/* Weight */}
                    <td className="py-4 px-4 text-center tabular-nums font-bold text-secondary-foreground">
                      {prize.weight ?? 0}
                    </td>

                    {/* Chance percentage + Mini visual bar */}
                    <td className="py-4 px-6">
                      <div className="space-y-1.5 max-w-[140px]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`tabular-nums font-bold ${isVip ? 'text-purple-600 dark:text-purple-400' : 'text-secondary-foreground'}`}>
                            {chance.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
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
                          Đang dùng
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
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
                        className="rounded-xl hover:bg-muted p-2"
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Tắt ${prize.name}`}
                        disabled={!prize.isActive}
                        onClick={() => void switchOff(prize)}
                        className="rounded-xl hover:bg-rose-50/50 text-rose-600 p-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <RewardPrizeModal
          prize={editing === 'new' ? null : editing}
          takenCodes={takenCodes}
          onClose={() => setEditing(null)}
          onDone={prizes.reload}
        />
      )}
    </section>
  );
}
