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

/** A note on the idea and direction of a project, between the Admin, the lead Creator and the Reviewer (MF-1 §1). */
export interface ProjectNote {
  id: string;
  message: string;
  createdAt: string;
  author: { id: string; fullName: string; role: string } | null;
}

/** A STUDIO login the Admin opened for a partner studio; it signs in to Studio Web only. */
export interface StudioAccount {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDIO';
  isActive: boolean;
  studioId: string;
  createdAt?: string;
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

/** A partner studio (BR-59); since MF-1 07/11/2026 it signs in to Studio Web with STUDIO accounts. */
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
