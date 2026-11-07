import { HTMLAttributes } from 'react';
import { badgeVariants } from '@/components/shadcn/badge';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'amber' | 'emerald' | 'blue' | 'purple' | 'rose';

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground border-border',
  amber: 'bg-warning/12 text-warning border-warning/25',
  emerald: 'bg-success/12 text-success border-success/25',
  blue: 'bg-primary/10 text-primary border-primary/20',
  purple: 'bg-accent text-accent-foreground border-primary/20',
  rose: 'bg-destructive/10 text-destructive border-destructive/25',
};

const DOT_CLASSES: Record<Tone, string> = {
  neutral: 'bg-muted-foreground',
  amber: 'bg-warning',
  emerald: 'bg-success',
  blue: 'bg-primary',
  purple: 'bg-primary',
  rose: 'bg-destructive',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

/** Status pill for workflow status, review decisions, compliance state and the like. */
export function Badge({ tone = 'neutral', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant: 'outline' }), 'font-medium', TONE_CLASSES[tone], className)} {...props}>
      {dot && <span className={cn('size-1.5 rounded-full', DOT_CLASSES[tone])} />}
      {children}
    </span>
  );
}
