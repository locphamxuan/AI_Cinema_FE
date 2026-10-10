'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export type SelectTone = 'neutral' | 'amber' | 'emerald' | 'blue' | 'purple' | 'rose';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  tone?: SelectTone;
  badge?: ReactNode;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  menuClassName?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

const TONE_DOTS: Record<SelectTone, string> = {
  purple: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.55)]',
  emerald: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)]',
  blue: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.55)]',
  amber: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.55)]',
  rose: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.55)]',
  neutral: 'bg-slate-400',
};

const SIZE_TRIGGER = {
  sm: 'py-1.5 px-3 text-xs rounded-xl min-h-[34px]',
  md: 'py-2 px-3.5 text-xs sm:text-sm rounded-xl min-h-[42px]',
  lg: 'py-2.5 px-4 text-sm rounded-xl min-h-[46px]',
};

/**
 * Modern custom dropdown select for OTT Cinema dashboard.
 * Features glassmorphic dark/light aesthetics, glow indicator dots, smooth Chevron rotation,
 * click-outside listener, and an underlying synchronized select for full accessibility & form support.
 */
export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Chọn một mục…',
  disabled = false,
  size = 'md',
  className = '',
  menuClassName = '',
  id,
  name,
  'aria-label': ariaLabel,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSelect = (val: T) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Hidden native select for accessibility and form integration */}
      <select
        id={id}
        name={name}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Styled Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel ?? selectedOption?.label}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 transition-all text-left font-medium select-none cursor-pointer border ${
          SIZE_TRIGGER[size]
        } ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
            : open
            ? 'bg-white dark:bg-[#131722] border-purple-500 shadow-md shadow-purple-500/10 ring-2 ring-purple-500/20 text-slate-900 dark:text-white'
            : 'bg-white dark:bg-[#0E1118] hover:bg-slate-50 dark:hover:bg-[#141824] border-slate-200 dark:border-white/10 hover:border-purple-500/40 text-slate-800 dark:text-slate-100'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.tone && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${TONE_DOTS[selectedOption.tone]}`} />
          )}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            open ? 'rotate-180 text-purple-500' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Floating Menu Popover */}
      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute left-0 top-full mt-1.5 w-full min-w-[170px] z-50 rounded-xl border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-[#121623]/95 backdrop-blur-md shadow-xl shadow-black/20 dark:shadow-purple-950/40 py-1.5 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 ${menuClassName}`}
        >
          <div className="max-h-60 overflow-y-auto space-y-0.5 px-1 scrollbar-thin">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  onClick={() => !opt.disabled && handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                    opt.disabled
                      ? 'opacity-40 cursor-not-allowed text-slate-400'
                      : isSelected
                      ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.tone && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${TONE_DOTS[opt.tone]}`} />
                    )}
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </span>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
