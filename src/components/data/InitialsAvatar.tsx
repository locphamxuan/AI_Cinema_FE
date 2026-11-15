import { cn } from '@/lib/utils';

// Tints a person keeps across every list: picked from their name, not at random per render.
const TINTS = [
  'bg-[color-mix(in_oklab,var(--chart-1)_18%,transparent)] text-[var(--chart-1)]',
  'bg-[color-mix(in_oklab,var(--chart-2)_22%,transparent)] text-[color-mix(in_oklab,var(--chart-2)_70%,var(--foreground))]',
  'bg-[color-mix(in_oklab,var(--chart-3)_18%,transparent)] text-[var(--chart-3)]',
  'bg-[color-mix(in_oklab,var(--chart-4)_18%,transparent)] text-[var(--chart-4)]',
  'bg-[color-mix(in_oklab,var(--chart-5)_22%,transparent)] text-[color-mix(in_oklab,var(--chart-5)_60%,var(--foreground))]',
];

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const last = words[words.length - 1][0];
  return (words.length > 1 ? words[0][0] + last : last).toUpperCase();
}

/** A round badge with someone's initials, tinted the same way wherever they appear. */
export function InitialsAvatar({ name, className }: { name: string; className?: string }) {
  const tint = TINTS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TINTS.length];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        tint,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
