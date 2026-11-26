'use client';

import { useState } from 'react';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { FormField, fieldTextareaClass } from '@/components/ui/FormField';
import type { RiskDecision, RiskFlag } from '@/types/finance';

const COPY: Record<RiskDecision, { title: string; confirm: string; note: string }> = {
  ACCOUNT_LOCKED: { title: 'Khoá tài khoản này?', confirm: 'Khoá tài khoản', note: 'Lý do khoá' },
  DISMISSED: { title: 'Bỏ qua giao dịch này?', confirm: 'Bỏ qua', note: 'Ghi chú (tuỳ chọn)' },
};

/**
 * Asks once before the Admin acts on a risk flag. Locking signs the member out at once, so it needs a reason;
 * dismissing takes an optional note. Both are kept on the flag and in the audit log.
 */
export function RiskFlagActionModal({
  flag,
  decision,
  busy,
  onClose,
  onConfirm,
}: {
  flag: RiskFlag;
  decision: RiskDecision;
  busy: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState('');
  const member = flag.coinTransaction.wallet.user;
  const locking = decision === 'ACCOUNT_LOCKED';
  const copy = COPY[decision];

  return (
    <ConfirmModal
      open
      tone={locking ? 'danger' : 'info'}
      title={copy.title}
      description={
        <>
          <strong className="text-foreground">{member.fullName}</strong> · {member.email}
          <br />
          {flag.reason}
        </>
      }
      consequence={
        locking ? 'Member bị đăng xuất khỏi mọi thiết bị và không đăng nhập được nữa. Mở khoá lại ở trang Tài khoản.' : undefined
      }
      confirmLabel={copy.confirm}
      busy={busy}
      disabled={locking && !note.trim()}
      onClose={onClose}
      onConfirm={() => onConfirm(note.trim())}
    >
      <FormField label={copy.note} required={locking}>
        <textarea rows={3} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} className={fieldTextareaClass} />
      </FormField>
    </ConfirmModal>
  );
}
