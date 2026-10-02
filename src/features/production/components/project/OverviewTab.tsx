'use client';

import { useRef, useState } from 'react';
import { Download, Pencil, Upload, UserPlus, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { productionService } from '@/services/productionService';
import type { AgeRating, Person } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { EDITABLE_PROJECT, OPEN_PROJECT, isIn } from '../../lib/capabilities';
import { formatBytes, formatDateTime, saveBlob } from '../../lib/format';
import { GenrePicker } from '../shared/GenrePicker';
import { Empty, Facts, Panel, TextPromptModal } from '../shared/ui';
import { useProject } from './ProjectContext';

const IDEA_ACCEPT = '.pdf,.docx,.png,.jpg,.jpeg,.webp';

export function OverviewTab() {
  const { project, caps, reload } = useProject();
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { busy, run } = useAction();
  const canEdit = caps.manage && isIn(project.status, EDITABLE_PROJECT);
  const open = isIn(project.status, OPEN_PROJECT);

  const cancel = async (reason: string) => {
    if (await run(() => productionService.cancelProject(project.id, reason), 'Đã huỷ dự án')) {
      setCancelling(false);
      await reload();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Panel
          title="Thông tin phim"
          actions={
            canEdit && (
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Sửa
              </Button>
            )
          }
        >
          <Facts
            items={[
              ['Thể loại', project.genres.map((g) => g.name).join(', ') || '—'],
              ['Ngôn ngữ', project.defaultLanguage],
              ['Độ tuổi', project.ageRating ?? '—'],
              ['Năm phát hành', project.releaseYear ?? '—'],
              ['Tạo lúc', formatDateTime(project.createdAt)],
              ['Giao Creator', formatDateTime(project.assignedAt)],
              ['Bàn giao studio', formatDateTime(project.handedOffAt)],
              ['Hoàn tất', formatDateTime(project.completedAt)],
            ]}
          />
          <div className="mt-4 space-y-3 text-xs">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Ý tưởng gửi studio</p>
              <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{project.ideaDescription}</p>
            </div>
            {project.synopsis && (
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Tóm tắt cho người xem</p>
                <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{project.synopsis}</p>
              </div>
            )}
          </div>
        </Panel>

        <IdeaFilesPanel canUpload={caps.manage && open} />
      </div>

      <div className="space-y-5">
        <Panel title="Phân công">
          <Facts
            items={[
              ['Reviewer', project.reviewer.fullName],
              ['Content Creator', project.creator?.fullName ?? 'Chưa giao'],
            ]}
          />
          {caps.manage && open && (
            <>
              <Button
                size="sm"
                className="mt-4 w-full"
                variant="secondary"
                disabled={project.productionFeeTokens <= 0}
                onClick={() => setAssigning(true)}
              >
                <UserPlus className="w-3.5 h-3.5" aria-hidden="true" /> {project.creator ? 'Đổi Creator' : 'Giao Content Creator'}
              </Button>
              {project.productionFeeTokens <= 0 && (
                <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">Cấp phí sản xuất (tab Phí sản xuất) trước khi giao Creator.</p>
              )}
            </>
          )}
        </Panel>

        {caps.manage && open && (
          <Panel title="Huỷ dự án" description="Rút cả các lịch phát hành đang chờ. Không hoàn tác được.">
            <Button size="sm" variant="danger" className="w-full" onClick={() => setCancelling(true)}>
              <XCircle className="w-3.5 h-3.5" aria-hidden="true" /> Huỷ dự án
            </Button>
          </Panel>
        )}
      </div>

      {editing && <EditProjectModal onClose={() => setEditing(false)} />}
      {assigning && <AssignCreatorModal current={project.creator} onClose={() => setAssigning(false)} />}
      <TextPromptModal
        open={cancelling}
        title="Huỷ dự án"
        subtitle={project.title}
        label="Lý do huỷ"
        confirmLabel="Huỷ dự án"
        danger
        busy={busy}
        onClose={() => setCancelling(false)}
        onConfirm={cancel}
      />
    </div>
  );
}

function IdeaFilesPanel({ canUpload }: { canUpload: boolean }) {
  const { project, reload } = useProject();
  const input = useRef<HTMLInputElement>(null);
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

  return (
    <Panel
      title="File ý tưởng"
      description="Đi kèm brief gửi studio. PDF, DOCX hoặc ảnh, tối đa 20 MB; tải lại cùng tên sẽ tạo phiên bản mới."
      actions={
        canUpload && (
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
              <Button size="sm" variant="ghost" onClick={() => download(f.id, f.fileName)} aria-label={`Tải ${f.fileName}`}>
                <Download className="w-3.5 h-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function EditProjectModal({ onClose }: { onClose: () => void }) {
  const { project, reload } = useProject();
  const [title, setTitle] = useState(project.title);
  const [idea, setIdea] = useState(project.ideaDescription);
  const [synopsis, setSynopsis] = useState(project.synopsis ?? '');
  const [genreIds, setGenreIds] = useState(project.genres.map((g) => g.id));
  const [ageRating, setAgeRating] = useState<AgeRating | ''>(project.ageRating ?? '');
  const [releaseYear, setReleaseYear] = useState(project.releaseYear ? String(project.releaseYear) : '');
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        productionService.updateProject(project.id, {
          title: title.trim(),
          ideaDescription: idea.trim(),
          genreIds,
          ...(synopsis.trim() ? { synopsis: synopsis.trim() } : {}),
          ...(ageRating ? { ageRating } : {}),
          ...(releaseYear ? { releaseYear: Number(releaseYear) } : {}),
        }),
      'Đã lưu thông tin phim',
    );
    if (done) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title="Sửa thông tin phim" maxWidth="max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Tên phim">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <FormField label="Ý tưởng gửi studio (tối thiểu 20 ký tự)">
          <textarea rows={5} value={idea} onChange={(e) => setIdea(e.target.value)} minLength={20} maxLength={20000} className={fieldTextareaClass} />
        </FormField>
        <FormField label="Tóm tắt cho người xem">
          <textarea rows={3} value={synopsis} onChange={(e) => setSynopsis(e.target.value)} maxLength={5000} className={fieldTextareaClass} />
        </FormField>
        <div>
          <span className="block text-slate-600 dark:text-slate-300 mb-1 text-xs font-medium">Thể loại</span>
          <GenrePicker value={genreIds} onChange={setGenreIds} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Độ tuổi (BR-54)">
            <select value={ageRating} onChange={(e) => setAgeRating(e.target.value as AgeRating | '')} className={fieldInputClass}>
              <option value="">Chưa đặt</option>
              <option value="T16">T16</option>
              <option value="T18">T18</option>
            </select>
          </FormField>
          <FormField label="Năm phát hành">
            <input type="number" min={2000} max={2100} value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} className={fieldInputClass} />
          </FormField>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !title.trim() || idea.trim().length < 20 || genreIds.length === 0}>
            Lưu
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AssignCreatorModal({ current, onClose }: { current: Person | null; onClose: () => void }) {
  const { project, reload } = useProject();
  const creators = useResource('creators', () => productionService.listCreators());
  const [creatorId, setCreatorId] = useState(current?.id ?? '');
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await run(() => productionService.assignCreator(project.id, creatorId), 'Đã giao Content Creator')) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title="Giao Content Creator" subtitle="Creator sẽ bàn giao dự án cho studio và giao các tập.">
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Content Creator">
          <select value={creatorId} onChange={(e) => setCreatorId(e.target.value)} required className={fieldInputClass}>
            <option value="" disabled>
              {creators.loading ? 'Đang tải…' : 'Chọn Creator'}
            </option>
            {creators.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.email})
              </option>
            ))}
          </select>
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={!creatorId || creatorId === current?.id || busy}>
            Giao
          </Button>
        </div>
      </form>
    </Modal>
  );
}
