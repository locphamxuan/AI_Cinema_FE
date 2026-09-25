/**
 * Request DTOs of the NestJS MF-1 endpoints. The acting user (creator,
 * reviewer, allocator, publisher) always comes from the JWT, never the body.
 */

import type { ApiLabelType, ComplianceCheckType, ComplianceResult, GenerationJobType, MilestoneStatus, ProductionContentType, QuotaAllocationType, ReviewDecisionValue } from './workflow-api-enums';

export interface CreateMilestoneDto {
  title: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
}

export interface CreateProductionProjectDto {
  title: string;
  description?: string;
  contentType: ProductionContentType;
  defaultEpisodeDurationSeconds?: number;
  /** One DRAFT plan is auto-created per episode. */
  episodeCount?: number;
  productionStartDate: string;
  deadline: string;
  plannedReleaseDate: string;
  totalAiQuotaBudget: number;
  genreIds?: string[];
  policyIds?: string[];
  /** BCP-47 codes every episode ships subtitles in; defaults to ["vi"]. */
  subtitleLanguages?: string[];
  assignedCreatorId: string;
  /** Every episode in order with its season and allotted duration; seasons may differ in size. */
  episodes?: { seasonNumber: number; targetDurationSeconds: number }[];
  milestones?: CreateMilestoneDto[];
}

export interface UpdateMilestoneDto {
  title?: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
  status?: MilestoneStatus;
  resultText?: string;
}

/** The whole plan the Creator is still writing (or reworking after a change request); scenes left out are deleted. */
export interface SavePlanDraftDto {
  scriptText?: string;
  targetDurationSeconds?: number;
  estimatedAiResourceUsage?: number;
  scenes: {
    id?: string;
    sceneNumber: number;
    title: string;
    description?: string;
    targetDurationSeconds: number;
    estimatedTokens?: number;
  }[];
}

export interface SubmitProductionPlanDto {
  scriptText: string;
  targetDurationSeconds: number;
  estimatedAiResourceUsage: number;
  /** Final script of every existing scene of the plan. */
  scenes: { sceneId: string; scriptText: string }[];
}

export interface CreatePlanReviewDto {
  /** Defaults to every scene of the plan; the plan-level fields are always included. */
  sceneIds?: string[];
  comments?: string;
}

export interface DecideReviewDto {
  decision: ReviewDecisionValue;
  comments?: string;
  rejectionReason?: string;
}

export interface CreateQuotaAllocationDto {
  allocationType: QuotaAllocationType;
  allocatedAmount: number;
}

export interface CreateQuotaRequestDto {
  requestedAmount: number;
  reason: string;
}

export interface ApproveQuotaRequestDto {
  /** Defaults to the amount the Creator asked for. */
  approvedAmount?: number;
  note?: string;
}

export interface RejectQuotaRequestDto {
  note: string;
}

export interface CreateGenerationJobDto {
  jobType: GenerationJobType;
  prompt?: string;
  customFunction?: string;
  sceneId?: string;
  parentJobId?: string;
  configSnapshot?: Record<string, unknown>;
}

export interface CreateEpisodePackageDto {
  assemblyJobId?: string;
  assetIds?: string[];
}

export interface CreateEpisodeSubmissionDto {
  note?: string;
}

export interface CreateReviewDto {
  submissionId?: string;
  comments?: string;
}

export interface CreateAiContentLabelDto {
  labelType: ApiLabelType;
  labelText: string;
  displayLocation?: string;
  policyId: string;
}

/** All six checks of one compliance review, recorded at once (BR-42). */
export interface RecordComplianceReviewDto {
  policyId: string;
  checks: { checkType: ComplianceCheckType; result: ComplianceResult; failureReason?: string }[];
}

export interface CreatePublicationDto {
  packageId: string;
  scheduledAt?: string;
}
