'use client';

interface AiOrbProps {
  size?: 'xs' | 'sm' | 'lg';
}

const SIZE_MAP = {
  xs: { outer: 'h-6 w-6', inner: 'h-5 w-5', eyes: 'gap-1', eye: 'h-1.5 w-0.5' },
  sm: { outer: 'h-9 w-9', inner: 'h-7 w-7', eyes: 'gap-1', eye: 'h-2 w-0.5' },
  lg: { outer: 'h-20 w-20', inner: 'h-16 w-16', eyes: 'gap-2.5', eye: 'h-3 w-1.5' },
} as const;

/** Glowing gradient Smart Assistant orb matching the AI Cinema visual style. */
export function AiOrb({ size = 'sm' }: AiOrbProps) {
  const s = SIZE_MAP[size];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-pink-500/20 ${s.outer}`}
    >
      <span
        className={`inline-flex items-center justify-center rounded-full bg-linear-to-br from-violet-500 via-pink-500 to-amber-500 shadow-md shadow-pink-500/35 ${s.inner}`}
      >
        <span className={`inline-flex items-center ${s.eyes}`}>
          <span className={`rounded-full bg-white/95 ${s.eye}`} />
          <span className={`rounded-full bg-white/95 ${s.eye}`} />
        </span>
      </span>
    </span>
  );
}
