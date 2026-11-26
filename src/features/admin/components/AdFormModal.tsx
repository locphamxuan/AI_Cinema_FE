'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { formatDuration } from '@/lib/format';
import { MAX_AD_DURATION_SECONDS, MAX_AD_VIDEO_BYTES, adAdminService, adInputProblem } from '@/services/adAdminService';
import type { AdInput, AdminAd } from '@/types/playback';

interface Props {
  /** Null creates a new ad. */
  ad: AdminAd | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: AdInput) => void;
}

/**
 * Create or edit one mid-roll ad: its name and its video. Every active ad has the same chance at each cue. The viewer
 * watches the whole video, so its length is read from the file (here for the preview, by the BE when saving), never typed.
 */
export function AdFormModal({ ad, busy, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState(ad?.title ?? '');
  const [mediaUrl, setMediaUrl] = useState(ad?.mediaUrl ?? '');
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

  const input: AdInput = { title: title.trim(), mediaUrl: mediaUrl.trim() };
  const seconds = length?.url === mediaUrl ? length.seconds : null;
  const tooLong = seconds !== null && seconds > MAX_AD_DURATION_SECONDS;
  const problem = adInputProblem(input) ?? (tooLong ? `Video dài ${formatDuration(seconds)}, quảng cáo tối đa ${MAX_AD_DURATION_SECONDS / 60} phút.` : null);

  return (
    <Modal
      open
      onClose={onClose}
      title={ad ? 'Sửa quảng cáo' : 'Tạo quảng cáo'}
      subtitle="Quảng cáo chèn giữa tập cho gói có quảng cáo."
      maxWidth="max-w-lg"
    >
      <form
        className="space-y-4 text-xs"
        onSubmit={(e) => {
          e.preventDefault();
          if (!problem) onSubmit(input);
        }}
      >
        <FormField label="Tên quảng cáo" required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            placeholder="Ví dụ: Giới thiệu gói Tháng"
            className={`${fieldInputClass} text-xs py-2 rounded-xl`}
            required
          />
        </FormField>
        <FormField label="Video (MP4): dán link hoặc tải file từ máy" required>
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
            <label className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-medium text-secondary-foreground hover:bg-muted/60 transition ${uploading ? 'opacity-60' : 'cursor-pointer'}`}>
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
          <div className="space-y-1.5 rounded-xl bg-muted/60 border border-border p-2.5">
            <video
              src={mediaUrl}
              controls
              muted
              className="w-full max-h-44 rounded-lg bg-black"
              onLoadedMetadata={(e) => setLength({ url: mediaUrl, seconds: Math.round(e.currentTarget.duration) })}
            />
            <p className="text-[11px] text-muted-foreground">
              {seconds !== null
                ? `⏱ Dài ${formatDuration(seconds)}. Người xem phải xem hết quảng cáo mới xem tiếp phim được.`
                : 'Hệ thống tự lấy thời lượng từ video khi lưu.'}
            </p>
          </div>
        )}
        {problem && title && mediaUrl && <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 font-medium">{problem}</p>}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-full px-4 py-2 text-xs">
            Huỷ
          </Button>
          <Button
            type="submit"
            disabled={busy || uploading || !!problem}
            className="rounded-full px-5 py-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-colors"
          >
            {ad ? 'Lưu' : 'Tạo quảng cáo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
