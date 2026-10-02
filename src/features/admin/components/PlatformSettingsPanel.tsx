'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { productionService } from '@/services/productionService';
import type { PlatformSettings } from '@/types/production';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { formatDateTime } from '@/features/production/lib/format';

type Key = Exclude<keyof PlatformSettings, 'updatedAt'>;

const FIELDS: { key: Key; label: string; unit: string; hint: string; min: number }[] = [
  { key: 'freeStarterEpisodeCount', label: 'Số tập xem miễn phí', unit: 'tập', hint: 'Các tập đầu Guest và Member Free xem được (BR-03).', min: 0 },
  { key: 'tokenRateVnd', label: 'Tỷ giá Token', unit: '₫ / Token', hint: 'Giá trị 1 Token phí sản xuất; áp cho các lần ghi phí từ nay (BR-45).', min: 1 },
  { key: 'coinRateVnd', label: 'Tỷ giá Coin', unit: '₫ / Coin', hint: 'Giá trị 1 Coin chính (BR-45).', min: 1 },
  { key: 'episodeCoinPriceMin', label: 'Giá tập thấp nhất', unit: 'Coin', hint: 'Giá ngoài khoảng vẫn lưu được nhưng báo Admin (BR-47).', min: 0 },
  { key: 'episodeCoinPriceMax', label: 'Giá tập cao nhất', unit: 'Coin', hint: '', min: 0 },
  { key: 'bonusCoinExpiryDays', label: 'Hạn Coin thưởng', unit: 'ngày', hint: 'BR-28, BR-52.', min: 1 },
  { key: 'playbackHeartbeatTimeoutSeconds', label: 'Hết phiên phát', unit: 'giây', hint: 'Không nhận heartbeat quá thời gian này thì đóng luồng (BR-36).', min: 10 },
];

/** Platform policies the Admin sets: free episodes, rates, the valid Coin price range, timeouts. */
export function PlatformSettingsPanel() {
  const settings = useResource('settings', productionService.getPlatformSettings);
  const [draft, setDraft] = useState<Partial<Record<Key, string>>>({});
  const { busy, run } = useAction();

  if (settings.loading && !settings.data) return <p className="text-xs text-slate-500">Đang tải cài đặt…</p>;
  if (!settings.data) return <p className="text-xs text-rose-600">{settings.error ?? 'Không tải được cài đặt.'}</p>;
  const current = settings.data;

  const value = (k: Key) => draft[k] ?? String(current[k]);
  const changed = FIELDS.filter((f) => draft[f.key] !== undefined && Number(draft[f.key]) !== current[f.key]);
  const invalid = FIELDS.some((f) => {
    const n = Number(value(f.key));
    return !Number.isInteger(n) || n < f.min;
  });
  const rangeInvalid = Number(value('episodeCoinPriceMin')) > Number(value('episodeCoinPriceMax'));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const patch = Object.fromEntries(changed.map((f) => [f.key, Number(value(f.key))])) as Partial<PlatformSettings>;
    if (await run(() => productionService.updatePlatformSettings(patch), 'Đã lưu cài đặt')) {
      setDraft({});
      await settings.reload();
    }
  };

  return (
    <section className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 p-5 space-y-4 max-w-2xl">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Cài đặt nền tảng</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cập nhật lần cuối: {formatDateTime(current.updatedAt)}</p>
      </div>
      <form onSubmit={save} className="space-y-3 text-xs">
        {FIELDS.map((f) => (
          <label key={f.key} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-4 items-center">
            <span>
              <span className="block font-semibold text-slate-800 dark:text-slate-200">{f.label}</span>
              {f.hint && <span className="block text-slate-500 dark:text-slate-400">{f.hint}</span>}
            </span>
            <span className="flex items-center gap-2">
              <input
                type="number"
                min={f.min}
                step={1}
                value={value(f.key)}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                className={`${fieldInputClass} w-28 py-1.5 text-right font-mono`}
              />
              <span className="w-20 text-slate-500">{f.unit}</span>
            </span>
          </label>
        ))}
        {rangeInvalid && <p className="text-rose-600">Giá thấp nhất không được lớn hơn giá cao nhất.</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={busy || changed.length === 0 || invalid || rangeInvalid}>
            Lưu {changed.length > 0 && `(${changed.length})`}
          </Button>
        </div>
      </form>
    </section>
  );
}
