'use client';

import { useState } from 'react';
import { Repeat, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { seasonLabel } from '@/lib/seasonLabel';
import { studioService } from '@/services/studioService';
import { formatNumber } from '../../lib/format';
import { swapPreview } from '../../lib/studioSwap';
import { useAction } from '../../hooks/useAction';
import { FilePicker } from '../shared/FilePicker';
import { DeadlineList, deadlineUsable } from './DueDateRows';
import { useProject } from './ProjectContext';

const MATERIAL_ACCEPT = '.pdf,.docx,.txt,.png,.jpg,.jpeg,.webp';
const MATERIAL_HINT = 'PDF, DOCX, TXT UTF-8 hoặc ảnh; tối đa 10 tệp, mỗi tệp 50 MB.';

interface HandoffForm {
  studioName: string;
  studioEmail: string;
  studioPhone: string;
  seasonId: string;
  scripts: File[];
  references: File[];
}

/** Studio, season and files of a hand-off, shared by the first hand-off and a studio change. */
function HandoffFields(props: {
  studioName: string;
  studioEmail: string;
  studioPhone: string;
  seasonId: string;
  scripts: File[];
  references: File[];
  onChange: (patch: Partial<HandoffForm>) => void;
  /** The first hand-off may reuse the project's studio, so typing one is optional there. */
  studioRequired: boolean;
}) {
  const { project } = useProject();
  return (
    <>
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Studio nhận brief (nhập tay)</legend>
        {!props.studioRequired && project.studio && (
          <p className="text-[11px] text-slate-500">
            Để trống để gửi cho Studio của dự án: {project.studio.name}. Email đã có trong hệ thống sẽ dùng lại Studio đó.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Tên Studio">
            <input value={props.studioName} onChange={(e) => props.onChange({ studioName: e.target.value })} minLength={2} maxLength={255} className={fieldInputClass} aria-label="Tên Studio" />
          </FormField>
          <FormField label="Email nhận brief">
            <input type="email" value={props.studioEmail} onChange={(e) => props.onChange({ studioEmail: e.target.value })} maxLength={255} className={fieldInputClass} aria-label="Email Studio" />
          </FormField>
        </div>
        <FormField label="Số điện thoại (không bắt buộc)">
          <input value={props.studioPhone} onChange={(e) => props.onChange({ studioPhone: e.target.value })} maxLength={30} className={fieldInputClass} aria-label="Số điện thoại Studio" />
        </FormField>
      </fieldset>
      <FormField label="Phạm vi bàn giao">
        <select value={props.seasonId} onChange={(e) => props.onChange({ seasonId: e.target.value })} className={fieldInputClass} aria-label="Phạm vi bàn giao">
          <option value="">Cả dự án (mọi tập chưa giao)</option>
          {project.seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {seasonLabel(season.seasonNumber, season.episodes.length, season.title)}
            </option>
          ))}
        </select>
      </FormField>
      <FilePicker label="Kịch bản gửi kèm" accept={MATERIAL_ACCEPT} files={props.scripts} onChange={(scripts) => props.onChange({ scripts })} hint={MATERIAL_HINT} />
      <FilePicker label="Tài liệu tham khảo (material)" accept={MATERIAL_ACCEPT} files={props.references} onChange={(references) => props.onChange({ references })} />
    </>
  );
}

const EMPTY: HandoffForm = { studioName: '', studioEmail: '', studioPhone: '', seasonId: '', scripts: [], references: [] };

/** The typed studio as the API takes it; nothing when the fields are left empty. */
function typedStudio(form: HandoffForm) {
  const email = form.studioEmail.trim();
  return email ? { studioEmail: email, studioName: form.studioName.trim(), studioPhone: form.studioPhone.trim() } : {};
}

const studioTyped = (form: HandoffForm) => form.studioEmail.trim() !== '' && form.studioName.trim().length >= 2;

export function HandOffModal({ onClose }: { onClose: () => void }) {
  const { project, reload } = useProject();
  const [form, setForm] = useState(EMPTY);
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
          ...typedStudio(form),
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
          {!ready && <p className="text-[11px] text-rose-600">Không có tập nào để bàn giao, hoặc có tập chưa có hạn giao / hạn đã qua - Reviewer cần cập nhật trước.</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !ready || (project.studio ? form.studioEmail.trim() !== '' && !studioTyped(form) : !studioTyped(form))}>
            {busy ? 'Đang gửi…' : 'Gửi brief'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ChangeStudioModal({ onClose, onAskTokens }: { onClose: () => void; onAskTokens?: () => void }) {
  const { project, reload } = useProject();
  const [form, setForm] = useState(EMPTY);
  const [reason, setReason] = useState('');
  const { busy, run } = useAction();
  const preview = swapPreview(project, form.seasonId || null);
  const funded = preview.availableTokens > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        studioService.changeStudio(project.id, {
          ...typedStudio(form),
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
        <SwapCost lostTokens={preview.lostTokens} availableTokens={preview.availableTokens} onAskTokens={onAskTokens} />
        <FormField label="Lý do đổi Studio (Reviewer sẽ nhận được)">
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} minLength={5} maxLength={2000} required className={fieldTextareaClass} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !funded || !studioTyped(form) || reason.trim().length < 5}>
            Đổi Studio
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** BR-59: the old studio keeps what it was promised; the new one needs Token the season still has. */
function SwapCost({ lostTokens, availableTokens, onAskTokens }: { lostTokens: number; availableTokens: number; onAskTokens?: () => void }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs space-y-1 ${availableTokens > 0 ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200' : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'}`}>
      <p>
        Token đã gửi cho Studio cũ sẽ mất, không hoàn: <strong className="tabular-nums">{formatNumber(lostTokens)}</strong> Token.
      </p>
      <p>
        Brief cho Studio mới sẽ ghi: <strong className="tabular-nums">{formatNumber(availableTokens)}</strong> Token.
      </p>
      {availableTokens === 0 && (
        <p>
          Phạm vi này đã hết Token. Hãy xin Reviewer cấp thêm trước khi đổi Studio.{' '}
          {onAskTokens && (
            <button type="button" onClick={onAskTokens} className="underline font-semibold cursor-pointer">
              Xin thêm Token
            </button>
          )}
        </p>
      )}
    </div>
  );
}
