'use client';

import { useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FormField, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import type { Tone } from '../../lib/labels';

export const CARD = 'bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10';

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
      <header className="flex flex-wrap items-start justify-between gap-2 px-5 py-3 border-b border-slate-100 dark:border-white/5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Loading({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-6 justify-center" role="status">
      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> {label}
    </p>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
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
  return <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">{children}</p>;
}

/** Label/value pairs in two columns. */
/** Label/value pairs; `stacked` keeps one pair per row for narrow side panels. */
export function Facts({ items, stacked = false }: { items: [string, ReactNode][]; stacked?: boolean }) {
  return (
    <dl className={`grid grid-cols-1 ${stacked ? '' : 'sm:grid-cols-2'} gap-x-6 gap-y-2 text-xs`}>
      {items.map(([label, value]) => (
        <div key={label} className="flex gap-2 min-w-0">
          <dt className="text-slate-500 dark:text-slate-400 shrink-0 w-32">{label}</dt>
          <dd className="text-slate-800 dark:text-slate-200 min-w-0 break-words">{value}</dd>
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
          <p className="text-[11px] text-amber-600 dark:text-amber-400">Cần ít nhất {minLength} ký tự.</p>
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
