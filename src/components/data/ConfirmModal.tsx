'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal, type ModalTone } from '@/components/ui/Modal';

type ConfirmTone = Extract<ModalTone, 'info' | 'warning' | 'danger'>;

const ICON: Record<ConfirmTone, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: 'bg-primary/10 text-primary' },
  warning: { icon: AlertTriangle, className: 'bg-highlight/15 text-highlight-foreground dark:text-highlight' },
  danger: { icon: ShieldAlert, className: 'bg-destructive/10 text-destructive' },
};

/**
 * Asks once before an action that changes data: what will happen, the facts it acts on (`details`) and what
 * follows (`consequence`), then two equal buttons — cancel on the left, the action named as what it does on the
 * right. The tone colours the band and the icon; `danger` is kept as a shorthand for the danger tone.
 */
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  tone,
  details,
  consequence,
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
  tone?: ConfirmTone;
  details?: [string, ReactNode][];
  consequence?: ReactNode;
  busy?: boolean;
  disabled?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: ReactNode;
}) {
  const kind: ConfirmTone = tone ?? (danger ? 'danger' : 'info');
  const { icon: Icon, className } = ICON[kind];
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md" tone={kind}>
      <div className="space-y-4">
        <div className="flex gap-3">
          <span className={`mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl ${className}`}>
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div className="text-sm leading-relaxed text-muted-foreground">{description}</div>
        </div>
        {details && details.length > 0 && (
          <dl className="divide-y divide-border rounded-xl border border-border text-sm">
            {details.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 px-3 py-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium tabular-nums text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {consequence && (
          <p className="rounded-xl bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Sau khi xác nhận: </span>
            {consequence}
          </p>
        )}
        {children}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Huỷ
          </Button>
          <Button type="button" variant={kind === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} disabled={busy || disabled}>
            {busy ? 'Đang xử lý…' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
