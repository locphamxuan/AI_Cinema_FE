'use client';

import { useState, type ReactNode } from 'react';
import { Inbox, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FormField, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import type { Tone } from '../../lib/labels';

export const CARD = 'rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 shadow-xs';

export function StatusPill({ label, tone }: { label: string; tone: Tone }) {
  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  );
}

/** A titled card; `actions` sits on the right of the title. */
export function Panel({
  title,
  description,
  actions,
  children,
  className = '',
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${CARD} ${className}`} aria-label={title}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-6 pt-5 pb-4">
        <div className="min-w-0 max-w-prose">
          <h2 className="font-heading text-base font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

export function Loading({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div role="status" className="space-y-3 py-6">
      <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> {label}
      </p>
      <div className="mx-auto max-w-md space-y-2" aria-hidden="true">
        <div className="h-3 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-4/5 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-3/5 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/8 p-4 text-sm text-destructive">
      <span>{message}</span>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-prose flex-col items-center gap-3 py-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Inbox className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

/** Label/value pairs in two columns; `stacked` keeps one pair per row for narrow side panels. */
export function Facts({ items, stacked = false }: { items: [string, ReactNode][]; stacked?: boolean }) {
  return (
    <dl className={`grid grid-cols-1 ${stacked ? '' : 'sm:grid-cols-2'} gap-x-8 gap-y-2.5 text-sm`}>
      {items.map(([label, value]) => (
        <div key={label} className="flex gap-2 min-w-0">
          <dt className="w-36 shrink-0 text-muted-foreground">{label}</dt>
          <dd className="min-w-0 font-medium break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Asks for a short text (a reason, a note) before a decision; `required` blocks an empty one. */
export function TextPromptModal({
  open,
  title,
  subtitle,
  label,
  placeholder,
  confirmLabel,
  danger,
  required = true,
  minLength = 5,
  busy,
  onClose,
  onConfirm,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  label: string;
  placeholder?: string;
  confirmLabel: string;
  danger?: boolean;
  required?: boolean;
  /** The backend's shortest accepted reason. */
  minLength?: number;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
  children?: ReactNode;
}) {
  const [text, setText] = useState('');
  const blocked = required && text.trim().length < minLength;

  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!blocked) onConfirm(text.trim());
        }}
      >
        {children}
        <FormField label={label}>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className={fieldTextareaClass}
            required={required}
            maxLength={2000}
          />
        </FormField>
        {required && text.trim().length > 0 && blocked && (
          <p className="text-xs text-amber-700 dark:text-amber-400">Viết ít nhất {minLength} ký tự.</p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" variant={danger ? 'danger' : 'primary'} disabled={blocked || busy}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
