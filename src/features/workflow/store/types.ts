import {
  Role,
  ProductionProject,
  ProjectMilestone,
  EpisodePackage,
  ContentBrief,
  GenerationJob,
  GenerationStep,
  SceneReviewStatus,
  PlanFieldKey,
} from '@/types/workflow';
import type { ApiRoutingRow } from '@/types/workflow-api';
import type { ManualComplianceCheck } from '@/features/workflow/components/reviewer/audit/ComplianceStation';

export interface ViewSlice {
  currentRole: Role;
  setRole: (role: Role) => void;
  activeProjectId: string;
  activePackageId: string;
  setActiveProject: (id: string) => void;
  setActivePackage: (id: string) => void;
}

export interface EpisodeSlice {
  project: ProductionProject;
  /** Roster of every project assigned to the current user (both roles read this for the sidebar's assigned/completed lists). */
  projects: ProductionProject[];

  getPackage: (packageId?: string) => EpisodePackage | undefined;
  getBrief: (packageId?: string) => ContentBrief | undefined;
  getJobs: (packageId?: string) => GenerationJob[];

  /** Edits the local plan draft; nothing reaches the backend until the plan is submitted. */
  updateContentBrief: (packageId: string, briefData: Partial<ContentBrief>) => void;
  /** Saves the plan as a draft on the server (scenes, script, duration, estimate) without submitting it. */
  savePlanDraft: (packageId: string) => Promise<boolean>;
  /** Saves the draft's scenes, then submits the plan for review. */
  submitProductionPlan: (packageId: string) => Promise<boolean>;
  /** Rewrites the project-level overall script and resets its review when the text changed; the version comes from the server. */
  updateOverallScript: (script: string) => void;
  /** Draft steps only — generated steps are backend jobs and stay read-only. */
  addGenerationStep: (packageId: string, jobId: string, step: Omit<GenerationStep, 'id'>) => void;
  updateGenerationStep: (packageId: string, jobId: string, stepId: string, data: Partial<GenerationStep>) => void;
  removeGenerationStep: (packageId: string, jobId: string, stepId: string) => void;
  createProject: (data: {
    title: string;
    creator_id: string;
    genre_ids: string[];
    /** Languages every episode ships subtitles in; the first is the source language. */
    subtitle_languages: string[];
    synopsis: string;
    /** Every episode in order with its season and the duration (minutes) the Reviewer allots it. */
    episodes: { season_number: number; duration_minutes: number }[];
    total_budget_tokens: number;
    production_start_date: string;
    deadline: string;
    planned_release_date: string;
    milestones?: ProjectMilestone[];
  }) => Promise<boolean>;
  loadProjects: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  /** Reports progress on a milestone; completing it needs what was achieved. */
  updateMilestoneStatus: (milestoneId: string, status: 'pending' | 'in_progress' | 'completed', result?: string) => Promise<boolean>;
}


export interface ProductionSlice {
  /** Model and estimate per job type, from the backend (BR-40). */
  routing: ApiRoutingRow[];
  loadRouting: () => Promise<void>;
  /** Sets a draft step's function and routes it to its model; a custom function is resolved by the backend. */
  routeStep: (
    packageId: string,
    sceneJobId: string,
    stepId: string,
    change: Pick<GenerationStep, 'function_type' | 'custom_function'>
  ) => Promise<void>;
  /** Loads the plan's generation jobs into the episode's scene rows, keeping draft steps. */
  loadJobs: (packageId: string) => Promise<void>;
  /** Generates the scene's draft steps, or regenerates its saved ones when it has no drafts (BR-41). */
  triggerGenerationJob: (packageId: string, sceneJobId: string) => Promise<boolean>;
  /** Completes every scene, assembles the episode package and submits it for review. */
  submitEpisodePackage: (packageId: string) => Promise<boolean>;
}

export interface ReviewSlice {
  reviewScene: (packageId: string, sceneNumber: number, status: SceneReviewStatus, comment?: string) => Promise<boolean>;
  /** Field-level review of the overall script, or an episode's duration/token estimate (BR-39). */
  reviewPlanField: (packageId: string, field: PlanFieldKey, status: SceneReviewStatus, comment?: string) => Promise<boolean>;
  /** Sends every still-undecided field back with the flagged ones, which closes the round as CHANGES_REQUESTED. */
  requestPlanChanges: (packageId: string, feedbackNotes: string) => Promise<boolean>;
  allocateQuota: (packageId: string, tokenQuota: number) => Promise<boolean>;
  /** Creator asks for more tokens on an episode already in production. */
  requestQuota: (packageId: string, amount: number, reason: string) => Promise<boolean>;
  /** Grants a pending request as a top-up; `amount` defaults to what the Creator asked for. */
  approveQuotaRequest: (requestId: string, amount?: number, note?: string) => Promise<boolean>;
  rejectQuotaRequest: (requestId: string, note: string) => Promise<boolean>;
  requestContentChanges: (packageId: string, feedbackNotes: string) => Promise<boolean>;
}

export interface ComplianceSlice {
  /** Approves the submitted cut, attaches the AI label and records every compliance check (BR-42). */
  passCompliance: (packageId: string, checks: Record<ManualComplianceCheck, boolean>, labelDisplayLocation: string) => Promise<boolean>;
  /** Puts the package in the catalog and publishes it; `scheduledAt` is recorded on the publication. */
  publishEpisode: (packageId: string, scheduledAt?: string) => Promise<boolean>;
}

export type WorkflowStoreState = ViewSlice &
  EpisodeSlice &
  ProductionSlice &
  ReviewSlice &
  ComplianceSlice & {
    resetWorkspace: () => Promise<void>;
  };
