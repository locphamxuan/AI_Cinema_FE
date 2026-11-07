/** Studio catalog, hand-offs, the Creator team and change requests of a project, as the API returns them. */
import type {
  ChangeRequestStatus,
  ChangeRequestType,
  HandoffMaterialKind,
  MediaIngestStatus,
  StudioMilestoneStatus,
} from './production-enums';

/** A note between the Creator holding an episode and the lead Creator (BR-67). */
export interface EpisodeNote {
  id: string;
  message: string;
  createdAt: string;
  author: { id: string; fullName: string } | null;
}

export interface Person {
  id: string;
  fullName: string;
  email?: string;
}

/** The project a production row belongs to, as lists show it: who owns it and the movie title. */
export interface ProjectRef {
  id: string;
  reviewerId: string;
  creatorId: string | null;
  movie: { title: string };
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
  _count?: { projects: number; handoffs: number };
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

/** The link the studio last mailed for one episode of a hand-off: downloaded, or imported as the Submission. */
export interface StudioFilmLink {
  id: string;
  episodeId: string;
  version: string;
  fileName: string;
  url: string;
  sentAt: string;
  episode: { episodeNumber: number };
}

/** One hand-off: which studio, which season (null = the whole project), when and with what (BR-58, BR-59). */
export interface StudioHandoff {
  id: string;
  studio: { id: string; name: string; email: string };
  season: { id: string; seasonNumber: number; title: string | null } | null;
  seasonId: string | null;
  /** Fixed fee (VND) the brief offered the studio. */
  offeredFeeVnd: number | string;
  /** VND the studio kept when it was replaced (BR-59); 0 otherwise. */
  forfeitedVnd: number | string;
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
  filmLinks: StudioFilmLink[];
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

export interface ChangeRequest {
  id: string;
  projectId: string;
  requestType: ChangeRequestType;
  content: string;
  reason: string;
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
  project?: ProjectRef;
}
