import { HTMLAttributes } from 'react';

/** Shared card/panel surface — the neutral container used throughout the MF1 dashboards (stat tiles, list items, form sections). */
export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#161922] border border-slate-200 dark:border-white/10 ${className}`}
      {...props}
    />
  );
}
