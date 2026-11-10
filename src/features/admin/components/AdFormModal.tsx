'use client';

import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { formatDuration } from '@/lib/format';
import { MAX_AD_DURATION_SECONDS, MAX_AD_VIDEO_BYTES, MAX_AD_WEIGHT, adAdminService, adInputProblem } from '@/services/adAdminService';
import type { AdInput, AdminAd } from '@/types/playback';

interface Props {
  /** Null creates a new ad. */
  ad: AdminAd | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: AdInput) => void;
}

/**
 * Create or edit one mid-roll ad: its video and how often the draw picks it. The viewer watches the whole
 * video, so its length is read from the file (here for the preview, by the BE when saving), never typed.
 */
export function AdFormModal({ ad, busy, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState(ad?.title ?? '');
  const [mediaUrl, setMediaUrl] = useState(ad?.mediaUrl ?? '');
  const [clickUrl, setClickUrl] = useState(ad?.clickUrl ?? '');
  const [weight, setWeight] = useState(ad?.weight ?? 1);
  const [uploading, setUploading] = useState(false);
  const [length, setLength] = useState<{ url: string; seconds: number } | null>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_AD_VIDEO_BYTES) {
      toast.error('File quá lớn', 'Video quảng cáo tối đa 100 MB.');
      return;
    }
    setUploading(true);
    try {
      const res = await adAdminService.uploadVideo(file);
      if (!res.success || !res.data) {
        toast.error('Không tải được video', res.message ?? 'Chỉ nhận file MP4.');
        return;
      }
      setMediaUrl(res.data.mediaUrl);
    } finally {
      setUploading(false);
    }
  };

  const input: AdInput = {
    title: title.trim(),
    mediaUrl: mediaUrl.trim(),
    // The BE takes null to clear the link of an existing ad and refuses an empty string.
    clickUrl: clickUrl.trim() || (ad ? null : undefined),
    weight,
  };
  const seconds = length?.url === mediaUrl ? length.seconds : null;
  const tooLong = seconds !== null && seconds > MAX_AD_DURATION_SECONDS;
  const problem = adInputProblem(input) ?? (tooLong ? `Video dài ${formatDuration(seconds)}, quảng cáo tối đa ${MAX_AD_DURATION_SECONDS / 60} phút.` : null);

  return (
    <Modal
      open
      onClose={onClose}
      title={ad ? 'Sửa quảng cáo' : 'Tạo quảng cáo'}
      subtitle="Quảng cáo chèn giữa tập cho gói có quảng cáo."
      icon={<Megaphone className="w-5 h-5" />}
      maxWidth="max-w-lg"
    >
      <form
        className="space-y-4 text-xs"
        onSubmit={(e) => {
          e.preventDefault();
          if (!problem) onSubmit(input);
        }}
      >
        <FormField label="Tên quảng cáo">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            placeholder="Ví dụ: Giới thiệu gói AI Cinema Premium"
            className={`${fieldInputClass} text-xs py-2 rounded-xl`}
            required
          />
        </FormField>
        <FormField label="Video (MP4): dán link hoặc tải file từ máy">
          <div className="flex gap-2">
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              maxLength={1000}
              placeholder="https://…"
              className={`${fieldInputClass} text-xs py-2 rounded-xl`}
              required
            />
            <label className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition ${uploading ? 'opacity-60' : 'cursor-pointer'}`}>
              {uploading ? 'Đang tải lên…' : 'Tải từ máy'}
              <input
                type="file"
                accept="video/mp4,.mp4,.m4v"
                className="sr-only"
                disabled={uploading}
                aria-label="Tải video quảng cáo từ máy"
                onChange={(e) => {
                  void upload(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </FormField>
        {/^https?:\/\//i.test(mediaUrl) && (
          <div className="space-y-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] p-2.5">
            <video
              src={mediaUrl}
              controls
              muted
              className="w-full max-h-44 rounded-lg bg-black"
              onLoadedMetadata={(e) => setLength({ url: mediaUrl, seconds: Math.round(e.currentTarget.duration) })}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {seconds !== null
                ? `⏱ Dài ${formatDuration(seconds)}. Người xem phải xem hết quảng cáo rồi mới bấm "Bỏ qua quảng cáo" để xem tiếp phim.`
                : 'Hệ thống tự lấy thời lượng từ video khi lưu.'}
            </p>
          </div>
        )}
        <FormField label="Link khi người xem bấm (không bắt buộc)">
          <input
            type="url"
            value={clickUrl}
            onChange={(e) => setClickUrl(e.target.value)}
            maxLength={1000}
            placeholder="https://example.com/landing-page"
            className={`${fieldInputClass} text-xs py-2 rounded-xl`}
          />
        </FormField>
        <FormField label={`Trọng số (1-${MAX_AD_WEIGHT}): số càng lớn, quảng cáo càng hay được chọn`}>
          <input
            type="number"
            min={1}
            max={MAX_AD_WEIGHT}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className={`${fieldInputClass} text-xs py-2 rounded-xl`}
          />
        </FormField>
        {problem && title && mediaUrl && <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 font-medium">{problem}</p>}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-full px-4 py-2 text-xs">
            Huỷ
          </Button>
          <Button
            type="submit"
            disabled={busy || uploading || !!problem}
            className="rounded-full px-5 py-2 text-xs font-semibold bg-[#121212] hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-xs transition-colors"
          >
            {ad ? 'Lưu' : 'Tạo quảng cáo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
