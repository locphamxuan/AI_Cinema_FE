'use client';

import { useRef, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { productionService } from '@/services/productionService';
import type { IdeaFile, IdeaFilePurpose } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { ATTACHMENT_ACCEPT, ATTACHMENT_HINT } from '../../lib/attachments';
import { downloadFile } from '../../lib/download';
import { formatBytes } from '@/lib/format';
import { Empty, Panel } from '@/components/data/ui';
import { useProject } from './ProjectContext';

const COPY: Record<IdeaFilePurpose, { title: string; description: string; noun: string }> = {
  IDEA: {
    title: 'Tệp ý tưởng gửi Studio',
    description: `Đi kèm brief khi bàn giao Studio. ${ATTACHMENT_HINT} Tải lại cùng tên sẽ tạo phiên bản mới.`,
    noun: 'tệp ý tưởng',
  },
  SYNOPSIS: {
    title: 'Tệp tóm tắt cho người xem',
    description: `Tư liệu cho phần tóm tắt hiển thị trên trang phim. ${ATTACHMENT_HINT}`,
    noun: 'tệp tóm tắt',
  },
};

/** Files of one purpose; the Reviewer uploads and removes them while the project is open. */
export function IdeaFilesPanel({ canManage, purpose = 'IDEA' }: { canManage: boolean; purpose?: IdeaFilePurpose }) {
  const copy = COPY[purpose];
  const { project, reload } = useProject();
  const input = useRef<HTMLInputElement>(null);
  const [removing, setRemoving] = useState<IdeaFile | null>(null);
  const { busy, run } = useAction();
  // Files saved before purposes existed have none: they are idea files.
  const files = project.ideaFiles.filter((f) => (f.purpose ?? 'IDEA') === purpose);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (await run(() => productionService.uploadIdeaFile(project.id, file, purpose), `Đã tải ${copy.noun}`)) await reload();
    if (input.current) input.current.value = '';
  };

  const download = async (fileId: string, name: string) => {
    await downloadFile(() => productionService.downloadIdeaFile(project.id, fileId), name);
  };

  const remove = async () => {
    if (!removing) return;
    if (await run(() => productionService.deleteIdeaFile(project.id, removing.id), `Đã xoá ${copy.noun}`)) {
      setRemoving(null);
      await reload();
    }
  };

  return (
    <Panel
      title={copy.title}
      description={copy.description}
      actions={
        canManage && (
          <>
            <input ref={input} type="file" accept={ATTACHMENT_ACCEPT} className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? 'Đang tải…' : 'Tải lên'}
            </Button>
          </>
        )
      }
    >
      {files.length === 0 ? (
        <Empty>Chưa có file nào.</Empty>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
          {files.map((f) => (
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
        title={`Xoá ${copy.noun}`}
        subtitle={removing ? `${removing.fileName} · v${removing.version}` : undefined}
      >
        <p className="text-xs text-slate-600 dark:text-slate-300">Tệp sẽ bị gỡ khỏi dự án{purpose === 'IDEA' ? ' và không còn đi kèm brief gửi Studio' : ''}.</p>
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
