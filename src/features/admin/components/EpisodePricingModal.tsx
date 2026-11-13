'use client';

import { useState } from 'react';
import { Coins } from 'lucide-react';
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
      await productionService.setCoinPrice(episode.id, priceValue);
      await productionService.setAccessFlags(episode.id, { isFreeForGuest, isFreeForMember });
      return true;
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
      icon={<Coins className="w-5 h-5 text-amber-500" />}
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

        <div className="space-y-2 rounded-xl border border-slate-200/80 dark:border-white/10 p-3 bg-slate-50/50 dark:bg-white/[0.02]">
          <p className="font-semibold text-slate-700 dark:text-slate-200">Khoá / Mở tập miễn phí</p>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFreeForGuest}
              onChange={(e) => setIsFreeForGuest(e.target.checked)}
              className="rounded border-slate-300 dark:border-white/20 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-slate-700 dark:text-slate-200">Miễn phí cho khách vãng lai (Guest)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFreeForMember}
              onChange={(e) => setIsFreeForMember(e.target.checked)}
              className="rounded border-slate-300 dark:border-white/20 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-slate-700 dark:text-slate-200">Miễn phí cho thành viên thường (Member)</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
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
