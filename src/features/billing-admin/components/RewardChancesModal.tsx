'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { cn } from '@/lib/utils';
import { rewardPrizeService } from '@/services/rewardPrizeService';
import type { RewardPrize } from '@/types/billing';
import { FULL_WHEEL, evenSplit, formatChance, parsePercent, percentInput, prizeReward, totalProblem } from './rewardOdds';

interface Row {
  on: boolean;
  text: string;
}

/**
 * "Chia lại tỉ lệ": every prize of the wheel in one form. The Admin ticks the prizes to switch on and types their
 * chance; it saves in one go (PUT /admin/reward-prizes/chances) once the ticked prizes add up to exactly 100 %.
 * `preset` opens it with a switch the Admin just asked for (on or off) already applied.
 */
export function RewardChancesModal({
  prizes,
  preset = {},
  notice,
  onClose,
  onDone,
}: {
  prizes: RewardPrize[];
  preset?: Record<string, boolean>;
  /** Why the editor opened, e.g. a switch that alone would break 100 %. */
  notice?: string;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [rows, setRows] = useState<Record<string, Row>>(() =>
    Object.fromEntries(
      prizes.map((p) => [p.id, { on: preset[p.id] ?? Boolean(p.isActive), text: p.weight ? percentInput(p.weight) : '' }]),
    ),
  );
  const { busy, run } = useAction();
  const set = (id: string, patch: Partial<Row>) => setRows({ ...rows, [id]: { ...rows[id], ...patch } });

  const ticked = prizes.filter((p) => rows[p.id].on);
  const weights = ticked.map((p) => parsePercent(rows[p.id].text));
  const badInput = weights.some((w) => w === null);
  const total = weights.reduce<number>((sum, w) => sum + (w ?? 0), 0);
  const problem = ticked.length === 0 ? 'Bật ít nhất một giải.' : badInput ? 'Nhập tỉ lệ từ 0,01 đến 100.' : totalProblem(total);

  const spreadEvenly = () => {
    const split = evenSplit(ticked.length);
    const next = { ...rows };
    ticked.forEach((p, i) => (next[p.id] = { ...next[p.id], text: percentInput(split[i]) }));
    setRows(next);
  };

  const save = async () => {
    const body = ticked.map((p, i) => ({ id: p.id, weight: weights[i]! }));
    if (await run(() => rewardPrizeService.setChances(body), 'Đã lưu tỉ lệ trúng')) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title="Chia lại tỉ lệ trúng" maxWidth="max-w-xl">
      <div className="space-y-4 pt-1">
        {notice && <p className="rounded-xl bg-highlight/10 px-3 py-2 text-sm text-foreground">{notice}</p>}
        <ul className="divide-y divide-border rounded-xl border border-border">
          {prizes.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-3 py-2">
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                <input type="checkbox" checked={rows[p.id].on} onChange={(e) => set(p.id, { on: e.target.checked })} className="size-4 accent-primary" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{p.name}</span>
                  <span className="block text-xs text-muted-foreground">{prizeReward(p)}</span>
                </span>
              </label>
              <span className="flex items-center gap-1.5">
                <label className="sr-only" htmlFor={`chance-${p.id}`}>
                  Tỉ lệ trúng (%) của {p.name}
                </label>
                <input
                  id={`chance-${p.id}`}
                  inputMode="decimal"
                  value={rows[p.id].text}
                  disabled={!rows[p.id].on}
                  onChange={(e) => set(p.id, { text: e.target.value })}
                  className={cn(fieldInputClass, 'w-20 py-1 text-right tabular-nums')}
                />
                <span className="text-sm text-muted-foreground" aria-hidden="true">
                  %
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm" aria-live="polite">
          <p>
            Tổng các giải bật: <strong className="tabular-nums">{formatChance(total)}</strong>
            {problem && <span className="ml-1.5 text-destructive">· {problem}</span>}
          </p>
          <Button type="button" size="sm" variant="ghost" disabled={ticked.length === 0} onClick={spreadEvenly}>
            Chia đều
          </Button>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-border pt-3">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl px-4">
            Huỷ
          </Button>
          <Button type="button" disabled={Boolean(problem) || total !== FULL_WHEEL || busy} onClick={() => void save()} className="rounded-xl px-5">
            {busy ? 'Đang lưu…' : 'Lưu tỉ lệ'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
