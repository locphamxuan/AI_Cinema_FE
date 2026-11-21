import type { CSSProperties, ReactNode } from 'react';
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

/** The colour of a figure, from the chart palette, so the same figure keeps its colour on every visit. */
const ACCENTS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'] as const;
export type StatAccent = 0 | 1 | 2 | 3 | 4;

export function accentOf(label: string): StatAccent {
  let hash = 0;
  for (const ch of label) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (hash % ACCENTS.length) as StatAccent;
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Unit after the figure, set smaller ("Coin", "tập"). */
  unit?: string;
  note?: ReactNode;
  noteTone?: keyof typeof NOTE_TONE;
  /** A small tile above the label saying what the figure is about. */
  icon?: LucideIcon;
  /** Colour of the icon tile and the glow; by default one fixed per label. */
  accent?: StatAccent;
  /** The figure the page leads with: filled with the brand colour. */
  featured?: boolean;
  className?: string;
}

/**
 * One headline figure, as the metric cards of arhamkhnz/next-shadcn-admin-dashboard: an icon tile in the colour of the
 * figure, what it counts, the number, and a line of context under it, with a faint glow of the same colour.
 */
export function StatCard({ label, value, unit, note, noteTone = 'muted', icon: Icon, accent, featured = false, className }: StatCardProps) {
  const style = { '--stat': ACCENTS[accent ?? accentOf(label)] } as CSSProperties;
  return (
    <Card
      style={style}
      className={cn(
        'relative gap-2 overflow-hidden px-5 py-4 shadow-xs',
        'before:pointer-events-none before:absolute before:-top-10 before:-right-10 before:size-32 before:rounded-full before:bg-(--stat) before:opacity-10 before:blur-2xl',
        featured && 'bg-primary text-primary-foreground ring-0 shadow-lg shadow-primary/20 before:bg-white',
        className,
      )}
    >
      {Icon && (
        <span
          className={cn(
            'mb-1 flex size-9 items-center justify-center rounded-xl',
            featured ? 'bg-primary-foreground/15' : 'bg-(--stat)/12 text-(--stat)',
          )}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      )}
      <p className={cn('text-sm', featured ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{label}</p>
      <p className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
        {value}
        {unit && <span className={cn('ml-1.5 text-sm font-normal', featured ? 'text-primary-foreground/75' : 'text-muted-foreground')}>{unit}</span>}
      </p>
      {note && <p className={cn('truncate text-xs', featured ? 'text-primary-foreground/85' : NOTE_TONE[noteTone])}>{note}</p>}
    </Card>
  );
}
