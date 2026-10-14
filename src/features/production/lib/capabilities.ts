import { PERMISSION, type PermissionKey } from '@/lib/permissions';
import type { EpisodeStatus, MovieStatus } from '@/types/production';

/** Same groups as the backend's project-rules.ts, so buttons only show when the API would accept them. */
export const OPEN_PROJECT: MovieStatus[] = ['DRAFT', 'ASSIGNED', 'IN_PRODUCTION'];
export const DELIVERY_PROJECT: MovieStatus[] = ['IN_PRODUCTION', 'UNDER_REVISION'];
export const EDITABLE_PROJECT: MovieStatus[] = [...OPEN_PROJECT, 'COMPLETED', 'UNDER_REVISION'];
export const RELEASING_PROJECT: MovieStatus[] = [...DELIVERY_PROJECT, 'COMPLETED'];
/** The team of Creators can change while the project is open or being fixed (BR-13). */
export const TEAM_EDITABLE_PROJECT: MovieStatus[] = [...OPEN_PROJECT, 'UNDER_REVISION'];

export const SUBMITTABLE_EPISODE: EpisodeStatus[] = ['AWAITING_MEDIA', 'IN_REVIEW', 'CHANGES_REQUESTED'];
export const BEFORE_APPROVAL_EPISODE: EpisodeStatus[] = ['DRAFT', 'AWAITING_MEDIA', 'PROCESSING', 'IN_REVIEW', 'CHANGES_REQUESTED'];
export const REVIEWED_EPISODE: EpisodeStatus[] = ['APPROVED', 'LABELED', 'COMPLIANCE_PASSED'];
export const RELEASABLE_EPISODE: EpisodeStatus[] = ['COMPLIANCE_PASSED', 'UNPUBLISHED', 'SCHEDULED'];

export interface ProjectCapabilities {
  /** The Reviewer who owns the project and may manage it. */
  manage: boolean;
  /** A Content Creator of the project: its lead or one with an active seat (BR-13). */
  creator: boolean;
  /** The lead Creator, who also gives episodes to the others. */
  lead: boolean;
  feeAllocate: boolean;
  handoff: boolean;
  ingest: boolean;
  review: boolean;
  publish: boolean;
  /** Send the Admin a change request: the Reviewer in charge or a Creator of the team. */
  suggest: boolean;
  /** Hand episodes over to another Creator. */
  delegate: boolean;
  status: MovieStatus;
}

export function projectCapabilities(
  project: {
    status: MovieStatus;
    reviewerId: string;
    creatorId: string | null;
    creatorAssignments?: { creatorId: string }[];
  },
  userId: string | undefined,
  can: (p: PermissionKey) => boolean,
): ProjectCapabilities {
  const owner = !!userId && project.reviewerId === userId;
  const lead = !!userId && project.creatorId === userId;
  const creator = lead || (!!userId && !!project.creatorAssignments?.some((seat) => seat.creatorId === userId));
  return {
    manage: owner && can(PERMISSION.PROJECT_MANAGE),
    creator,
    lead,
    feeAllocate: owner && can(PERMISSION.PROJECT_FEE_ALLOCATE),
    handoff: creator && can(PERMISSION.STUDIO_HANDOFF),
    ingest: creator && can(PERMISSION.MEDIA_INGEST),
    review: owner && can(PERMISSION.CONTENT_REVIEW),
    publish: owner && can(PERMISSION.EPISODE_PUBLISH),
    suggest: (owner || creator) && can(PERMISSION.PROJECT_SUGGEST),
    delegate: creator && can(PERMISSION.MEDIA_INGEST),
    status: project.status,
  };
}

export function isIn<T>(value: T, list: readonly T[]): boolean {
  return list.includes(value);
}
