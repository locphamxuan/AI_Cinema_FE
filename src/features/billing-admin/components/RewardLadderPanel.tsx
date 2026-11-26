'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useResource } from '@/hooks/useResource';
import { Empty, ErrorNote, Loading } from '@/components/data/ui';
import { cn } from '@/lib/utils';
import { billingAdminService } from '@/services/billingAdminService';
import type { RewardRule } from '@/types/billing';
import { LADDER_LENGTH, RewardRuleModal } from './RewardRuleModal';

const DAYS = Array.from({ length: LADDER_LENGTH }, (_, i) => i + 1);

/**
 * BR-05 / BR-09: the 7-day check-in schedule. One card per day shows the bonus Coins it pays and
 * whether it also gives a spin; switched-off rewards are listed under it so they can be turned back on.
 */
export function RewardLadderPanel() {
  const rules = useResource('admin:reward-rules', billingAdminService.listRewardRules);
  const [editing, setEditing] = useState<{ rule: RewardRule | null; day?: number } | null>(null);
  const data = rules.data ?? [];
  const active = data.filter((r) => r.isActive);
  const off = data.filter((r) => !r.isActive).sort((a, b) => a.streakDay - b.streakDay);
  const byDay = new Map(active.map((r) => [r.streakDay, r]));
  const takenDays = new Set(byDay.keys());
  const takenCodes = new Set(data.map((r) => r.code.toLowerCase()));
  const weekCoins = active.reduce((sum, r) => sum + r.bonusCoins, 0);
  const spinDays = active.filter((r) => r.grantsSpin).map((r) => r.streakDay);

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <header className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-foreground">Điểm danh hằng ngày</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Mỗi ngày Member điểm danh một lần để nhận Coin thưởng theo bảng dưới. Điểm danh liên tục thì tiến lên ngày
            tiếp theo; bỏ một ngày thì quay lại Ngày 1; xong Ngày {LADDER_LENGTH} thì bắt đầu lại từ Ngày 1.
          </p>
          <p className="text-sm text-foreground">
            Đủ {LADDER_LENGTH} ngày liên tục: tổng <strong className="tabular-nums">{weekCoins} Coin thưởng</strong>
            {spinDays.length > 0 && <> và 1 lượt quay (vào Ngày {spinDays.join(', ')})</>}.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setEditing({ rule: null })}
          disabled={takenDays.size >= LADDER_LENGTH}
          className="shrink-0 rounded-xl px-4"
        >
          Thêm ngày
        </Button>
      </header>

      {rules.error && <ErrorNote message={rules.error} onRetry={rules.reload} />}
      {rules.loading && !rules.data && <Loading />}
      {rules.data?.length === 0 && <Empty>Chưa đặt thưởng cho ngày nào: Member điểm danh sẽ chưa nhận được Coin thưởng.</Empty>}

      {rules.data && (
        <ol className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4 lg:grid-cols-7">
          {DAYS.map((day) => {
            const rule = byDay.get(day);
            return (
              <li
                key={day}
                className={cn(
                  'flex flex-col gap-2 rounded-2xl border p-3 text-center',
                  rule?.grantsSpin ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/40',
                  !rule && 'border-dashed',
                )}
              >
                <p className="text-xs font-semibold text-muted-foreground">Ngày {day}</p>
                {rule ? (
                  <>
                    <p className="text-lg font-bold tabular-nums text-foreground">+{rule.bonusCoins}</p>
                    <p className="text-xs text-muted-foreground">Coin thưởng</p>
                    {rule.grantsSpin && <p className="text-xs font-semibold text-primary">+1 lượt quay</p>}
                    <Button size="sm" variant="secondary" aria-label={`Sửa ngày ${day}`} onClick={() => setEditing({ rule })} className="mt-auto rounded-xl">
                      Sửa
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Chưa có thưởng</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Đặt thưởng ngày ${day}`}
                      onClick={() => setEditing({ rule: null, day })}
                      className="mt-auto rounded-xl"
                    >
                      Đặt thưởng
                    </Button>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {off.length > 0 && (
        <div className="border-t border-border px-6 py-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Thưởng đang tắt</h3>
          <ul className="divide-y divide-border text-sm">
            {off.map((rule) => (
              <li key={rule.id} className="flex items-center justify-between gap-3 py-2 text-muted-foreground">
                <span>
                  Ngày {rule.streakDay}: +{rule.bonusCoins} Coin thưởng{rule.grantsSpin ? ', +1 lượt quay' : ''}
                </span>
                <Button size="sm" variant="secondary" aria-label={`Sửa ngày ${rule.streakDay}`} onClick={() => setEditing({ rule })} className="rounded-xl">
                  Sửa
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editing && (
        <RewardRuleModal
          rule={editing.rule}
          initialDay={editing.day}
          takenDays={takenDays}
          takenCodes={takenCodes}
          onClose={() => setEditing(null)}
          onDone={rules.reload}
        />
      )}
    </section>
  );
}
