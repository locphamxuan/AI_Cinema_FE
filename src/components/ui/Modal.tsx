'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
}

/** Shared modal shell - centers a dialog card over a dim backdrop, with a title bar and close button, so every page stops hand-rolling this. */
export function Modal({ open, onClose, title, subtitle, icon, children, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-3 sm:p-6 animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        className={`relative bg-white dark:bg-[#0F1C27] border border-slate-200/80 dark:border-white/15 rounded-2xl w-full ${maxWidth} shadow-2xl shadow-slate-900/20 overflow-hidden my-auto animate-scale-in flex flex-col max-h-[92vh]`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="w-9 h-9 rounded-xl bg-action/10 text-action flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div>
              <h3 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
