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

/** Notes on the idea are written while the project is open or being fixed (BE project-note.service). */
export const NOTE_PROJECT: MovieStatus[] = [...OPEN_PROJECT, 'UNDER_REVISION'];
/** The script is written, reviewed and finalised while the project is ASSIGNED (BE script.service). */
export const SCRIPT_PROJECT: MovieStatus[] = ['ASSIGNED'];

export interface ProjectCapabilities {
  /** The Reviewer in charge of the project. */
  owner: boolean;
  /** The Reviewer who owns the project and may manage it: structure, deadlines, cancel. */
  manage: boolean;
  /** Create projects and assign (or reassign) the lead Creator: the Admin (MF-1 step 1). */
  create: boolean;
  /** A Content Creator of the project: its lead or one with an active seat (BR-13). */
  creator: boolean;
  /** The lead Creator, who also gives episodes to the others. */
  lead: boolean;
  /** Set and correct the production budget (VND): the Admin. */
  costAdjust: boolean;
  /** Ask the Admin for more production cost: the Reviewer who owns the project. */
  costRequest: boolean;
  /** Send, sign or counter-propose a hand-off's contract: the Admin. */
  contractManage: boolean;
  /** Follow the hand-off the signed contract opened: change studio, move milestones. Only the lead (BE `lead` role). */
  handoff: boolean;
  /** Write and submit the script: the lead Creator. */
  scriptWrite: boolean;
  /** Approve the Final Script or send it back: the Admin. */
  scriptApprove: boolean;
  ingest: boolean;
  /** Review scripts and films, then confirm the Final Film: the Reviewer in charge. */
  review: boolean;
  /** Set the Coin price of an episode: the Reviewer in charge. */
  price: boolean;
  /** Publish, schedule, take down or send back the Final Film: the Admin only (MF-1, 07/11/2026). */
  publish: boolean;
  /** Write in the idea notes: the Admin, the lead Creator and the Reviewer in charge. */
  note: boolean;
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
  const create = can(PERMISSION.PROJECT_CREATE);
  return {
    owner,
    manage: owner && can(PERMISSION.PROJECT_MANAGE),
    create,
    creator,
    lead,
    costAdjust: can(PERMISSION.COST_ADJUST),
    costRequest: owner && can(PERMISSION.COST_REQUEST),
    contractManage: can(PERMISSION.CONTRACT_MANAGE),
    handoff: lead && can(PERMISSION.STUDIO_HANDOFF),
    scriptWrite: lead && can(PERMISSION.SCRIPT_WRITE),
    scriptApprove: can(PERMISSION.SCRIPT_APPROVE),
    ingest: creator && can(PERMISSION.MEDIA_INGEST),
    review: owner && can(PERMISSION.CONTENT_REVIEW),
    price: owner && can(PERMISSION.EPISODE_PRICE),
    publish: can(PERMISSION.EPISODE_PUBLISH),
    note: create || lead || owner,
    suggest: (owner || creator) && can(PERMISSION.PROJECT_SUGGEST),
    delegate: creator && can(PERMISSION.MEDIA_INGEST),
    status: project.status,
  };
}

/** An episode is worked on by the Creator it was given to or the lead; one given to nobody is the lead's. */
export function holdsEpisode(caps: ProjectCapabilities, episode: { assignedCreatorId: string | null }, userId: string | undefined): boolean {
  return caps.lead || (caps.creator && !!userId && episode.assignedCreatorId === userId);
}

export function isIn<T>(value: T, list: readonly T[]): boolean {
  return list.includes(value);
}
