/**
 * Main Flow 3 - Playback & Viewing Experience. Mirrors the BE responses of
 * src/modules/playback one-to-one; field names are the BE ones.
 */

/** How the playback access was granted (MF-2 handoff access_type). */
export type PlaybackAccessType = 'FREE_STARTER' | 'SUBSCRIPTION' | 'COIN_UNLOCK' | 'ADMIN_GRANT';

export interface AdCreative {
  id: string;
  title: string;
  mediaUrl: string;
  clickUrl: string | null;
  durationSeconds: number;
}

/** One mid-roll cue of the session and the ad shown when the playhead gets there. */
export interface AdScheduleItem {
  breakId: string;
  positionSeconds: number;
  ad: AdCreative;
}

/** POST /playback/sessions */
export interface StreamingSession {
  sessionId: string;
  episodeId: string;
  movieId: string;
  accessType: PlaybackAccessType;
  planCode?: string | null;
  status: string;
  startPositionSeconds: number;
  /** Signed token playlist filtered by the plan ceiling, or the origin URL when signing is off. */
  stream: { masterUrl: string; qualities: string[]; durationSeconds: number | null };
  subtitles: { language: string; url: string; isDefault: boolean }[];
  aiLabel: { type: string; text: string; displayLocation: string | null } | null;
  /** Saved position for the resume-or-restart question; absent when none. */
  resumePositionSeconds?: number;
  adSchedule: AdScheduleItem[];
  reused?: boolean;
}

/** Heartbeat, stop and complete answer the session state. */
export interface SessionState {
  sessionId: string;
  episodeId: string;
  status: string;
  positionSeconds: number;
  totalWatchedSeconds: number;
  completed: boolean;
  /** Heartbeat only: the break the playhead passed without playing it; the player plays it now. */
  dueAdBreakId: string | null;
}

export interface AdBreakState {
  breakId: string;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  playedAt: string | null;
  completedView: boolean;
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


/** One row of the member's watch history (GET /playback/history), newest first. */
export interface WatchHistoryItem {
  episodeId: string;
  episodeTitle: string;
  episodeNumber: number;
  thumbnailUrl: string | null;
  movieId: string;
  movieTitle: string;
  positionSeconds: number;
  durationSeconds: number | null;
  completed: boolean;
  available: boolean;
  notice: string | null;
  lastWatchedAt: string | null;
}
