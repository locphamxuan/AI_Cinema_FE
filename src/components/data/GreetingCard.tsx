import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GreetingCardProps {
  name: string;
  /** What waits on this account today, in one sentence. */
  summary?: ReactNode;
  /** Small figures under the summary. */
  figures?: { label: string; value: ReactNode }[];
  /** The main action of the page, a white button on the black panel. */
  action?: ReactNode;
  /** Names the region for screen readers. */
  label: string;
  className?: string;
}

/** The top of a dashboard on a black panel: who is signed in, what waits today, a few figures and the main action. */
export function GreetingCard({ name, summary, figures, action, label, className }: GreetingCardProps) {
  return (
    <section aria-label={label} className={cn('hero-ink overflow-hidden rounded-2xl border border-black/5 p-6 shadow-lg shadow-black/10 sm:p-8 dark:border-white/10', className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold text-[#121212] ring-4 ring-white/15">
            {name.trim().charAt(0).toUpperCase() || 'A'}
          </span>
          <div className="min-w-0 space-y-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Xin chào, {name}</h1>
            {summary && <p className="text-sm text-white/70">{summary}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {figures && figures.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {figures.map((f) => (
            <div key={f.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <dt className="text-xs text-white/60">{f.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
