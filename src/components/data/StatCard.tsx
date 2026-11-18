import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
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
  /** A small tile above the label saying what the figure is about. */
  icon?: LucideIcon;
  /** The figure the page leads with: filled with the brand colour. */
  featured?: boolean;
  className?: string;
}

/**
 * One headline figure, as the metric cards of arhamkhnz/next-shadcn-admin-dashboard: an icon tile, what it counts,
 * the number, and a line of context under it, on a faint primary gradient.
 */
export function StatCard({ label, value, unit, note, noteTone = 'muted', icon: Icon, featured = false, className }: StatCardProps) {
  return (
    <Card
      className={cn(
        'gap-2 bg-linear-to-t from-primary/5 to-card px-5 py-4 shadow-xs dark:bg-card',
        featured && 'from-primary to-primary text-primary-foreground ring-0 shadow-lg shadow-primary/20 dark:bg-primary',
        className,
      )}
    >
      {Icon && (
        <span
          className={cn(
            'mb-1 flex size-7 items-center justify-center rounded-lg border',
            featured ? 'border-primary-foreground/30 bg-primary-foreground/10' : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      )}
      <p className={cn('text-sm', featured ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{label}</p>
      <p className="text-3xl leading-none font-medium tracking-tight tabular-nums">
        {value}
        {unit && <span className={cn('ml-1.5 text-sm font-normal', featured ? 'text-primary-foreground/75' : 'text-muted-foreground')}>{unit}</span>}
      </p>
      {note && <p className={cn('truncate text-xs', featured ? 'text-primary-foreground/85' : NOTE_TONE[noteTone])}>{note}</p>}
    </Card>
  );
}
