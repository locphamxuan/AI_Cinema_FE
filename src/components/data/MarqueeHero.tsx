import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeHeroProps {
  /** Who is in the room, or what the page is: the big marquee line. */
  title: string;
  /** One sentence under it: what waits today. */
  subtitle?: ReactNode;
  /** The main action of the page, on the right. */
  action?: ReactNode;
  /** Figures printed along the bottom of the marquee. */
  children?: ReactNode;
  className?: string;
}

/** The lit marquee at the top of a dashboard: the one bold element of the page; everything under it stays calm. */
export function MarqueeHero({ title, subtitle, action, children, className }: MarqueeHeroProps) {
  return (
    <section className={cn('marquee overflow-hidden rounded-2xl px-6 pt-9 pb-8 shadow-xl shadow-black/20 sm:px-9', className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="text-5xl leading-[0.9] font-bold tracking-wide text-balance sm:text-6xl">{title}</h1>
          {subtitle && <p className="max-w-xl text-sm text-white/80 sm:text-base">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children && <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5">{children}</div>}
    </section>
  );
}

/** One figure on the marquee: the number in lamp amber, what it counts under it. */
export function MarqueeFigure({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="min-w-0">
      <p className="font-display text-3xl leading-none font-bold text-highlight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-white/70">{label}</p>
    </div>
  );
}
