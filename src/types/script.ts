/**
 * MF-1 Script Workflow Types (Creator writes, Reviewer reviews, Admin approves Final Script)
 */

export type ScriptStatus =
  | 'SUBMITTED'
  | 'REVIEWER_APPROVED'
  | 'REVISION_REQUESTED'
  | 'FINAL';

export type ScriptReviewStage = 'REVIEWER' | 'ADMIN';

export interface ScriptVersion {
  id: string;
  projectId: string;
  version: number;
  content: string;
  note?: string | null;
  submittedById: string;
  submittedBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

export interface ScriptReview {
  id: string;
  projectId: string;
  version: number;
  stage: ScriptReviewStage;
  approved: boolean;
  comment?: string | null;
  reviewerId: string;
  reviewer?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

export interface ProjectScript {
  projectId: string;
  status: ScriptStatus;
  currentVersion: number;
  finalizedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  versions: ScriptVersion[];
  reviews: ScriptReview[];
}

export interface SubmitScriptInput {
  content: string;
  note?: string;
}

export interface ReviewScriptInput {
  approve: boolean;
  comment?: string;
}

export interface FinalReviewScriptInput extends ReviewScriptInput {
  studioId?: string;
  terms?: string;
}
