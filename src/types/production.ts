/** MF-1 (movie project management & publishing) as the NestJS API returns it; dates are ISO strings. */
import type {
  AgeRating,
  ChangeRequestStatus,
  EpisodeStatus,
  MediaIngestStatus,
  MovieStatus,
  TokenEntryType,
  UserRole,
} from './production-enums';

export * from './production-enums';
export * from './production-media';
export * from './production-requests';

export interface Person {
  id: string;
  fullName: string;
  email?: string;
}

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
  studioName: string | null;
  reviewerId: string;
  creatorId: string | null;
  reviewer: Person;
  creator: Person | null;
  updatedAt: string;
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
  episodeNumber: number;
  title: string;
  synopsis: string | null;
  status: EpisodeStatus;
  targetDurationSeconds: number;
  /** Reviewer milestone; null only on episodes created before milestones existed. */
  milestoneDate: string | null;
  dueDate: string | null;
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
  episodes: Episode[];
}

export interface IdeaFile {
  id: string;
  fileName: string;
  version: number;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface StudioHandoff {
  id: string;
  studioName: string;
  studioEmail: string;
  studioContact: string | null;
  productionFeeTokens: number;
  changeReason: string | null;
  briefFileKey: string | null;
  createdAt: string;
  createdBy: Person;
  emailMessage?: { status: 'QUEUED' | 'SENT' | 'FAILED'; sentAt: string | null; errorMessage: string | null } | null;
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
  studioName: string | null;
  studioEmail: string | null;
  studioContact: string | null;
  cancelReason: string | null;
  assignedAt: string | null;
  handedOffAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  genres: Genre[];
  seasons: Season[];
  ideaFiles: IdeaFile[];
  studioHandoffs: StudioHandoff[];
  productionFeeTokens: number;
  openChangeRequests: number;
  revision: RevisionSummary;
}

export interface FeeEntry {
  id: string;
  entryType: TokenEntryType;
  amountTokens: number;
  rateVnd: number;
  reason: string | null;
  createdAt: string;
  createdBy: Person;
}

export interface FeeLedger {
  totalTokens: number;
  totalVnd: number;
  entries: FeeEntry[];
}

export interface ChangeRequest {
  id: string;
  content: string;
  status: ChangeRequestStatus;
  reviewerResponse: string | null;
  createdAt: string;
  resolvedAt: string | null;
  requestedBy: Person;
  resolvedBy: Person | null;
  episode: { id: string; episodeNumber: number; title: string } | null;
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
