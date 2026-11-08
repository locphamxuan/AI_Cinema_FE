'use client';

import { useState } from 'react';
import { Repeat } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { seasonLabel } from '@/lib/seasonLabel';
import { studioService } from '@/services/studioService';
import { formatVnd } from '@/lib/format';
import { swapPreview } from '../../lib/studioSwap';
import { useAction } from '@/hooks/useAction';
import { parseVnd } from '../shared/CostRequestCard';
import { FilePicker } from '../shared/FilePicker';
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
  /** Fixed fee (VND) the brief offers, typed as text. */
  fee: string;
}

/** Studio, season and files of the new brief a studio change sends. */
function HandoffFields(props: {
  studioName: string;
  studioEmail: string;
  studioPhone: string;
  seasonId: string;
  scripts: File[];
  references: File[];
  onChange: (patch: Partial<HandoffForm>) => void;
}) {
  const { project } = useProject();
  return (
    <>
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Studio nhận brief (nhập tay)</legend>
        <p className="text-[11px] text-slate-500">Email đã có trong hệ thống sẽ dùng lại Studio đó.</p>
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

const EMPTY: HandoffForm = { studioName: '', studioEmail: '', studioPhone: '', seasonId: '', scripts: [], references: [], fee: '' };

/** The fee the brief offers: whole thousands of VND, above 0 and within what the budget allows. */
function FeeField({ value, maxVnd, onChange }: { value: string; maxVnd: number; onChange: (fee: string) => void }) {
  const fee = parseVnd(value);
  const over = fee > maxVnd;
  return (
    <FormField label="Phí sản xuất đề xuất cho Studio (₫)">
      <input inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value)} required className={fieldInputClass} aria-label="Phí đề xuất" />
      <span className={`block mt-1 text-[11px] ${over ? 'text-rose-600' : 'text-slate-500'}`}>
        Phí trọn gói, không chia doanh thu. Tối đa {formatVnd(maxVnd)} (ngân sách còn lại).
        {over && ' Vượt ngân sách: Reviewer cần gửi Admin yêu cầu thêm chi phí sản xuất.'}
      </span>
    </FormField>
  );
}

const feeValid = (value: string, maxVnd: number) => {
  const fee = parseVnd(value);
  return fee > 0 && fee <= maxVnd;
};

/** The typed studio as the API takes it; nothing when the fields are left empty. */
function typedStudio(form: HandoffForm) {
  const email = form.studioEmail.trim();
  return email ? { studioEmail: email, studioName: form.studioName.trim(), studioPhone: form.studioPhone.trim() } : {};
}

const studioTyped = (form: HandoffForm) => form.studioEmail.trim() !== '' && form.studioName.trim().length >= 2;


export function ChangeStudioModal({ onClose }: { onClose: () => void }) {
  const { project, reload } = useProject();
  const [form, setForm] = useState(EMPTY);
  const [reason, setReason] = useState('');
  const [kept, setKept] = useState('');
  const { busy, run } = useAction();
  const keptVnd = kept.trim() ? parseVnd(kept) : 0;
  const preview = swapPreview(project, form.seasonId || null, keptVnd);
  const keptValid = !Number.isNaN(keptVnd) && keptVnd >= 0 && keptVnd <= preview.replacedFeeVnd;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        studioService.changeStudio(project.id, {
          ...typedStudio(form),
          ...(form.seasonId ? { seasonId: form.seasonId } : {}),
          reason: reason.trim(),
          offeredFeeVnd: parseVnd(form.fee),
          ...(keptVnd > 0 ? { forfeitedVnd: keptVnd } : {}),
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
        <HandoffFields {...form} onChange={(patch) => setForm({ ...form, ...patch })} />
        <FormField label="Studio cũ giữ lại (₫, đã chi hoặc đền bù)">
          <input inputMode="numeric" value={kept} onChange={(e) => setKept(e.target.value)} placeholder="0" className={fieldInputClass} aria-label="Studio cũ giữ lại" />
          <span className={`block mt-1 text-[11px] ${keptValid ? 'text-slate-500' : 'text-rose-600'}`}>
            Phí đã đề xuất cho Studio cũ: {formatVnd(preview.replacedFeeVnd)}. Phần còn lại trả về ngân sách.
          </span>
        </FormField>
        <FeeField value={form.fee} maxVnd={preview.maxOfferVnd} onChange={(fee) => setForm({ ...form, fee })} />
        <FormField label="Lý do đổi Studio (Reviewer sẽ nhận được)">
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} minLength={5} maxLength={2000} required className={fieldTextareaClass} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !keptValid || !feeValid(form.fee, preview.maxOfferVnd) || !studioTyped(form) || reason.trim().length < 5}>
            Đổi Studio
          </Button>
        </div>
      </form>
    </Modal>
  );
}
