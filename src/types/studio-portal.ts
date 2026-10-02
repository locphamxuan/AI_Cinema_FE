/** The outside studio's view of a hand-off (GET /studio-portal/:token). */
import type { EpisodeStatus, MediaIngestStatus, MovieStatus } from './production-enums';

export type StudioResponse = 'ACCEPTED' | 'DECLINED';

export interface PortalDelivery {
  id: string;
  version: number;
  ingestStatus: MediaIngestStatus;
  failureReason: string | null;
  durationSeconds: number | null;
  createdAt: string;
}

export interface PortalEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  synopsis: string | null;
  targetDurationSeconds: number;
  dueDate: string | null;
  status: EpisodeStatus;
  latestDelivery: PortalDelivery | null;
  /** The Reviewer's latest request, while the studio has something to fix. */
  changesRequested: { comments: string | null; createdAt: string } | null;
}

export interface StudioPortalOverview {
  studio: {
    studioName: string;
    studioEmail: string;
    handedOffAt: string;
    response: StudioResponse | null;
    respondedAt: string | null;
    declineReason: string | null;
  };
  project: {
    title: string;
    status: MovieStatus;
    ideaDescription: string;
    genres: string[];
    productionFeeTokens: number;
    creator: { fullName: string; email: string } | null;
  };
  canDeliver: boolean;
  seasons: { seasonNumber: number; title: string | null; episodes: PortalEpisode[] }[];
  ideaFiles: { id: string; fileName: string; version: number }[];
}

export type StudioRespondInput =
  | { decision: 'ACCEPT'; acceptTerms: true }
  | { decision: 'DECLINE'; reason: string };
