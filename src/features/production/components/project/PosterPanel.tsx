'use client';

import { useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { productionService } from '@/services/productionService';
import { useAction } from '@/hooks/useAction';
import { Panel } from '@/components/data/ui';
import { toast } from '@/components/ui/Toast';
import { formatBytes, formatDateTime } from '@/lib/format';
import { downloadFile } from '../../lib/download';
import { useProject } from './ProjectContext';

const IMAGE_ACCEPT = 'image/*,.png,.jpg,.jpeg,.webp,.gif,.bmp,.avif';
/** The backend's poster size limit (ARTWORK_MAX_BYTES). */
const POSTER_MAX_BYTES = 20 * 1024 * 1024;

/**
 * The poster of the project (PNG, JPEG, WebP, GIF, BMP or AVIF, ≤ 20 MB) the catalog shows; the Reviewer uploads and
 * replaces it. The poster image the studio sent is downloaded here first, then uploaded as the poster.
 */
export function PosterPanel({ canManage }: { canManage: boolean }) {
  const { project, caps, reload } = useProject();
  const input = useRef<HTMLInputElement>(null);
  const { busy, run } = useAction({ onStale: reload });
  const [fetching, setFetching] = useState(false);
  const studioPoster = project.studioPoster;

  const downloadStudioPoster = async () => {
    if (!studioPoster) return;
    setFetching(true);
    try {
      await downloadFile(() => productionService.downloadStudioPoster(project.id), studioPoster.fileName);
    } finally {
      setFetching(false);
    }
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > POSTER_MAX_BYTES) {
      toast.error('Ảnh quá lớn', `${file.name} nặng ${formatBytes(file.size)}; ảnh bìa tối đa 20 MB.`);
      if (input.current) input.current.value = '';
      return;
    }
    if (await run(() => productionService.uploadPoster(project.id, file), 'Đã cập nhật ảnh bìa')) await reload();
    if (input.current) input.current.value = '';
  };

  return (
    <Panel
      title="Ảnh bìa"
      description="PNG, JPEG, WebP, GIF, BMP hoặc AVIF, tối đa 20 MB."
      actions={
        canManage && (
          <>
            <input ref={input} type="file" accept={IMAGE_ACCEPT} className="hidden" aria-label="Chọn ảnh bìa" onChange={(e) => upload(e.target.files?.[0])} />
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? 'Đang tải…' : project.posterUrl ? 'Đổi ảnh' : 'Tải ảnh'}
            </Button>
          </>
        )
      }
    >
      {project.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- the poster lives in the backend's storage, not in next/image's allow-list
        <img src={project.posterUrl} alt={`Ảnh bìa phim ${project.title}`} className="w-full rounded-lg object-cover aspect-[2/3]" />
      ) : (
        <p className="text-xs text-muted-foreground py-6 text-center">Chưa có ảnh bìa.</p>
      )}
      {studioPoster && caps.studioPoster && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Poster Studio đã nộp: <span className="font-medium text-foreground break-all">{studioPoster.fileName}</span> ·{' '}
            {formatDateTime(studioPoster.uploadedAt)}
          </p>
          <Button size="sm" variant="secondary" className="w-full" disabled={fetching} onClick={() => void downloadStudioPoster()}>
            {fetching ? 'Đang tải…' : 'Tải poster của Studio'}
          </Button>
        </div>
      )}
    </Panel>
  );
}
