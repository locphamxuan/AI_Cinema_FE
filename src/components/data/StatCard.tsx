import type { CSSProperties, ReactNode } from 'react';
import { Ticket, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const NOTE_TONE = {
  muted: 'text-muted-foreground',
  good: 'text-success',
  warn: 'text-warning',
  bad: 'text-destructive',
  brand: 'text-primary',
} as const;

/** The stub colours, from the chart palette: projector pink, marquee amber, reel violet, teal, sky. */
const ACCENTS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'] as const;
export type StatAccent = 0 | 1 | 2 | 3 | 4;

/** Same label, same colour on every visit, so a figure is recognised by its stub before it is read. */
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
  /** The icon printed on the stub. */
  icon?: LucideIcon;
  /** Colour of the stub; by default one fixed per label. */
  accent?: StatAccent;
  /** The figure the page leads with: the whole ticket takes the stub colour. */
  featured?: boolean;
  className?: string;
}

/**
 * One headline figure as a cinema ticket: a coloured stub with the icon, a perforated tear line, then what it counts,
 * the number in the marquee face and a line of context.
 */
export function StatCard({ label, value, unit, note, noteTone = 'muted', icon: Icon = Ticket, accent, featured = false, className }: StatCardProps) {
  const style = { '--ticket-accent': ACCENTS[accent ?? accentOf(label)] } as CSSProperties;
  return (
    <div
      style={style}
      className={cn(
        'ticket flex min-h-28 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        featured && 'ticket-stub border-transparent text-white',
        className,
      )}
    >
      <div className={cn('flex w-[4.25rem] shrink-0 items-center justify-center', !featured && 'ticket-stub')}>
        <Icon className="size-6 text-white drop-shadow" aria-hidden="true" />
      </div>
      <div className={cn('ticket-tear w-px shrink-0', featured && 'opacity-40')} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3">
        <p className={cn('text-sm', featured ? 'text-white/85' : 'text-muted-foreground')}>{label}</p>
        <p className="font-display text-4xl leading-none font-bold tracking-tight tabular-nums">
          {value}
          {unit && <span className={cn('ml-1.5 font-sans text-sm font-normal', featured ? 'text-white/80' : 'text-muted-foreground')}>{unit}</span>}
        </p>
        {note && <p className={cn('truncate text-xs', featured ? 'text-white/90' : NOTE_TONE[noteTone])}>{note}</p>}
      </div>
    </div>
  );
}
