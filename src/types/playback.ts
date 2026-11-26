/**
 * MF-3 ads as the Admin manages them. Mirrors the BE responses of
 * src/modules/playback one-to-one; field names are the BE ones.
 */

/** GET /admin/ads */
export interface AdminAd {
  id: string;
  title: string;
  mediaUrl: string;
  durationSeconds: number;
  status: 'ACTIVE' | 'PAUSED';
}

/** POST /admin/ads, PATCH /admin/ads/:id */
export interface AdInput {
  title: string;
  mediaUrl: string;
  status?: 'ACTIVE' | 'PAUSED';
}

/** GET|PUT /admin/episodes/:id/ad-slots */
export interface EpisodeAdSlots {
  episodeId: string;
  durationSeconds: number | null;
  /** RANDOM: no cue placed, the episode gets the platform's random cues. */
  mode: 'MANUAL' | 'RANDOM';
  slots: { id: string; positionSeconds: number; ad: { id: string; title: string } | null }[];
}

export interface EpisodeAdSlotInput {
  positionSeconds: number;
  /** Empty = random draw among the active ads. */
  adId?: string | null;
}
