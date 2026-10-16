/** Studio catalog, hand-offs, the Creator team and change requests of a project, as the API returns them. */
import type {
  ChangeRequestStatus,
  ChangeRequestType,
  HandoffMaterialKind,
  MediaIngestStatus,
  StudioMilestoneStatus,
  TokenEntryType,
} from './production-enums';

export interface Person {
  id: string;
  fullName: string;
  email?: string;
}

/** A partner studio: third party, no account (BR-15, BR-59). */
export interface Studio {
  id: string;
  name: string;
  email: string;
  contactName: string | null;
  phone: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { movies: number; handoffs: number };
}

export interface HandoffMaterial {
  id: string;
  kind: HandoffMaterialKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number | string;
  createdAt: string;
}

export interface MilestoneEvent {
  id: string;
  fromStatus: StudioMilestoneStatus | null;
  toStatus: StudioMilestoneStatus;
  note: string | null;
  createdAt: string;
  changedBy: Person;
  /** The Submission recorded with a delivery. */
  mediaAsset: { id: string; version: number; episodeId: string; ingestStatus: MediaIngestStatus } | null;
}

/** One hand-off: which studio, which season (null = the whole project), when and with what (BR-58, BR-59). */
export interface StudioHandoff {
  id: string;
  studio: { id: string; name: string; email: string };
  season: { id: string; seasonNumber: number; title: string | null } | null;
  seasonId: string | null;
  productionFeeTokens: number | string;
  /** Token this hand-off cost when its studio was replaced (BR-59); 0 otherwise. */
  lostTokens: number | string;
  changeReason: string | null;
  briefFileKey: string | null;
  milestoneStatus: StudioMilestoneStatus;
  statusNote: string | null;
  respondedAt: string | null;
  declineReason: string | null;
  /** When the studio last mailed a film back to the Creator, and what it said. */
  filmSentAt: string | null;
  filmSentNote: string | null;
  createdAt: string;
  createdBy: Person;
  emailMessage: { status: 'QUEUED' | 'SENT' | 'FAILED'; sentAt: string | null; errorMessage: string | null } | null;
  materials: HandoffMaterial[];
  milestoneEvents: MilestoneEvent[];
}

/** A seat of a Creator on a project (BR-13). */
export interface CreatorSeat {
  id: string;
  creatorId: string;
  isActive: boolean;
  isLead: boolean;
  note: string | null;
  assignedAt: string;
  unassignedAt: string | null;
  delegatedFromId: string | null;
  creator: Person;
  assignedBy: Person;
  delegatedFrom: Person | null;
  episodes: { id: string; episodeNumber: number; title: string; assignedCreatorId: string | null }[];
}

/** Production fee of one season: what it costs against what was paid out (BR-37, BR-46). */
export interface SeasonFee {
  seasonId: string;
  seasonNumber: number;
  title: string | null;
  episodeProductionCost: number;
  episodeCount: number;
  baselineTokens: number;
  allocatedTokens: number;
  supplementTokens: number;
  correctionTokens: number;
  totalTokens: number;
  missingTokens: number;
  /** Spent on studios that were replaced: gone, never refunded (BR-59). */
  lostTokens: number;
  /** What a new brief of the season may still promise. */
  availableTokens: number;
  hasInitial: boolean;
}

export interface FeeEntry {
  id: string;
  entryType: TokenEntryType;
  amountTokens: number | string;
  rateVnd: number;
  reason: string | null;
  createdAt: string;
  createdBy: Person;
  season: { id: string; seasonNumber: number; title: string | null } | null;
}

export interface FeeLedger {
  totalTokens: number;
  totalVnd: number;
  seasons: SeasonFee[];
  entries: FeeEntry[];
}

export interface ChangeRequest {
  id: string;
  movieId: string;
  requestType: ChangeRequestType;
  content: string;
  reason: string;
  requestedTokens: number | string | null;
  attachmentName: string | null;
  status: ChangeRequestStatus;
  adminResponse: string | null;
  createdAt: string;
  resolvedAt: string | null;
  requestedBy: Person;
  resolvedBy: Person | null;
  season: { id: string; seasonNumber: number; title: string | null } | null;
  episode: { id: string; episodeNumber: number; title: string } | null;
  /** Only in the Admin's inbox. */
  movie?: { id: string; title: string; reviewerId: string };
}
