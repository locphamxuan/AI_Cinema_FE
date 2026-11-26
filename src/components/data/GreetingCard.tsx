import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The figures of the greeting take the first hues of the dashboard palette, in order, as the tiles below them. */
const FIGURE_HUES = ['bg-viz-1', 'bg-projector', 'bg-viz-3', 'bg-viz-4', 'bg-viz-5'] as const;

interface GreetingCardProps {
  name: string;
  /** What waits on this account today, in one sentence. */
  summary?: ReactNode;
  /** Small figures under the summary. */
  figures?: { label: string; value: ReactNode }[];
  /** The main action of the page, a light button on the dark panel. */
  action?: ReactNode;
  /** Names the region for screen readers. */
  label: string;
  className?: string;
}

/**
 * The top of a dashboard: a dark screening room in both themes, lit by one projector beam (`.hero-booth`), with who is
 * signed in, what waits today, a few figures and the main action.
 */
export function GreetingCard({ name, summary, figures, action, label, className }: GreetingCardProps) {
  return (
    <section
      aria-label={label}
      className={cn('hero-booth overflow-hidden rounded-2xl border border-white/10 p-6 shadow-xl shadow-[#1C1830]/25 sm:p-8', className)}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#F5B83D] to-[#EBA21A] font-display text-xl font-bold text-[#1C1830] ring-4 ring-white/10">
            {name.trim().charAt(0).toUpperCase() || 'A'}
          </span>
          <div className="min-w-0 space-y-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Xin chào, {name}</h1>
            {summary && <p className="max-w-prose text-sm text-white/75">{summary}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {figures && figures.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {figures.map((f, i) => (
            <div key={f.label} className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
              <dt className="flex items-center gap-2 text-xs text-white/70">
                <span className={cn('size-2 shrink-0 rounded-full', FIGURE_HUES[i % FIGURE_HUES.length])} aria-hidden="true" />
                {f.label}
              </dt>
              <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
