/** MVP limits from the product spec (BR-31, LI-01). */
export const MAX_EPISODE_MINUTES = 30;
export const MIN_EPISODES_PER_SEASON = 3;
export const MAX_EPISODES_PER_SEASON = 5;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
