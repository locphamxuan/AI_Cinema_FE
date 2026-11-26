import { cn } from '@/lib/utils';

export interface StageSegment {
  label: string;
  value: number;
  /** A dashboard palette colour, `var(--viz-n)`. */
  color: string;
}

interface StageBarProps {
  title: string;
  /** The headline count on the right of the title, with what it counts. */
  headline: { value: number; label: string };
  segments: StageSegment[];
  className?: string;
}

/**
 * Where a set of work items stands: one bar split by stage (thin surface gaps between the parts) and a legend that
 * names every stage with its count, so the split never rests on colour alone.
 */
export function StageBar({ title, headline, segments, className }: StageBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const shown = segments.filter((s) => s.value > 0);
  return (
    <section aria-label={title} className={cn('rounded-2xl bg-card p-5 shadow-xs ring-1 ring-foreground/10 sm:p-6', className)}>
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        <p className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-semibold tabular-nums sm:text-4xl">{headline.value}</span>
          <span className="text-sm text-muted-foreground">{headline.label}</span>
        </p>
      </div>
      <div className="mt-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        {total > 0 &&
          shown.map((s) => (
            <span key={s.label} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }} />
          ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:flex sm:flex-wrap">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: s.color }} aria-hidden="true" />
            <span className="font-semibold tabular-nums">{s.value}</span>
            <span className="text-muted-foreground">{s.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
