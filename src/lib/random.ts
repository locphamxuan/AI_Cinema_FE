/**
 * Randomness from the Web Crypto API instead of Math.random: idempotency keys must not be
 * guessable, and one source for every id keeps the code free of weak-PRNG warnings.
 * getRandomValues (unlike randomUUID) also works outside secure contexts such as a LAN IP.
 */

/** A number in [0, 1). */
export function randomUnit(): number {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return value / 2 ** 32;
}

/** An integer in [min, max]. */
export function randomInt(min: number, max: number): number {
  return min + Math.floor(randomUnit() * (max - min + 1));
}

/** 128 random bits as hex, with an optional prefix. */
export function randomId(prefix = ''): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return prefix + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
