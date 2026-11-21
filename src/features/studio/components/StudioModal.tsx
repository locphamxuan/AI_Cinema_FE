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

/** The legal profile printed as Bên B of the contract; sent even when emptied, so a field can be cleared. */
const LEGAL_FIELDS: { key: 'address' | 'taxCode' | 'bankAccount' | 'representativeTitle'; label: string; max: number }[] = [
  { key: 'address', label: 'Địa chỉ trụ sở', max: 500 },
  { key: 'taxCode', label: 'Mã số thuế', max: 50 },
  { key: 'bankAccount', label: 'Tài khoản ngân hàng', max: 255 },
  { key: 'representativeTitle', label: 'Chức vụ người đại diện', max: 100 },
];

const draftOf = (studio: Studio | null): Draft => ({
  name: studio?.name ?? '',
  email: studio?.email ?? '',
  contactName: studio?.contactName ?? '',
  phone: studio?.phone ?? '',
  note: studio?.note ?? '',
  address: studio?.address ?? '',
  taxCode: studio?.taxCode ?? '',
  bankAccount: studio?.bankAccount ?? '',
  representativeTitle: studio?.representativeTitle ?? '',
});

/**
 * Adds a studio to the catalog or edits one: how to reach it, and the legal profile the system fills Bên B of
 * its production contract with. The email is where contract mails go and must be unique.
 */
export function StudioModal({ studio, onClose, onSaved }: { studio: Studio | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [draft, setDraft] = useState<Draft>(() => draftOf(studio));
  const { busy, run } = useAction();
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
      ...Object.fromEntries(LEGAL_FIELDS.map(({ key }) => [key, draft[key].trim()])),
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
        <FormField label="Tên Studio (tên pháp lý in trên hợp đồng)">
          <input value={draft.name} onChange={set('name')} minLength={2} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <FormField label="Email nhận hợp đồng (không trùng Studio khác)">
          <input type="email" value={draft.email} onChange={set('email')} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Người đại diện ký hợp đồng">
            <input value={draft.contactName} onChange={set('contactName')} maxLength={255} className={fieldInputClass} />
          </FormField>
          <FormField label="Số điện thoại">
            <input value={draft.phone} onChange={set('phone')} maxLength={30} className={fieldInputClass} />
          </FormField>
        </div>
        <fieldset className="space-y-3 rounded-2xl border border-border p-3">
          <legend className="px-1 text-xs font-semibold">Hồ sơ pháp lý (Bên B của hợp đồng)</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LEGAL_FIELDS.map(({ key, label, max }) => (
              <FormField key={key} label={label} className={key === 'address' ? 'sm:col-span-2' : ''}>
                <input value={draft[key]} onChange={set(key)} maxLength={max} className={fieldInputClass} />
              </FormField>
            ))}
          </div>
        </fieldset>
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
