'use client';

import { useState } from 'react';
import { Repeat, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { studioService } from '@/services/studioService';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { FilePicker } from '../shared/FilePicker';
import { DeadlineList, deadlineUsable } from './DueDateRows';
import { useProject } from './ProjectContext';

const MATERIAL_ACCEPT = '.pdf,.docx,.txt,.png,.jpg,.jpeg,.webp';
const MATERIAL_HINT = 'PDF, DOCX, TXT UTF-8 hoặc ảnh; tối đa 10 tệp, mỗi tệp 50 MB.';

/** Studio, season and files of a hand-off, shared by the first hand-off and a studio change. */
function HandoffFields(props: {
  studioId: string;
  seasonId: string;
  scripts: File[];
  references: File[];
  /** Season ids that can still be chosen; empty for the studio change, which asks for its own scope. */
  onChange: (patch: Partial<{ studioId: string; seasonId: string; scripts: File[]; references: File[] }>) => void;
  studioRequired: boolean;
}) {
  const { project } = useProject();
  const studios = useResource('studios:active', () => studioService.list(true));
  return (
    <>
      <FormField label="Studio nhận brief">
        <select
          value={props.studioId}
          onChange={(e) => props.onChange({ studioId: e.target.value })}
          required={props.studioRequired}
          className={fieldInputClass}
          aria-label="Studio nhận brief"
        >
          <option value="" disabled={props.studioRequired}>
            {studios.loading ? 'Đang tải…' : props.studioRequired ? 'Chọn Studio' : `Studio của dự án (${project.studio?.name ?? 'chưa chọn'})`}
          </option>
          {studios.data?.map((studio) => (
            <option key={studio.id} value={studio.id}>
              {studio.name} — {studio.email}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Phạm vi bàn giao">
        <select value={props.seasonId} onChange={(e) => props.onChange({ seasonId: e.target.value })} className={fieldInputClass} aria-label="Phạm vi bàn giao">
          <option value="">Cả dự án (mọi tập chưa giao)</option>
          {project.seasons.map((season) => (
            <option key={season.id} value={season.id}>
              Mùa {season.seasonNumber}
              {season.title && season.title !== `Mùa ${season.seasonNumber}` ? ` — ${season.title}` : ''}
            </option>
          ))}
        </select>
      </FormField>
      <FilePicker label="Kịch bản gửi kèm" accept={MATERIAL_ACCEPT} files={props.scripts} onChange={(scripts) => props.onChange({ scripts })} hint={MATERIAL_HINT} />
      <FilePicker label="Tài liệu tham khảo (material)" accept={MATERIAL_ACCEPT} files={props.references} onChange={(references) => props.onChange({ references })} />
    </>
  );
}

const EMPTY = { studioId: '', seasonId: '', scripts: [] as File[], references: [] as File[] };

export function HandOffModal({ onClose }: { onClose: () => void }) {
  const { project, reload } = useProject();
  const [form, setForm] = useState({ ...EMPTY, studioId: project.studio?.id ?? '' });
  const { busy, run } = useAction();
  const episodes = project.seasons
    .filter((s) => !form.seasonId || s.id === form.seasonId)
    .flatMap((s) => s.episodes)
    .filter((e) => !e.dueDate);
  const ready = episodes.length > 0 && episodes.every(deadlineUsable);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        studioService.handOff(project.id, {
          ...(form.studioId ? { studioId: form.studioId } : {}),
          ...(form.seasonId ? { seasonId: form.seasonId } : {}),
          scripts: form.scripts,
          references: form.references,
        }),
      'Đã gửi brief cho Studio',
    );
    if (done) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Bàn giao cho Studio"
      subtitle="Brief PDF, kịch bản và material được email cho Studio đối tác bên thứ 3; Studio không có tài khoản."
      icon={<Send className="w-4 h-4" />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={submit} className="space-y-4">
        <HandoffFields {...form} studioRequired={!project.studio} onChange={(patch) => setForm({ ...form, ...patch })} />
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Hạn giao của các tập sẽ bàn giao</p>
          <p className="text-[11px] text-slate-500">Studio phải giao đúng hạn Reviewer đã đặt; muốn đổi hạn hãy báo Reviewer.</p>
          <DeadlineList episodes={episodes} />
          {!ready && <p className="text-[11px] text-rose-600">Không có tập nào để bàn giao, hoặc có tập chưa có hạn giao / hạn đã qua — Reviewer cần cập nhật trước.</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !ready || (!form.studioId && !project.studio)}>
            {busy ? 'Đang gửi…' : 'Gửi brief'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ChangeStudioModal({ onClose }: { onClose: () => void }) {
  const { project, reload } = useProject();
  const [form, setForm] = useState(EMPTY);
  const [reason, setReason] = useState('');
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        studioService.changeStudio(project.id, {
          studioId: form.studioId,
          ...(form.seasonId ? { seasonId: form.seasonId } : {}),
          reason: reason.trim(),
          scripts: form.scripts,
          references: form.references,
        }),
      'Đã đổi Studio và gửi brief mới',
    );
    if (done) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title="Đổi Studio" subtitle="Đợt bàn giao cũ chuyển sang “Đã đổi Studio”; Studio mới nhận brief mới." icon={<Repeat className="w-4 h-4" />} maxWidth="max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        <HandoffFields {...form} studioRequired onChange={(patch) => setForm({ ...form, ...patch })} />
        <FormField label="Lý do đổi Studio">
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} minLength={5} maxLength={2000} required className={fieldTextareaClass} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !form.studioId || reason.trim().length < 5}>
            Đổi Studio
          </Button>
        </div>
      </form>
    </Modal>
  );
}
