import { PERMISSION, type PermissionKey } from '@/lib/permissions';
import type { ContractStatus } from '@/types/contract';
import type { EpisodeStatus, MovieStatus, StudioHandoff } from '@/types/production';

/** Same groups as the backend's project-rules.ts, so buttons only show when the API would accept them. */
export const OPEN_PROJECT: MovieStatus[] = ['DRAFT', 'ASSIGNED', 'IN_PRODUCTION'];
export const DELIVERY_PROJECT: MovieStatus[] = ['IN_PRODUCTION', 'UNDER_REVISION'];
export const EDITABLE_PROJECT: MovieStatus[] = [...OPEN_PROJECT, 'COMPLETED', 'UNDER_REVISION'];
export const RELEASING_PROJECT: MovieStatus[] = [...DELIVERY_PROJECT, 'COMPLETED'];
/** The team of Creators can change while the project is open or being fixed (BR-13). */
export const TEAM_EDITABLE_PROJECT: MovieStatus[] = [...OPEN_PROJECT, 'UNDER_REVISION'];

export const BEFORE_APPROVAL_EPISODE: EpisodeStatus[] = ['DRAFT', 'AWAITING_MEDIA', 'PROCESSING', 'IN_REVIEW', 'CHANGES_REQUESTED'];
export const REVIEWED_EPISODE: EpisodeStatus[] = ['APPROVED', 'LABELED', 'COMPLIANCE_PASSED'];
export const RELEASABLE_EPISODE: EpisodeStatus[] = ['COMPLIANCE_PASSED', 'UNPUBLISHED', 'SCHEDULED'];

/** Contract rounds still being negotiated (BE OPEN_CONTRACT_STATUSES); a project has at most one at a time. */
export const OPEN_CONTRACT: ContractStatus[] = ['SENT', 'STUDIO_SIGNED', 'ADMIN_COUNTERED'];

/**
 * The round a hand-off waits on: after a studio change the new hand-off stays BRIEF_SENT until its contract is
 * signed (BE contract-handoff.service). Null once it started, or for a hand-off with no open round.
 */
export function waitingRound(handoff: Pick<StudioHandoff, 'milestoneStatus' | 'contracts'>) {
  if (handoff.milestoneStatus !== 'BRIEF_SENT') return null;
  return [...(handoff.contracts ?? [])].reverse().find((c) => isIn(c.status, OPEN_CONTRACT)) ?? null;
}

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
  /** Write and submit the script: the lead Creator. */
  scriptWrite: boolean;
  /** Approve the Final Script or send it back: the Admin. */
  scriptApprove: boolean;
  ingest: boolean;
  /** Review scripts and films, then confirm the Final Film: the Reviewer in charge. */
  review: boolean;
  /** Set the Coin price and access flags of an episode: the Admin only (MF-1 / BE 12/11/2026). */
  price: boolean;
  /** Publish, schedule, take down or send back the Final Film: the Admin only (MF-1, 07/11/2026). */
  publish: boolean;
  /** Cancel the project while no episode was published: the Admin only (BR-39). */
  canCancel: boolean;
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
    scriptWrite: lead && can(PERMISSION.SCRIPT_WRITE),
    scriptApprove: can(PERMISSION.SCRIPT_APPROVE),
    ingest: creator && can(PERMISSION.MEDIA_INGEST),
    review: owner && can(PERMISSION.CONTENT_REVIEW),
    price: can(PERMISSION.EPISODE_PRICE) && (create || owner),
    publish: can(PERMISSION.EPISODE_PUBLISH),
    canCancel: create,
    note: create || lead || owner,
    suggest: (owner || creator) && can(PERMISSION.PROJECT_SUGGEST),
    delegate: creator && can(PERMISSION.MEDIA_INGEST),
    status: project.status,
  };
}

export type ProjectTabKey =
  | 'overview'
  | 'script'
  | 'episodes'
  | 'team'
  | 'studio'
  | 'fee'
  | 'contract'
  | 'changes'
  | 'activity';

/**
 * MF-1 & BE role matrix: hide tabs whose workflow belongs strictly to other roles
 * (e.g. Creator never sees Studio handoffs, Cost, or Contracts; Reviewer never negotiates Contracts).
 */
export function isProjectTabVisible(key: ProjectTabKey, can: (p: PermissionKey) => boolean): boolean {
  switch (key) {
    case 'team':
      return (
        can(PERMISSION.PROJECT_MANAGE) ||
        can(PERMISSION.PROJECT_CREATE) ||
        can(PERMISSION.PROJECT_READ_ALL) ||
        can(PERMISSION.MEDIA_INGEST)
      );
    case 'studio':
      return can(PERMISSION.PROJECT_MANAGE) || can(PERMISSION.PROJECT_READ_ALL) || can(PERMISSION.CONTRACT_MANAGE);
    case 'fee':
      return can(PERMISSION.COST_ADJUST) || can(PERMISSION.COST_REQUEST) || can(PERMISSION.COST_APPROVE);
    case 'contract':
      return can(PERMISSION.CONTRACT_MANAGE);
    case 'changes':
      return (
        can(PERMISSION.PROJECT_SUGGEST) ||
        can(PERMISSION.PROJECT_CHANGE_REVIEW) ||
        can(PERMISSION.PROJECT_READ_ALL)
      );
    default:
      return true;
  }
}

export function isIn<T>(value: T, list: readonly T[]): boolean {
  return list.includes(value);
}
