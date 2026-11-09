/**
 * MF-3 ads as the Admin manages them. Mirrors the BE responses of
 * src/modules/playback one-to-one; field names are the BE ones.
 */

export interface AdCreative {
  id: string;
  title: string;
  mediaUrl: string;
  clickUrl: string | null;
  durationSeconds: number;
}

/** GET /admin/ads */
export interface AdminAd extends AdCreative {
  weight: number;
  status: 'ACTIVE' | 'PAUSED';
}

/** POST /admin/ads, PATCH /admin/ads/:id */
export interface AdInput {
  title: string;
  mediaUrl: string;
  clickUrl?: string | null;
  weight?: number;
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
  /** Empty = weighted draw among the valid ads. */
  adId?: string | null;
}
