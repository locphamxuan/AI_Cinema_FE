'use client';

import { useRef, useState } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { productionService } from '@/services/productionService';
import type { IdeaFile } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { formatBytes, saveBlob } from '../../lib/format';
import { Empty, Panel } from '../shared/ui';
import { useProject } from './ProjectContext';

const IDEA_ACCEPT = '.pdf,.docx,.png,.jpg,.jpeg,.webp';

/** Idea files that travel with the studio brief; the Reviewer uploads and removes them while the project is open. */
export function IdeaFilesPanel({ canManage }: { canManage: boolean }) {
  const { project, reload } = useProject();
  const input = useRef<HTMLInputElement>(null);
  const [removing, setRemoving] = useState<IdeaFile | null>(null);
  const { busy, run } = useAction();

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (await run(() => productionService.uploadIdeaFile(project.id, file), 'Đã tải file ý tưởng')) await reload();
    if (input.current) input.current.value = '';
  };

  const download = async (fileId: string, name: string) => {
    const blob = await productionService.downloadIdeaFile(project.id, fileId);
    if (blob) saveBlob(blob, name);
  };

  const remove = async () => {
    if (!removing) return;
    if (await run(() => productionService.deleteIdeaFile(project.id, removing.id), 'Đã xoá file ý tưởng')) {
      setRemoving(null);
      await reload();
    }
  };

  return (
    <Panel
      title="File ý tưởng"
      description="Đi kèm brief gửi studio. PDF, DOCX hoặc ảnh, tối đa 20 MB; tải lại cùng tên sẽ tạo phiên bản mới."
      actions={
        canManage && (
          <>
            <input ref={input} type="file" accept={IDEA_ACCEPT} className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
              <Upload className="w-3.5 h-3.5" aria-hidden="true" /> {busy ? 'Đang tải…' : 'Tải lên'}
            </Button>
          </>
        )
      }
    >
      {project.ideaFiles.length === 0 ? (
        <Empty>Chưa có file nào.</Empty>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
          {project.ideaFiles.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 py-2">
              <span className="min-w-0 truncate text-slate-800 dark:text-slate-200">
                {f.fileName} <span className="text-slate-400">· v{f.version} · {formatBytes(f.sizeBytes)}</span>
              </span>
              <span className="flex shrink-0 gap-1">
                <Button size="sm" variant="ghost" onClick={() => download(f.id, f.fileName)} aria-label={`Tải ${f.fileName}`}>
                  <Download className="w-3.5 h-3.5" />
                </Button>
                {canManage && (
                  <Button size="sm" variant="ghost" onClick={() => setRemoving(f)} aria-label={`Xoá ${f.fileName} v${f.version}`}>
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Modal
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="Xoá file ý tưởng"
        subtitle={removing ? `${removing.fileName} · v${removing.version}` : undefined}
      >
        <p className="text-xs text-slate-600 dark:text-slate-300">File sẽ bị gỡ khỏi dự án và không còn đi kèm brief gửi studio.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setRemoving(null)}>
            Huỷ
          </Button>
          <Button type="button" variant="danger" disabled={busy} onClick={remove}>
            Xoá file
          </Button>
        </div>
      </Modal>
    </Panel>
  );
}
