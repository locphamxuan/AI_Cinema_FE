'use client';

import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/dialog';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
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

/** A dialog with a title bar; focus stays inside while it is open and returns to the trigger after. */
export function Modal({ open, onClose, title, subtitle, icon, children, maxWidth = 'max-w-lg' }: ModalProps) {
  const smClass = SM_MAX_WIDTH[maxWidth] ?? (maxWidth.startsWith('sm:') ? maxWidth : `sm:${maxWidth}`);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className={cn(
          'flex max-h-[92vh] w-full flex-col gap-0 overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] p-0 shadow-2xl transition-all',
          maxWidth,
          smClass,
        )}
        {...(subtitle ? {} : { 'aria-describedby': undefined })}
      >
        <DialogHeader className="flex-row items-start gap-3.5 border-b border-slate-100 dark:border-white/[0.06] px-6 pt-5 pb-4 pr-12 text-left">
          {icon && (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 dark:bg-white/[0.08] dark:text-white shadow-xs">
              {icon}
            </div>
          )}
          <div className="space-y-0.5 min-w-0">
            <DialogTitle className="font-heading text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </DialogTitle>
            {subtitle && (
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                {subtitle}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 text-slate-900 dark:text-slate-100">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
