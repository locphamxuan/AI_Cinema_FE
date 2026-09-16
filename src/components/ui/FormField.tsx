import { ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/** Shared label+control wrapper for form fields — the "block text-slate-300 mb-1 font-semibold label + input" pattern repeated across every modal and editor form. */
export function FormField({ label, children, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-slate-600 dark:text-slate-300 mb-1 text-xs font-semibold">{label}</label>
      {children}
    </div>
  );
}

const FIELD_BASE =
  'w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-ruby/40 focus:border-ruby transition';

export const fieldInputClass = FIELD_BASE;
export const fieldTextareaClass = `${FIELD_BASE} resize-none`;
