'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { studioService } from '@/services/studioService';
import type { Studio, StudioInput } from '@/types/production';
import { useAction } from '@/hooks/useAction';

const EMAIL = /^\S+@\S+\.\S+$/;
const PHONE = /^[0-9+().\s-]{6,30}$/;

type Draft = Required<Omit<StudioInput, 'isActive'>>;

const draftOf = (studio: Studio | null): Draft => ({
  name: studio?.name ?? '',
  email: studio?.email ?? '',
  contactName: studio?.contactName ?? '',
  phone: studio?.phone ?? '',
  note: studio?.note ?? '',
});

/**
 * Adds a studio to the catalog or edits one: its legal name, where contract mails go (unique), the representative
 * who signs and how to reach it. The legal profile (address, tax code, bank account) is filled in by the studio
 * itself on Studio Web, so the Admin never types a partner's tax or bank data.
 */
export function StudioModal({ studio, onClose, onSaved }: { studio: Studio | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [draft, setDraft] = useState<Draft>(() => draftOf(studio));
  const { busy, run } = useAction({ onStale: onSaved });
  const set = (key: keyof Draft) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft({ ...draft, [key]: event.target.value });
  const phone = draft.phone.trim();
  const valid = draft.name.trim().length >= 2 && EMAIL.test(draft.email.trim()) && (!phone || PHONE.test(phone));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: StudioInput = {
      name: draft.name.trim(),
      email: draft.email.trim().toLowerCase(),
      ...(draft.contactName.trim() ? { contactName: draft.contactName.trim() } : {}),
      ...(phone ? { phone } : {}),
      ...(draft.note.trim() ? { note: draft.note.trim() } : {}),
    };
    const done = await run(
      () => (studio ? studioService.update(studio.id, input) : studioService.create(input)),
      studio ? 'Đã lưu Studio' : 'Đã thêm Studio',
    );
    if (done) {
      await onSaved();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={studio ? 'Sửa Studio' : 'Thêm Studio'} subtitle="Studio đối tác đăng nhập Studio Web bằng tài khoản Admin mở cho Studio.">
      <form onSubmit={submit} className="space-y-4">
        <FormField
          label="Tên Studio (tên pháp lý in trên hợp đồng)"
          error={draft.name && draft.name.trim().length < 2 ? 'Tên Studio cần ít nhất 2 ký tự.' : null}
          required
        >
          <input value={draft.name} onChange={set('name')} minLength={2} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <FormField
          label="Email nhận hợp đồng (không trùng Studio khác)"
          error={draft.email.trim() && !EMAIL.test(draft.email.trim()) ? 'Email chưa đúng định dạng.' : null}
          required
        >
          <input type="email" value={draft.email} onChange={set('email')} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Người đại diện ký hợp đồng">
            <input value={draft.contactName} onChange={set('contactName')} maxLength={255} className={fieldInputClass} />
          </FormField>
          <FormField label="Số điện thoại" error={phone && !PHONE.test(phone) ? 'Chỉ gồm 6–30 chữ số và các ký tự + ( ) . -' : null}>
            <input value={draft.phone} onChange={set('phone')} maxLength={30} className={fieldInputClass} />
          </FormField>
        </div>
        <p className="text-xs text-muted-foreground">
          Hồ sơ pháp lý (địa chỉ trụ sở, mã số thuế, tài khoản ngân hàng, chức vụ người đại diện) do Studio tự điền trên Studio Web trước khi ký hợp đồng.
        </p>
        <FormField label="Ghi chú">
          <textarea rows={3} value={draft.note} onChange={set('note')} maxLength={2000} className={fieldTextareaClass} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={!valid || busy}>
            Lưu
          </Button>
        </div>
      </form>
    </Modal>
  );
}
