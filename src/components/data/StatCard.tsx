import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/shadcn/card';
import { cn } from '@/lib/utils';

const NOTE_TONE = {
  muted: 'text-muted-foreground',
  good: 'text-success',
  warn: 'text-warning',
  bad: 'text-destructive',
  brand: 'text-reel',
} as const;

/** The dashboard palette (globals.css `--viz-*`), in its fixed order, so the same figure keeps its colour on every visit. */
const ACCENTS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)'] as const;
export type StatAccent = 0 | 1 | 2 | 3 | 4;

export function accentOf(label: string): StatAccent {
  let hash = 0;
  for (const ch of label) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (hash % ACCENTS.length) as StatAccent;
}

/** Change against the period before, in percent; `null` when there is nothing to compare with. */
export interface StatTrend {
  delta: number | null;
  /** What the change is measured against ("so với 30 ngày trước"). */
  label: string;
}

const trendText = (delta: number) => `${delta > 0 ? '+' : ''}${delta.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;

function TrendChip({ trend, featured }: { trend: StatTrend; featured: boolean }) {
  if (trend.delta === null) {
    return <p className={cn('text-xs', featured ? 'text-white/75' : 'text-muted-foreground')}>Chưa có số liệu kỳ trước để so sánh</p>;
  }
  const tone =
    trend.delta > 0
      ? featured ? 'bg-white/20 text-white' : 'bg-success/12 text-success'
      : trend.delta < 0
        ? featured ? 'bg-black/25 text-white' : 'bg-destructive/12 text-destructive'
        : featured ? 'bg-white/15 text-white' : 'bg-muted text-muted-foreground';
  return (
    <p className={cn('flex flex-wrap items-center gap-1.5 text-xs', featured ? 'text-white/80' : 'text-muted-foreground')}>
      <span className={cn('rounded-full px-2 py-0.5 font-semibold tabular-nums', tone)}>{trendText(trend.delta)}</span>
      {trend.label}
    </p>
  );
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Unit after the figure, set smaller ("Coin", "tập"). */
  unit?: string;
  note?: ReactNode;
  noteTone?: keyof typeof NOTE_TONE;
  /** Change against the period before. */
  trend?: StatTrend;
  /** A small tile above the label saying what the figure is about. */
  icon?: LucideIcon;
  /** Colour of the icon tile, the top edge and the glow; by default one fixed per label. */
  accent?: StatAccent;
  /** The figure the page leads with: a Reel violet panel. */
  featured?: boolean;
  className?: string;
}

/**
 * One headline figure: an icon tile and a top edge in the colour of the figure, what it counts, the number set in the
 * display face, and a line of context (or the change against the period before) under it.
 */
export function StatCard({ label, value, unit, note, noteTone = 'muted', trend, icon: Icon, accent, featured = false, className }: StatCardProps) {
  const style = { '--stat': ACCENTS[accent ?? accentOf(label)] } as CSSProperties;
  return (
    <Card
      style={style}
      className={cn(
        'relative gap-2 overflow-hidden px-5 py-4 shadow-xs',
        'before:pointer-events-none before:absolute before:-top-12 before:-right-12 before:size-36 before:rounded-full before:bg-(--stat) before:opacity-15 before:blur-2xl',
        'after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-1 after:bg-linear-to-r after:from-(--stat) after:to-(--stat)/0',
        featured &&
          'bg-linear-to-br from-[#6646F0] via-[#4F2FC8] to-[#2A1A66] text-white shadow-lg ring-0 shadow-[#6646F0]/25 before:bg-[#F5B83D] before:opacity-30 after:from-[#F5B83D] after:to-[#F5B83D]/0',
        className,
      )}
    >
      {Icon && (
        <span className={cn('mb-1 flex size-9 items-center justify-center rounded-xl', featured ? 'bg-white/15 text-[#F5B83D]' : 'bg-(--stat)/12 text-(--stat)')}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      )}
      <p className={cn('text-sm', featured ? 'text-white/80' : 'text-muted-foreground')}>{label}</p>
      <p className="font-display text-3xl leading-none font-semibold tracking-tight tabular-nums">
        {value}
        {unit && <span className={cn('ml-1.5 font-sans text-sm font-normal', featured ? 'text-white/75' : 'text-muted-foreground')}>{unit}</span>}
      </p>
      {trend && <TrendChip trend={trend} featured={featured} />}
      {note && <p className={cn('truncate text-xs', featured ? 'text-white/85' : NOTE_TONE[noteTone])}>{note}</p>}
    </Card>
  );
}
