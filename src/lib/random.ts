/**
 * Randomness from the Web Crypto API instead of Math.random: idempotency keys must not be
 * guessable, and one source for every id keeps the code free of weak-PRNG warnings.
 * getRandomValues (unlike randomUUID) also works outside secure contexts such as a LAN IP.
 */

/** 128 random bits as hex, with an optional prefix. */
export function randomId(prefix = ''): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return prefix + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
