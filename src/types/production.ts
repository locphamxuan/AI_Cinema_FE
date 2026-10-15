/** MF-1 (movie project management & publishing) as the NestJS API returns it; dates are ISO strings. */
import type {
  AgeRating,
  EpisodeStatus,
  MediaIngestStatus,
  MovieStatus,
  SeasonStatus,
  UserRole,
} from './production-enums';
import type { CreatorSeat, Person, SeasonFee, Studio, StudioHandoff } from './production-studio';

export * from './production-enums';
export * from './production-media';
export * from './production-requests';
export * from './production-studio';

export interface Genre {
  id: string;
  name: string;
  description?: string | null;
}

/** nestjs-paginate page. */
export interface Page<T> {
  data: T[];
  meta: { totalItems: number; currentPage: number; totalPages: number; itemsPerPage: number };
}

export interface ProjectSummary {
  id: string;
  title: string;
  status: MovieStatus;
  studio: Studio | null;
  reviewerId: string;
  creatorId: string | null;
  reviewer: Person;
  creator: Person | null;
  updatedAt: string;
  /** Newest change of the project: its latest content event, else its own update time. */
  lastActivityAt: string;
  createdAt: string;
  _count: { episodes: number };
}

export interface LatestMedia {
  id: string;
  version: number;
  ingestStatus: MediaIngestStatus;
  durationSeconds: number | null;
}

export interface Episode {
  id: string;
  movieId: string;
  seasonId: string;
  assignedCreatorId: string | null;
  assignedCreator: Person | null;
  episodeNumber: number;
  title: string;
  synopsis: string | null;
  thumbnailUrl: string | null;
  status: EpisodeStatus;
  targetDurationSeconds: number;
  /** The day the Reviewer wants the studio to deliver; null only on very old episodes. */
  deliveryDeadline: string | null;
  /** The studio's due date, set when the episode is handed off (BR-38). */
  dueDate: string | null;
  /** Expected release day, inside the season window (BR-60). */
  expectedReleaseDate: string | null;
  approvedMediaAssetId: string | null;
  coinPrice: number | null;
  revisionStartedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Latest delivered version, if any. */
  mediaAssets: LatestMedia[];
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string | null;
  status: SeasonStatus;
  /** Token paid for one episode of this season (BR-37). */
  episodeProductionCost: number | string;
  releaseStartDate: string | null;
  releaseEndDate: string | null;
  episodes: Episode[];
}

/** IDEA travels with the studio brief; SYNOPSIS backs the summary viewers read. */
export type IdeaFilePurpose = 'IDEA' | 'SYNOPSIS';

export interface IdeaFile {
  id: string;
  fileName: string;
  purpose: IdeaFilePurpose;
  version: number;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface RevisionSummary {
  episodeCount: number;
  bySeason: { seasonNumber: number; episodeNumbers: number[] }[];
}

export interface ProjectDetail {
  id: string;
  title: string;
  ideaDescription: string;
  synopsis: string | null;
  defaultLanguage: string;
  ageRating: AgeRating | null;
  releaseYear: number | null;
  status: MovieStatus;
  posterUrl: string | null;
  reviewerId: string;
  creatorId: string | null;
  reviewer: Person;
  creator: Person | null;
  studio: Studio | null;
  cancelReason: string | null;
  handedOffAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  genres: Genre[];
  seasons: Season[];
  ideaFiles: IdeaFile[];
  studioHandoffs: StudioHandoff[];
  creatorAssignments: CreatorSeat[];
  productionFeeTokens: number;
  seasonFees: SeasonFee[];
  openChangeRequests: number;
  revision: RevisionSummary;
}

export interface ProjectEvent {
  id: string;
  action: string;
  entityType: string;
  actorType: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; fullName: string; role: UserRole } | null;
}

export interface PlatformSettings {
  freeStarterEpisodeCount: number;
  tokenRateVnd: number;
  coinRateVnd: number;
  episodeCoinPriceMin: number;
  episodeCoinPriceMax: number;
  bonusCoinExpiryDays: number;
  playbackHeartbeatTimeoutSeconds: number;
  subscriptionCancelWindowHours: number;
  planRenewalGraceHours: number;
  newMemberBonusCoins: number;
  coinTopUpMinVnd: number;
  coinTopUpMaxVnd: number;
  refundOnRemoval: boolean;
  updatedAt?: string;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}
