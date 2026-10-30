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

/** A dialog with a title bar; focus stays inside while it is open and returns to the trigger after. */
export function Modal({ open, onClose, title, subtitle, icon, children, maxWidth = 'max-w-lg' }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className={cn('flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-none', maxWidth)}
        {...(subtitle ? {} : { 'aria-describedby': undefined })}
      >
        <DialogHeader className="flex-row items-start gap-3 border-b px-6 pt-5 pb-4 pr-12 text-left">
          {icon && (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
          )}
          <div className="space-y-1">
            <DialogTitle className="font-heading text-lg font-semibold">{title}</DialogTitle>
            {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
          </div>
        </DialogHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
