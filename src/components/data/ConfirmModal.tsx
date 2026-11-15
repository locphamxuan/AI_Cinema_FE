'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

/**
 * Asks once before an action that changes data: what will happen, then two equal buttons — cancel on the left,
 * the action (named as what it does) on the right. `children` holds extra fields, e.g. an optional note.
 */
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  busy = false,
  disabled = false,
  onClose,
  onConfirm,
  children,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  disabled?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: ReactNode;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="text-sm leading-relaxed text-muted-foreground">{description}</div>
        {children}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Huỷ
          </Button>
          <Button type="button" variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={busy || disabled}>
            {busy ? 'Đang xử lý…' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
