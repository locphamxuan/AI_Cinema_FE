'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { Empty, ErrorNote, Loading } from '@/components/data/ui';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { cn } from '@/lib/utils';
import { rewardPrizeService } from '@/services/rewardPrizeService';
import type { RewardPrize } from '@/types/billing';
import { RewardPrizeModal } from './RewardPrizeModal';
import { chanceOf, formatPercent, prizeReward } from './rewardOdds';

/**
 * BR-09: the prizes of the lucky wheel. Each prize has "tỉ lệ trúng" points; the list shows the
 * percentage they give among the prizes that are on. Switching a prize off and deleting it are
 * separate: off keeps it in the list, delete removes it for good (members' past wins stay).
 */
export function RewardWheelPanel() {
  const prizes = useResource('admin:reward-prizes', rewardPrizeService.getAdminPrizes);
  const [editing, setEditing] = useState<RewardPrize | 'new' | null>(null);
  const [deleting, setDeleting] = useState<RewardPrize | null>(null);
  const { busy, run } = useAction({
    onStale: () => {
      setDeleting(null);
      return prizes.reload();
    },
  });
  const list = prizes.data ?? [];
  const activeCount = list.filter((p) => p.isActive).length;

  const toggle = async (prize: RewardPrize) => {
    const on = !prize.isActive;
    if (await run(() => rewardPrizeService.updatePrize(prize.id, { isActive: on }), on ? 'Đã bật giải' : 'Đã tắt giải')) {
      await prizes.reload();
    }
  };

  const remove = async () => {
    if (!deleting) return;
    if (await run(() => rewardPrizeService.deletePrize(deleting.id), 'Đã xoá giải')) {
      setDeleting(null);
      await prizes.reload();
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <header className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-foreground">Vòng quay may mắn</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Mỗi lượt quay trúng đúng một giải trong các giải đang bật. Giải có tỉ lệ cao hơn thì dễ trúng hơn; cột
            &quot;Tỉ lệ trúng&quot; là phần trăm Member thấy trên app.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Trúng ngày gói Tháng: Member đang có gói thì được cộng thêm ngày, chưa có thì được tặng gói (không tự gia hạn).
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-sm text-muted-foreground tabular-nums">
            {activeCount}/{list.length} giải đang bật
          </span>
          <Button size="sm" onClick={() => setEditing('new')} className="rounded-xl px-4">
            Thêm giải
          </Button>
        </div>
      </header>

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
          <Empty>Vòng quay chưa có giải nào. Member có lượt quay sẽ chưa quay được cho tới khi có giải.</Empty>
        </div>
      )}
      {list.length > 0 && activeCount === 0 && (
        <p className="border-b border-border bg-destructive/5 px-6 py-3 text-sm text-destructive">
          Tất cả giải đang tắt: Member chỉ xem được vòng quay, chưa quay được.
        </p>
      )}

      {list.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">Giải</th>
                <th className="px-4 py-3 font-semibold">Phần thưởng</th>
                <th className="px-4 py-3 font-semibold">Tỉ lệ trúng</th>
                <th className="px-4 py-3 font-semibold">Trên vòng quay</th>
                <th className="px-6 py-3 text-right font-semibold">
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((prize) => {
                const chance = chanceOf(prize, list);
                return (
                  <tr key={prize.id} className={cn(!prize.isActive && 'text-muted-foreground')}>
                    <td className="px-6 py-4 font-semibold text-foreground">{prize.name}</td>
                    <td className="whitespace-nowrap px-4 py-4">{prizeReward(prize)}</td>
                    <td className="px-4 py-4">
                      {prize.isActive ? (
                        <div className="w-40 space-y-1">
                          <span className="font-semibold tabular-nums text-foreground">{formatPercent(chance)}</span>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, chance)}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span>Không trúng (đang tắt)</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <PrizeSwitch prize={prize} disabled={busy} onToggle={() => void toggle(prize)} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Button size="sm" variant="secondary" aria-label={`Sửa ${prize.name}`} onClick={() => setEditing(prize)} className="rounded-xl">
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Xoá ${prize.name}`}
                        onClick={() => setDeleting(prize)}
                        className="ml-2 rounded-xl text-destructive hover:bg-destructive/10"
                      >
                        Xoá
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
          prizes={list}
          onClose={() => setEditing(null)}
          onDone={prizes.reload}
        />
      )}
      <ConfirmModal
        open={Boolean(deleting)}
        tone="danger"
        title="Xoá giải vĩnh viễn?"
        description={
          <>
            Giải <strong className="text-foreground">{deleting?.name}</strong> sẽ bị xoá hẳn khỏi vòng quay và không khôi
            phục được. Nếu chỉ muốn tạm ngừng, hãy tắt giải thay vì xoá.
          </>
        }
        details={deleting ? [['Phần thưởng', prizeReward(deleting)]] : undefined}
        consequence="Member đã trúng giải này vẫn giữ nguyên phần thưởng và lịch sử. Tỉ lệ trúng của các giải còn lại được tính lại."
        confirmLabel="Xoá vĩnh viễn"
        busy={busy}
        onClose={() => setDeleting(null)}
        onConfirm={() => void remove()}
      />
    </section>
  );
}

/** On/off switch of one prize: on = it can be won, off = it stays in the list but nobody wins it. */
function PrizeSwitch({ prize, disabled, onToggle }: { prize: RewardPrize; disabled: boolean; onToggle: () => void }) {
  const on = Boolean(prize.isActive);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`Bật giải ${prize.name} trên vòng quay`}
      disabled={disabled}
      onClick={onToggle}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className={cn('relative h-5 w-9 rounded-full transition-colors', on ? 'bg-success' : 'bg-muted-foreground/30')}>
        <span
          className={cn('absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform', on ? 'translate-x-4' : 'translate-x-0.5')}
        />
      </span>
      <span className="text-sm font-medium">{on ? 'Đang bật' : 'Đang tắt'}</span>
    </button>
  );
}
