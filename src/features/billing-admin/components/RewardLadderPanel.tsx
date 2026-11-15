'use client';

import { useState } from 'react';
import { Pencil, Coins, Gift } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useResource } from '@/hooks/useResource';
import { Empty, ErrorNote, Loading } from '@/components/data/ui';
import { billingAdminService } from '@/services/billingAdminService';
import type { RewardRule } from '@/types/billing';
import { LADDER_LENGTH, RewardRuleModal } from './RewardRuleModal';

/** BR-05 / BR-09: what each streak day pays in bonus Coins, and which day also grants a spin. */
export function RewardLadderPanel() {
  const rules = useResource('admin:reward-rules', billingAdminService.listRewardRules);
  const [editing, setEditing] = useState<RewardRule | 'new' | null>(null);
  const data = rules.data ?? [];
  const takenDays = new Set(data.filter((r) => r.isActive).map((r) => r.streakDay));

  // Sort by streakDay ascending
  const sortedRules = [...data].sort((a, b) => a.streakDay - b.streakDay);

  // Total coins across full 7-day streak
  const totalStreakCoins = sortedRules.reduce((sum, r) => sum + (r.isActive ? r.bonusCoins : 0), 0);

  return (
    <section className="bg-white dark:bg-card rounded-3xl border border-sky-100 dark:border-white/10 overflow-hidden shadow-sm">
      {/* ── Panel Header ── */}
      <div className="p-6 border-b border-slate-100 dark:border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Điểm danh hằng ngày
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    Chuỗi 7 ngày
                  </span>
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Bỏ lỡ một ngày thì chuỗi bắt đầu lại từ Ngày 1. Điểm danh đủ 7 ngày liên tục sẽ được nhận tổng cộng{' '}
              <strong className="text-amber-600 dark:text-amber-400 tabular-nums font-bold">+{totalStreakCoins} Coin</strong> và tự động tặng thêm{' '}
              <strong className="text-purple-600 dark:text-purple-400 font-semibold">1 lượt quay may mắn</strong>.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              size="sm"
              onClick={() => setEditing('new')}
              disabled={takenDays.size >= LADDER_LENGTH}
              className="rounded-xl px-4 py-2 font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <span>Thêm ngày</span>
            </Button>
          </div>
        </div>

        {/* ── Visual 7-Day Streak Preview Cards ── */}
        {sortedRules.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
            {sortedRules.map((r) => {
              const isDay7 = r.streakDay === LADDER_LENGTH;
              return (
                <div
                  key={r.id}
                  className={`relative p-3 rounded-2xl border transition-all text-center flex flex-col justify-between ${
                    isDay7
                      ? 'bg-gradient-to-b from-purple-500/10 via-amber-500/5 to-transparent border-purple-500/30 shadow-xs'
                      : 'bg-slate-50/80 dark:bg-white/[0.02] border-slate-200/70 dark:border-white/5'
                  }`}
                >
                  {isDay7 && (
                    <span className="absolute -top-2 right-2 text-[9px] font-black text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/20 px-1.5 py-0.2 rounded-full border border-purple-500/30">
                      Đặc biệt
                    </span>
                  )}
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Ngày {r.streakDay}
                  </p>
                  <div className="my-1.5">
                    <span className="inline-flex items-center gap-1 text-sm font-black tabular-nums text-amber-600 dark:text-amber-400">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      +{r.bonusCoins}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-slate-200/50 dark:border-white/5">
                    {isDay7 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-300">
                        <Gift className="w-3 h-3 text-purple-500" /> +1 Vòng quay
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        Coin thưởng
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Content States ── */}
      {rules.error && <ErrorNote message={rules.error} onRetry={rules.reload} />}
      {rules.loading && !rules.data && <Loading />}
      {rules.data?.length === 0 && (
        <Empty>Chưa cấu hình ngày nào - Khán giả điểm danh sẽ không nhận được Coin thưởng.</Empty>
      )}

      {/* ── Detailed Table ── */}
      {sortedRules.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 text-left">
              <tr>
                <th className="py-3 px-6 font-bold w-24">Ngày chuỗi</th>
                <th className="py-3 px-4 font-bold">Tên hiển thị</th>
                <th className="py-3 px-4 font-bold text-right">Coin thưởng</th>
                <th className="py-3 px-4 font-bold text-center">Quà tặng kèm</th>
                <th className="py-3 px-4 font-bold text-center">Trạng thái</th>
                <th className="py-3 px-6 text-right w-20">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {sortedRules.map((rule) => {
                const isDay7 = rule.streakDay === LADDER_LENGTH;
                return (
                  <tr
                    key={rule.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-6 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 tabular-nums text-xs">
                        Ngày {rule.streakDay}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {rule.name}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 tabular-nums font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 text-xs">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        +{rule.bonusCoins} Coin
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isDay7 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                          <Gift className="w-3.5 h-3.5 text-purple-500" />
                          <span>+1 Lượt quay</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 tabular-nums">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          rule.isActive
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                            : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            rule.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span>{rule.isActive ? 'Đang dùng' : 'Đã tắt'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        aria-label={`Sửa ngày ${rule.streakDay}`}
                        onClick={() => setEditing(rule)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        title="Chỉnh sửa cấu hình ngày này"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Edit / Create Modal ── */}
      {editing && (
        <RewardRuleModal
          rule={editing === 'new' ? null : editing}
          takenDays={takenDays}
          onClose={() => setEditing(null)}
          onDone={rules.reload}
        />
      )}
    </section>
  );
}
