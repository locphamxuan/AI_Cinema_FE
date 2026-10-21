'use client';

import { ReactNode } from 'react';

export interface BackdropProps {
  onClose: () => void;
  /** Accessible name of the dialog. */
  label: string;
  className: string;
  children: ReactNode;
}

/**
 * Dim layer of a hand-drawn dialog: a click on the layer itself (not on the card inside) or Escape
 * closes it, so the card needs no stopPropagation and the layer stays reachable by keyboard.
 */
export function Backdrop({ onClose, label, className, children }: BackdropProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={className}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      {children}
    </div>
  );
}
