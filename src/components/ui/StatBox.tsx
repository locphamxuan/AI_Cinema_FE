import { ReactNode } from 'react';
import { Card } from './Card';

export interface StatBoxProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: 'default' | 'warning';
}

/** Shared stat tile — the "N tập / N tokens / N%..." cards repeated 4x on both the creator and reviewer overview tabs. */
export function StatBox({ icon, label, value, hint, tone = 'default' }: StatBoxProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">
        {icon}
        {label}
      </div>
      <div className={`text-2xl font-bold ${tone === 'warning' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </div>
      {hint && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</div>}
    </Card>
  );
}
