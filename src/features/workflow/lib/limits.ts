/** MVP limits from the product spec (LI-01); the episode length limit is a platform setting. */
/** Episode length limit until the platform settings load; the Admin changes it in the settings. */
export const DEFAULT_MAX_EPISODE_MINUTES = 60;
/** Upper bound of a duration input when the Admin removed the limit. */
export const UNLIMITED_EPISODE_MINUTES = 360;
export const MIN_EPISODES_PER_SEASON = 3;
export const MAX_EPISODES_PER_SEASON = 5;
export const MAX_SEASONS = 10;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
