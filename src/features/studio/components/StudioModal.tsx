'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { studioService } from '@/services/studioService';
import type { Studio, StudioInput } from '@/types/production';
import { useAction } from '@/features/production/hooks/useAction';

const EMAIL = /^\S+@\S+\.\S+$/;
const PHONE = /^[0-9+().\s-]{6,30}$/;

/** Adds a studio to the catalog or edits one; the email is where briefs are sent and must be unique. */
export function StudioModal({ studio, onClose, onSaved }: { studio: Studio | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(studio?.name ?? '');
  const [email, setEmail] = useState(studio?.email ?? '');
  const [contactName, setContactName] = useState(studio?.contactName ?? '');
  const [phone, setPhone] = useState(studio?.phone ?? '');
  const [note, setNote] = useState(studio?.note ?? '');
  const { busy, run } = useAction();
  const valid = name.trim().length >= 2 && EMAIL.test(email.trim()) && (!phone.trim() || PHONE.test(phone.trim()));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: StudioInput = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      ...(contactName.trim() ? { contactName: contactName.trim() } : {}),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
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
    <Modal open onClose={onClose} title={studio ? 'Sửa Studio' : 'Thêm Studio'} subtitle="Studio đối tác bên thứ 3, không có tài khoản trên hệ thống.">
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Tên Studio">
          <input value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <FormField label="Email nhận brief (không trùng Studio khác)">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Người liên hệ">
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} maxLength={255} className={fieldInputClass} />
          </FormField>
          <FormField label="Số điện thoại">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} className={fieldInputClass} />
          </FormField>
        </div>
        <FormField label="Ghi chú">
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} className={fieldTextareaClass} />
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
