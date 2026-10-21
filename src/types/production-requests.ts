/** Request bodies of the MF-1 API (the backend DTOs). */
import type { AgeRating, ChangeRequestType, LabelType } from './production-enums';
import type { AiDisclosure } from './production-media';

export interface NewEpisodeInput {
  title: string;
  targetDurationSeconds: number;
  /** YYYY-MM-DD: the day the studio must deliver, set by the Reviewer. */
  deliveryDeadline: string;
  /** YYYY-MM-DD: inside the season's release window and not before the deadline (BR-60). */
  expectedReleaseDate?: string;
  synopsis?: string;
}

export interface NewSeasonInput {
  title?: string;
  /** Token the studio is paid for one episode (BR-37). */
  episodeProductionCost: number;
  releaseStartDate?: string;
  releaseEndDate?: string;
  episodes: NewEpisodeInput[];
}

export interface UpdateSeasonInput {
  title?: string;
  episodeProductionCost?: number;
  /** null clears the date. */
  releaseStartDate?: string | null;
  releaseEndDate?: string | null;
}

export interface UpdateEpisodeInput {
  title?: string;
  synopsis?: string;
  targetDurationSeconds?: number;
  deliveryDeadline?: string;
  /** null clears the date. */
  expectedReleaseDate?: string | null;
}

export interface CreateProjectInput {
  title: string;
  ideaDescription: string;
  genreIds: string[];
  /** Genres the list does not have yet; the backend adds them. */
  genreNames?: string[];
  /** Viewer-facing summary, also needed before the first release. */
  synopsis?: string;
  ageRating?: AgeRating;
  releaseYear?: number;
  defaultLanguage?: string;
  /** Active studio of the catalog (BR-59). */
  studioId?: string;
  seasons: NewSeasonInput[];
}

export interface UpdateProjectInput {
  title?: string;
  ideaDescription?: string;
  genreIds?: string[];
  genreNames?: string[];
  defaultLanguage?: string;
  synopsis?: string;
  ageRating?: AgeRating;
  releaseYear?: number;
  /** Free episodes of this movie; null = the platform's default (BR-03). */
  freeEpisodeCount?: number | null;
  studioId?: string;
}

export interface StudioInput {
  name: string;
  email: string;
  contactName?: string;
  phone?: string;
  note?: string;
  isActive?: boolean;
}

/** A hand-off: the studio (default: the project's), the season (default: everything left) and the files. */
export interface HandOffInput {
  /** Studio typed by hand: a known email reuses that studio, a new one needs `studioName`. */
  studioName?: string;
  studioEmail?: string;
  studioPhone?: string;
  /** Falls back to the project's current studio (first hand-off only). */
  studioId?: string;
  seasonId?: string;
  scripts?: File[];
  references?: File[];
}

export interface ChangeStudioInput extends HandOffInput {
  reason: string;
}

export interface ChangeRequestInput {
  requestType: ChangeRequestType;
  content: string;
  reason: string;
  requestedTokens?: number;
  seasonId?: string;
  episodeId?: string;
  proof?: File;
}

export interface MediaMetadataInput {
  proposedLabelType: LabelType;
  submissionNote?: string;
  aiDisclosure: AiDisclosure;
}

export interface ComplianceInput {
  decree142Notice: { result: 'PASS' | 'FAIL'; failureReason?: string };
  contentSafety: { result: 'PASS' | 'FAIL'; failureReason?: string };
  depictsRealPersonOrEvent: boolean;
  realPersonNote?: string;
}
