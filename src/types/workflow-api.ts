/**
 * Response shapes of the NestJS MF-1 endpoints; they only list the fields the
 * workspace reads. Decimal columns arrive as strings, hence `number | string`.
 * Enums and request DTOs live in their own files and are re-exported here.
 */

import type { ApiLabelType, AssetType, ComplianceCheckType, ComplianceResult, EpisodeProductionStatus, GenerationJobStatus, GenerationJobType, MilestoneStatus, PlanReviewField, ProductionPlanStatus, ProductionProjectStatus, QuotaAllocationStatus, QuotaAllocationType, QuotaRequestStatus, ReviewStatus, UserRole } from './workflow-api-enums';

export type * from './workflow-api-enums';
export type * from './workflow-api-requests';

export interface Paginated<T> {
  data: T[];
}

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

/** Platform-wide limits the Admin configures. */
export interface ApiPlatformSetting {
  /** Longest an episode may be allotted or planned, in seconds; null means no limit. */
  maxEpisodeDurationSeconds: number | null;
  updatedAt: string | null;
}

export interface ApiGenre {
  id: string;
  name: string;
  description?: string | null;
}

export interface ApiPolicy {
  id: string;
  name: string;
  type: string;
  version: string;
  isActive: boolean;
}

export interface ApiMilestone {
  id: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  targetDate?: string | null;
  status: MilestoneStatus;
  resultText?: string | null;
}

export interface ApiScene {
  id: string;
  sceneNumber: number;
  title: string;
  description?: string | null;
  scriptText?: string | null;
  targetDurationSeconds: number;
  estimatedTokens: number;
  status: string;
}

/** A user as embedded in a response: who reviewed or granted something. */
export interface ApiActor {
  id: string;
  fullName: string;
}

export interface ApiPlanReview {
  id: string;
  reviewer?: ApiActor;
  field: PlanReviewField;
  sceneId: string | null;
  status: ReviewStatus;
  comments?: string | null;
  rejectionReason?: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface ApiQuotaAllocation {
  id: string;
  allocationType: QuotaAllocationType;
  allocatedAmount: number | string;
  remainingAmount: number | string;
  status: QuotaAllocationStatus;
  allocatedBy?: ApiActor | null;
  createdAt: string;
}

/** A Creator's request for more tokens on a plan; approving it grants a TOP_UP allocation. */
export interface ApiQuotaRequest {
  id: string;
  requestedAmount: number;
  reason: string;
  status: QuotaRequestStatus;
  decisionNote: string | null;
  quotaAllocationId: string | null;
  requestedBy?: ApiActor | null;
  decidedBy?: ApiActor | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface ApiComplianceCheck {
  id: string;
  checkType: ComplianceCheckType;
  result: ComplianceResult;
  failureReason?: string | null;
  checkedAt: string | null;
}

/** Result of recording a full compliance review: the package verdict plus every stored check. */
export interface ApiComplianceVerdict {
  verdict: ComplianceResult;
  checks: ApiComplianceCheck[];
}

export interface ApiReview {
  id: string;
  reviewer?: ApiActor;
  status: ReviewStatus;
  comments?: string | null;
  rejectionReason?: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface ApiAiContentLabel {
  id: string;
  labelType: ApiLabelType;
  labelText: string;
  displayLocation?: string | null;
}

/** Movie returned when a package enters the catalog; only its episodes are read. */
export interface ApiCatalogEntry {
  id: string;
  episodes: { id: string; currentPackageId: string | null }[];
}

export interface ApiPublication {
  id: string;
  episodeId: string;
  episodePackageId: string;
  scheduledAt: string | null;
  publishedAt: string | null;
}

export interface ApiEpisodePackage {
  id: string;
  packageVersion: number;
  createdAt: string;
  /** Transcoded final cut: HLS master playlist, its renditions and total length. */
  streamUrl: string | null;
  qualities: string[];
  durationSeconds: number | null;
  subtitles: { language: string }[];
  submissions: { id: string; status: string; createdAt: string }[];
  reviews: ApiReview[];
  complianceChecks: ApiComplianceCheck[];
  aiContentLabels: ApiAiContentLabel[];
  currentForEpisode: {
    id: string;
    productionStatus: EpisodeProductionStatus;
    publications: ApiPublication[];
  } | null;
}

export interface ApiProductionPlan {
  id: string;
  /** Running number across the project; seasonEpisodeNumber is the number viewers see. */
  episodeNumber: number;
  seasonNumber: number;
  seasonEpisodeNumber: number;
  /** Duration the Reviewer allotted this episode at project creation. */
  allottedDurationSeconds?: number | null;
  planVersion: number;
  status: ProductionPlanStatus;
  scriptText?: string | null;
  productionApproach?: string | null;
  targetDurationSeconds?: number | null;
  estimatedAiResourceUsage?: number | string | null;
  createdAt: string;
  updatedAt: string;
  scenes: ApiScene[];
  planReviews: ApiPlanReview[];
  quotaAllocations: ApiQuotaAllocation[];
  /** Top-up requests, newest first. */
  quotaRequests: ApiQuotaRequest[];
  _count: { generationJobs: number };
  episodePackages: ApiEpisodePackage[];
}

export interface ApiProductionProject {
  id: string;
  title: string;
  description?: string | null;
  status: ProductionProjectStatus;
  episodeCount: number;
  productionStartDate?: string | null;
  deadline?: string | null;
  plannedReleaseDate?: string | null;
  defaultEpisodeDurationSeconds?: number | null;
  totalAiQuotaBudget: number | string;
  remainingAiQuotaBudget: number | string;
  createdAt: string;
  updatedAt: string;
  assignedCreator?: { id: string; fullName: string } | null;
  createdBy?: { id: string; fullName: string } | null;
  milestones?: ApiMilestone[];
  productionProjectGenres?: { genre: { id: string; name: string } }[];
  /** Only returned by the detail endpoint. */
  productionPlans?: ApiProductionPlan[];
}

export interface ApiGeneratedAsset {
  id: string;
  assetType: AssetType;
  contentText?: string | null;
  storageKey?: string | null;
  mimeType?: string | null;
  durationSeconds?: number | null;
  createdAt?: string;
}

export interface ApiGenerationJob {
  id: string;
  jobType: GenerationJobType;
  status: GenerationJobStatus;
  sceneId: string | null;
  attemptNumber: number;
  parentJobId: string | null;
  rawPrompt: string | null;
  customFunction: string | null;
  estimatedTokenCost: number;
  resourceCost: number | string | null;
  outputDurationSeconds: number | string | null;
  errorMessage: string | null;
  createdAt: string;
  aiModel: { id: string; name: string };
  generatedAssets: ApiGeneratedAsset[];
}

/** Model a job type is routed to, with its planning estimate (BR-40, BR-41). */
export interface ApiRoutingRow {
  jobType: GenerationJobType;
  provider: string;
  model: string;
  modality: string;
  estimatedTokenCost: number;
}

/** Route of one job, including a described CUSTOM function. */
export interface ApiRoute extends ApiRoutingRow {
  match: 'catalog' | 'specialist' | 'general';
}
