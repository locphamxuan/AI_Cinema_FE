'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { formatNumber } from '@/lib/format';
import { productionService } from '@/services/productionService';

/** The highest Coin price the API takes for one episode (SetCoinPriceRequestDto). */
export const MAX_EPISODE_COIN_PRICE = 1_000_000;

export interface EpisodePricingTarget {
  id: string;
  label: string;
  coinPrice: number | null;
  isFreeForGuest?: boolean;
  isFreeForMember?: boolean;
}

export function EpisodePricingModal({
  episode,
  onClose,
  onChanged,
}: {
  episode: EpisodePricingTarget;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [price, setPrice] = useState(episode.coinPrice !== null ? String(episode.coinPrice) : '');
  const [isFreeForGuest, setIsFreeForGuest] = useState(!!episode.isFreeForGuest);
  const [isFreeForMember, setIsFreeForMember] = useState(!!episode.isFreeForMember);
  const { busy, run } = useAction();
  const settings = useResource('settings', productionService.getPlatformSettings);

  const priceValue = Number(price);
  const priceValid = price !== '' && Number.isInteger(priceValue) && priceValue >= 0 && priceValue <= MAX_EPISODE_COIN_PRICE;
  const min = settings.data?.episodeCoinPriceMin;
  const max = settings.data?.episodeCoinPriceMax;
  // BR-47: a price outside the platform range is kept, and the Admin is warned through a price alert.
  const outOfRange = priceValid && min !== undefined && max !== undefined && (priceValue < min || priceValue > max);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceValid) return;

    const done = await run(async () => {
      const pRes = await productionService.setCoinPrice(episode.id, priceValue);
      if (!pRes.success) return pRes;
      // BR-03/19: an episode free for Guests is free for Members too, as the API stores it.
      return productionService.setAccessFlags(episode.id, { isFreeForGuest, isFreeForMember: isFreeForGuest || isFreeForMember });
    }, outOfRange ? 'Đã lưu - giá ngoài khoảng cho phép nên có cảnh báo giá' : 'Đã cập nhật giá Coin và quyền xem tập');

    if (done) {
      await onChanged();
      onClose();
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth="max-w-md"
      title="Đặt giá & Quyền xem tập"
      subtitle={episode.label}
    >
      <form onSubmit={submit} className="space-y-4 text-xs">
        <FormField
          label="Giá Coin (nhập 0 nếu hoàn toàn miễn phí)"
          error={price !== '' && !priceValid ? `Giá Coin là số nguyên từ 0 đến ${formatNumber(MAX_EPISODE_COIN_PRICE)}.` : null}
          hint={
            outOfRange
              ? `Ngoài khoảng ${formatNumber(min)}–${formatNumber(max)} Coin: vẫn lưu được nhưng sẽ có cảnh báo giá.`
              : min !== undefined && max !== undefined
                ? `Khoảng giá nền tảng: ${formatNumber(min)}–${formatNumber(max)} Coin.`
                : undefined
          }
          required
        >
          <input
            type="number"
            min={0}
            max={MAX_EPISODE_COIN_PRICE}
            step={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className={fieldInputClass}
            aria-label="Giá Coin"
          />
        </FormField>

        <div className="space-y-2 rounded-xl border border-border p-3 bg-muted/60">
          <p className="font-semibold text-secondary-foreground">Khoá / Mở tập miễn phí</p>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFreeForGuest}
              onChange={(e) => setIsFreeForGuest(e.target.checked)}
              className="rounded border-input text-sky-600 focus:ring-sky-500"
            />
            <span className="text-secondary-foreground">Miễn phí cho khách chưa đăng nhập</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFreeForGuest || isFreeForMember}
              disabled={isFreeForGuest}
              onChange={(e) => setIsFreeForMember(e.target.checked)}
              className="rounded border-input text-sky-600 focus:ring-sky-500"
            />
            <span className="text-secondary-foreground">
              Miễn phí cho Member{isFreeForGuest && ' (tự bật vì tập đã miễn phí cho khách)'}
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !priceValid}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
