'use client';

import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/dialog';
import { cn } from '@/lib/utils';

/** What a dialog is about: the clapper band across its top carries the colour, so the stakes read at a glance. */
export type ModalTone = 'neutral' | 'info' | 'warning' | 'danger' | 'success';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
  tone?: ModalTone;
}

const SM_MAX_WIDTH: Record<string, string> = {
  'max-w-sm': 'sm:max-w-sm',
  'max-w-md': 'sm:max-w-md',
  'max-w-lg': 'sm:max-w-lg',
  'max-w-xl': 'sm:max-w-xl',
  'max-w-2xl': 'sm:max-w-2xl',
  'max-w-3xl': 'sm:max-w-3xl',
  'max-w-4xl': 'sm:max-w-4xl',
  'max-w-5xl': 'sm:max-w-5xl',
};

const BAND: Record<ModalTone, string> = {
  neutral: 'text-foreground/15',
  info: 'text-primary',
  warning: 'text-highlight',
  danger: 'text-destructive',
  success: 'text-success',
};

/** The diagonal stripes of a film slate, drawn in the tone colour. */
function ClapperBand({ tone }: { tone: ModalTone }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'h-2 w-full shrink-0 bg-[repeating-linear-gradient(135deg,currentColor_0_10px,transparent_10px_20px)]',
        BAND[tone],
      )}
    />
  );
}

/** A dialog with a title bar; focus stays inside while it is open and returns to the trigger after. */
export function Modal({ open, onClose, title, subtitle, children, maxWidth = 'max-w-lg', tone = 'neutral' }: ModalProps) {
  const smClass = SM_MAX_WIDTH[maxWidth] ?? (maxWidth.startsWith('sm:') ? maxWidth : `sm:${maxWidth}`);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className={cn(
          'flex max-h-[92vh] w-full flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-2xl',
          maxWidth,
          smClass,
        )}
        {...(subtitle ? {} : { 'aria-describedby': undefined })}
      >
        <ClapperBand tone={tone} />
        <DialogHeader className="flex-row items-start border-b border-border px-6 pt-5 pb-4 pr-12 text-left">
          <div className="min-w-0 space-y-1">
            <DialogTitle className="font-heading text-lg font-bold tracking-tight text-foreground">{title}</DialogTitle>
            {subtitle && <DialogDescription className="text-sm leading-relaxed text-muted-foreground">{subtitle}</DialogDescription>}
          </div>
        </DialogHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 text-foreground">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
