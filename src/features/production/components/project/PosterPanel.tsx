'use client';

import { useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { productionService } from '@/services/productionService';
import { useAction } from '@/hooks/useAction';
import { Panel } from '@/components/data/ui';
import { useProject } from './ProjectContext';

const IMAGE_ACCEPT = 'image/*,.png,.jpg,.jpeg,.webp,.gif,.bmp,.avif';

/** The poster of the project (PNG, JPEG, WebP, GIF, BMP or AVIF, ≤ 20 MB) the catalog shows; the Reviewer uploads and replaces it. */
export function PosterPanel({ canManage }: { canManage: boolean }) {
  const { project, reload } = useProject();
  const input = useRef<HTMLInputElement>(null);
  const { busy, run } = useAction();

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (await run(() => productionService.uploadPoster(project.id, file), 'Đã cập nhật ảnh bìa')) await reload();
    if (input.current) input.current.value = '';
  };

  return (
    <Panel
      title="Ảnh bìa / thumbnail"
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
        <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">Chưa có ảnh bìa.</p>
      )}
    </Panel>
  );
}
