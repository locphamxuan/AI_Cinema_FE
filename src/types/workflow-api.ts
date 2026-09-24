/**
 * Request DTOs and response shapes of the NestJS MF-1 endpoints. Responses
 * only list the fields the workspace reads. The acting user (creator,
 * reviewer, allocator, publisher) always comes from the JWT, never the body.
 * Decimal columns arrive as strings, hence `number | string`.
 */

// ==========================================
// 1. ENUMS (matching the Prisma schema)
// ==========================================

export type UserRole = 'MEMBER' | 'CONTENT_CREATOR' | 'CONTENT_REVIEWER' | 'STAFF' | 'ADMIN';

export type ProductionProjectStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type ProductionContentType = 'MOVIE' | 'SERIES';

export type MilestoneStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ProductionPlanStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED';

export type ReviewStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export type ReviewDecisionValue = 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';

export type PlanReviewField = 'SCENE' | 'OVERALL_SCRIPT' | 'DURATION' | 'TOKEN_ESTIMATE';

export type QuotaAllocationType = 'INITIAL' | 'TOP_UP';

export type QuotaAllocationStatus = 'ACTIVE' | 'CONSUMED' | 'RETURNED' | 'SUPERSEDED';

export type QuotaRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type GenerationJobType =
  | 'SCRIPT'
  | 'VOICE'
  | 'BACKGROUND_AUDIO'
  | 'SUBTITLE'
  | 'TRANSLATION'
  | 'POSTER'
  | 'THUMBNAIL'
  | 'VIDEO_ASSEMBLY'
  | 'SCENE_IMAGE'
  | 'SCENE_VIDEO'
  | 'CUSTOM';

export type GenerationJobStatus = 'PENDING' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type AssetType = 'SCRIPT' | 'DUB_AUDIO' | 'BACKGROUND_AUDIO' | 'SUBTITLE' | 'POSTER' | 'THUMBNAIL' | 'VIDEO' | 'IMAGE';

export type ApiLabelType = 'AI_GENERATED' | 'AI_EDITED' | 'AI_ASSISTED';

export type ComplianceCheckType =
  | 'AI_LABEL_PRESENCE'
  | 'CONTENT_POLICY'
  | 'COPYRIGHT'
  | 'LEGAL'
  | 'WATERMARK'
  | 'REAL_PERSON_LIKENESS';

export type ComplianceResult = 'PENDING' | 'PASS' | 'FAIL';

export type EpisodeProductionStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';

// ==========================================
// 2. REQUEST DTOs
// ==========================================

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

export interface SubmitProductionPlanDto {
  scriptText: string;
  productionApproach: string;
  targetDurationSeconds: number;
  estimatedAiResourceUsage: number;
  /** Final script of every existing scene of the plan. */
  scenes: { sceneId: string; scriptText: string }[];
}

export interface CreateSceneDto {
  sceneNumber: number;
  title: string;
  scriptText?: string;
  description?: string;
  targetDurationSeconds: number;
  estimatedTokens?: number;
}

export type UpdateSceneDto = Partial<CreateSceneDto>;

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

// ==========================================
// 3. RESPONSES
// ==========================================

export interface Paginated<T> {
  data: T[];
}

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
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
