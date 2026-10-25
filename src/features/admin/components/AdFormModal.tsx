'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { MAX_AD_DURATION_SECONDS, MAX_AD_WEIGHT, adInputProblem } from '@/services/adAdminService';
import type { AdInput, AdminAd } from '@/types/playback';

/** `yyyy-mm-dd` of a stored instant, for a date input. */
export const dayOf = (iso: string | null): string => (iso ? iso.slice(0, 10) : '');
/** Start of that day in Vietnam (UTC+7), the zone the business days follow. */
export const instantOf = (day: string): string | null => (day ? new Date(`${day}T00:00:00+07:00`).toISOString() : null);

interface Props {
  /** Null creates a new ad. */
  ad: AdminAd | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: AdInput) => void;
}

/** Create or edit one mid-roll ad: its video, length, pick weight and the window it is drawn in. */
export function AdFormModal({ ad, busy, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState(ad?.title ?? '');
  const [mediaUrl, setMediaUrl] = useState(ad?.mediaUrl ?? '');
  const [clickUrl, setClickUrl] = useState(ad?.clickUrl ?? '');
  const [duration, setDuration] = useState(ad?.durationSeconds ?? 15);
  const [weight, setWeight] = useState(ad?.weight ?? 1);
  const [from, setFrom] = useState(dayOf(ad?.validFrom ?? null));
  const [to, setTo] = useState(dayOf(ad?.validTo ?? null));

  const input: AdInput = {
    title: title.trim(),
    mediaUrl: mediaUrl.trim(),
    // The BE takes null to clear the link of an existing ad and refuses an empty string.
    clickUrl: clickUrl.trim() || (ad ? null : undefined),
    durationSeconds: duration,
    weight,
    validFrom: instantOf(from) ?? (ad ? null : undefined),
    validTo: instantOf(to) ?? (ad ? null : undefined),
  };
  const problem = adInputProblem(input);

  return (
    <Modal open onClose={onClose} title={ad ? 'Sửa quảng cáo' : 'Tạo quảng cáo'} subtitle="Quảng cáo chèn giữa tập cho gói có quảng cáo." maxWidth="max-w-xl">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!problem) onSubmit(input);
        }}
      >
        <FormField label="Tên quảng cáo">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} className={fieldInputClass} required />
        </FormField>
        <FormField label="Link video (MP4)">
          <input type="url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} maxLength={1000} className={fieldInputClass} required />
        </FormField>
        {/^https?:\/\//i.test(mediaUrl) && (
          <video
            src={mediaUrl}
            controls
            muted
            className="w-full max-h-48 rounded-xl bg-black"
            onLoadedMetadata={(e) => !ad && setDuration(Math.max(1, Math.round(e.currentTarget.duration)))}
          />
        )}
        <FormField label="Link khi người xem bấm (không bắt buộc)">
          <input type="url" value={clickUrl} onChange={(e) => setClickUrl(e.target.value)} maxLength={1000} className={fieldInputClass} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label={`Thời lượng (giây, tối đa ${MAX_AD_DURATION_SECONDS})`}>
            <input type="number" min={1} max={MAX_AD_DURATION_SECONDS} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={fieldInputClass} />
          </FormField>
          <FormField label={`Trọng số (1-${MAX_AD_WEIGHT}, cao thì hiện nhiều hơn)`}>
            <input type="number" min={1} max={MAX_AD_WEIGHT} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className={fieldInputClass} />
          </FormField>
          <FormField label="Chạy từ ngày (bỏ trống = ngay)">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={fieldInputClass} />
          </FormField>
          <FormField label="Dừng từ ngày (bỏ trống = không hạn)">
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={fieldInputClass} />
          </FormField>
        </div>
        {problem && title && mediaUrl && <p role="alert" className="text-xs text-rose-600">{problem}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !!problem}>
            {ad ? 'Lưu' : 'Tạo quảng cáo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
