'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { productionService } from '@/services/productionService';
import type { Publication, UnpublishMode, UnpublishReason } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { UNPUBLISH_MODE, UNPUBLISH_REASON } from '../../lib/labels';

/** The Admin takes a live episode down (to fix it, or for good) or cancels a scheduled release (BR-52, BR-56). */
export function UnpublishModal({ publication, onClose, onDone }: { publication: Publication; onClose: () => void; onDone: () => Promise<void> }) {
  const live = publication.publishedAt !== null;
  const [mode, setMode] = useState<UnpublishMode>('REVISION');
  const [reason, setReason] = useState<UnpublishReason>('MANUAL');
  const [note, setNote] = useState('');
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () => productionService.unpublish(publication.id, { ...(live ? { mode } : {}), reason, note: note.trim() }),
      live ? (mode === 'REVISION' ? 'Đã gỡ tập để sửa' : 'Đã gỡ hẳn tập') : 'Đã huỷ lịch phát hành',
    );
    if (done) await onDone();
  };

  return (
    <Modal open onClose={onClose} title={live ? 'Gỡ tập' : 'Huỷ lịch phát hành'}>
      <form onSubmit={submit} className="space-y-4 text-xs">
        {live && (
          <div role="radiogroup" aria-label="Cách gỡ" className="space-y-2">
            {(Object.keys(UNPUBLISH_MODE) as UnpublishMode[]).map((m) => (
              <label
                key={m}
                className={`block rounded-xl border p-3 cursor-pointer ${mode === m ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-500/10' : 'border-slate-200 dark:border-white/10'}`}
              >
                <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  <input type="radio" name="unpublish-mode" checked={mode === m} onChange={() => setMode(m)} />
                  {UNPUBLISH_MODE[m].label}
                </span>
                <span className="block mt-1 text-slate-500 dark:text-slate-400">{UNPUBLISH_MODE[m].hint}</span>
              </label>
            ))}
          </div>
        )}
        <FormField label="Lý do">
          <select value={reason} onChange={(e) => setReason(e.target.value as UnpublishReason)} className={fieldInputClass}>
            {(Object.keys(UNPUBLISH_REASON) as UnpublishReason[]).map((r) => (
              <option key={r} value={r}>
                {UNPUBLISH_REASON[r]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={live && mode === 'REVISION' ? 'Nhận xét gửi Reviewer / Studio' : 'Ghi chú'}>
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} minLength={5} maxLength={2000} required className={fieldTextareaClass} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button type="submit" variant="danger" disabled={busy || note.trim().length < 5}>
            {live ? 'Gỡ tập' : 'Huỷ lịch'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
