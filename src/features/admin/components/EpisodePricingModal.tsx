'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { productionService } from '@/services/productionService';

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

  const priceValue = Number(price);
  const priceValid = price !== '' && Number.isInteger(priceValue) && priceValue >= 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceValid) return;

    const done = await run(async () => {
      const pRes = await productionService.setCoinPrice(episode.id, priceValue);
      if (!pRes.success) return pRes;
      return productionService.setAccessFlags(episode.id, { isFreeForGuest, isFreeForMember });
    }, 'Đã cập nhật giá Coin và quyền xem tập');

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
        <FormField label="Giá Coin (nhập 0 nếu hoàn toàn miễn phí)">
          <input
            type="number"
            min={0}
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
            <span className="text-secondary-foreground">Miễn phí cho Guest (chưa đăng nhập)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFreeForMember}
              onChange={(e) => setIsFreeForMember(e.target.checked)}
              className="rounded border-input text-sky-600 focus:ring-sky-500"
            />
            <span className="text-secondary-foreground">Miễn phí cho Member</span>
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
