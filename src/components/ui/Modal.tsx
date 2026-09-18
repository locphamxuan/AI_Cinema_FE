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

/** Shared modal shell — centers a dialog card over a dim backdrop, with a title bar and close button, so every page stops hand-rolling this. */
export function Modal({ open, onClose, title, subtitle, icon, children, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className={`relative bg-white dark:bg-[#13161F] border border-slate-200/80 dark:border-white/15 rounded-3xl w-full ${maxWidth} shadow-2xl shadow-black/50 overflow-hidden my-auto animate-scale-in flex flex-col max-h-[92vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Shimmer Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ruby via-neon to-coin z-10" />

        {/* Modal Header (Sticky) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#13161F]/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-xl bg-ruby/10 text-ruby flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div>
              <h3 id="modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
