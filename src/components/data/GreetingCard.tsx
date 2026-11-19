import type { ReactNode } from 'react';
import { InitialsAvatar } from '@/components/data/InitialsAvatar';
import { cn } from '@/lib/utils';

interface GreetingCardProps {
  name: string;
  /** What waits on this account today, in one sentence. */
  summary?: ReactNode;
  /** Small figures under the summary. */
  figures?: { label: string; value: ReactNode }[];
  /** The main action of the page. */
  action?: ReactNode;
  /** Names the region for screen readers. */
  label: string;
  className?: string;
}

/** The top of a dashboard: who is signed in, what waits today and the main action, on a soft brand gradient. */
export function GreetingCard({ name, summary, figures, action, label, className }: GreetingCardProps) {
  return (
    <section
      aria-label={label}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-primary/12 via-card to-card p-6 shadow-xs sm:p-7',
        'before:pointer-events-none before:absolute before:-top-16 before:right-10 before:size-56 before:rounded-full before:bg-chart-2/15 before:blur-3xl',
        className,
      )}
    >
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <InitialsAvatar name={name} className="size-14 text-lg ring-4 ring-primary/15" />
          <div className="min-w-0 space-y-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Xin chào, {name}</h1>
            {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {figures && figures.length > 0 && (
        <dl className="relative mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-border/70 pt-4">
          {figures.map((f) => (
            <div key={f.label}>
              <dt className="text-xs text-muted-foreground">{f.label}</dt>
              <dd className="text-xl font-semibold tabular-nums">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
