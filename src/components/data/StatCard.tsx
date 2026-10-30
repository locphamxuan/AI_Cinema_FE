import type { ReactNode } from 'react';
import { Card } from '@/components/shadcn/card';
import { cn } from '@/lib/utils';

const NOTE_TONE = {
  muted: 'text-muted-foreground',
  good: 'text-success',
  warn: 'text-warning',
  bad: 'text-destructive',
  brand: 'text-primary',
} as const;

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Unit after the figure, set smaller ("Coin", "tập"). */
  unit?: string;
  note?: ReactNode;
  noteTone?: keyof typeof NOTE_TONE;
  icon?: ReactNode;
  /** The figure the page leads with: filled with the brand gradient. */
  featured?: boolean;
  className?: string;
}

/** One headline figure: what it counts, the number, and a line of context under it. */
export function StatCard({
  label,
  value,
  unit,
  note,
  noteTone = 'muted',
  icon,
  featured = false,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'relative gap-2 px-5 py-4 transition-shadow hover:shadow-md',
        featured &&
          'bg-[linear-gradient(135deg,var(--primary),color-mix(in_oklab,var(--primary)_55%,var(--highlight)))] text-primary-foreground ring-0 shadow-lg shadow-primary/20',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn('text-sm', featured ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{label}</p>
        {icon && (
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-lg [&_svg]:size-4',
              featured ? 'bg-white/15 text-primary-foreground' : 'bg-accent text-accent-foreground',
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="font-heading text-3xl font-semibold leading-none tabular-nums">
        {value}
        {unit && (
          <span
            className={cn(
              'ml-1.5 font-sans text-sm font-normal',
              featured ? 'text-primary-foreground/75' : 'text-muted-foreground',
            )}
          >
            {unit}
          </span>
        )}
      </p>
      {note && (
        <p className={cn('truncate text-xs', featured ? 'text-primary-foreground/85' : NOTE_TONE[noteTone])}>{note}</p>
      )}
    </Card>
  );
}
