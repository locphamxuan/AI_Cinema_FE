import { useState } from 'react';
import { clamp } from '@/features/workflow/lib/limits';

export interface NumberFieldProps {
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
  className: string;
  'aria-label'?: string;
  id?: string;
  disabled?: boolean;
}

/**
 * Number input the user can type into freely: the value is kept in range only
 * when typing produced a valid number within it, and snapped into range on blur.
 */
export function NumberField({ value, min, max, onCommit, className, ...rest }: NumberFieldProps) {
  const [draft, setDraft] = useState(String(value));
  // Follow outside changes (steppers, removed rows) without an effect.
  const [shown, setShown] = useState(value);
  if (value !== shown) {
    setShown(value);
    setDraft(String(value));
  }

  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={draft}
      id={rest.id}
      disabled={rest.disabled}
      aria-label={rest['aria-label']}
      onChange={(e) => {
        setDraft(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value !== '' && Number.isInteger(n) && n >= min && n <= max) onCommit(n);
      }}
      onBlur={() => {
        const n = clamp(Number(draft), min, max);
        setDraft(String(n));
        if (n !== value) onCommit(n);
      }}
      className={className}
    />
  );
}
