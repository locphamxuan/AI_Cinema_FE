/** The script of a movie project (AI_Cinema_BE script): the lead Creator writes, the Reviewer then the Admin approve. */
import type { Person } from './production-studio';

/** SUBMITTED waits for the Reviewer, REVIEWER_APPROVED for the Admin; FINAL is locked. */
export type ScriptStatus = 'SUBMITTED' | 'REVIEWER_APPROVED' | 'REVISION_REQUESTED' | 'FINAL';
export type ScriptReviewStage = 'REVIEWER' | 'ADMIN';

export interface ScriptVersion {
  id: string;
  version: number;
  content: string;
  /** What changed since the previous version. */
  note: string | null;
  createdAt: string;
  submittedBy: Person;
}

export interface ScriptReview {
  id: string;
  version: number;
  stage: ScriptReviewStage;
  approved: boolean;
  comment: string | null;
  createdAt: string;
  reviewer: Person;
}

/** The script with every version and review, newest first; the API answers null before the first submission. */
export interface ProjectScript {
  projectId: string;
  status: ScriptStatus;
  currentVersion: number;
  finalizedAt: string | null;
  versions: ScriptVersion[];
  reviews: ScriptReview[];
}

/** The Admin approves the Final Script (picking the studio if the project has none) or sends it back. */
export interface FinalScriptReviewInput {
  approve: boolean;
  comment?: string;
  studioId?: string;
  /** Working terms of the template contract; a standard clause otherwise. */
  terms?: string;
}
