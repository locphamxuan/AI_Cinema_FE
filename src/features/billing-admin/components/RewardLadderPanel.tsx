'use client';

import { useState } from 'react';
import { Pencil, Plus, CalendarDays, Coins, Gift, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { Empty, ErrorNote, Loading } from '@/features/production/components/shared/ui';
import { billingAdminService } from '@/services/billingAdminService';
import type { RewardRule } from '@/types/billing';

/** The BE ladder runs seven streak days, then starts again at day 1. */
export const LADDER_LENGTH = 7;

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
    <section className="bg-white dark:bg-[#0F1C27] rounded-3xl border border-sky-100 dark:border-white/10 overflow-hidden shadow-sm">
      {/* ── Panel Header ── */}
      <div className="p-6 border-b border-slate-100 dark:border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <CalendarDays className="w-5 h-5" />
              </div>
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
              <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold">+{totalStreakCoins} Coin</strong> và tự động tặng thêm{' '}
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
              <Plus className="w-3.5 h-3.5" />
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
                    <span className="absolute -top-2 right-2 text-[9px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/20 px-1.5 py-0.2 rounded-full border border-purple-500/30">
                      Đặc biệt
                    </span>
                  )}
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Ngày {r.streakDay}
                  </p>
                  <div className="my-1.5">
                    <span className="inline-flex items-center gap-1 text-sm font-black font-mono text-amber-600 dark:text-amber-400">
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
            <thead className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 uppercase tracking-wider text-left">
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 font-mono text-xs">
                        Ngày {rule.streakDay}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {rule.name}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 text-xs">
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
                        <span className="text-slate-400 dark:text-slate-600 font-mono">—</span>
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
        <RuleModal
          rule={editing === 'new' ? null : editing}
          takenDays={takenDays}
          onClose={() => setEditing(null)}
          onDone={rules.reload}
        />
      )}
    </section>
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
