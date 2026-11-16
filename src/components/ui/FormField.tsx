import { ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  /** Grey help line under the control. */
  hint?: ReactNode;
  /** What is wrong with the value; shown instead of the hint. */
  error?: string | null;
}

/**
 * A labelled form control with an optional help line or error under it. The wrapper stays the same whether or not
 * a message shows, so an error that appears while typing does not remount the control and drop its focus.
 */
export function FormField({ label, children, className = '', hint, error }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
        {children}
      </label>
      {/* Outside the label, so the help text does not become part of the control's name. */}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

// The shadcn input look, for the native <input>, <select> and <textarea> the forms render.
const FIELD_BASE =
  'w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:[color-scheme:dark] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export const fieldInputClass = FIELD_BASE;
export const fieldTextareaClass = `${FIELD_BASE} resize-none`;

