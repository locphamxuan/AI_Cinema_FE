/**
 * AI Cinema - Workflow Production API Interfaces and DTOs
 * Perfectly aligned with NestJS + Prisma backend schemas
 */

// ==========================================
// 1. ENUMS (matching Prisma schema exactly)
// ==========================================

export type UserRole = 'MEMBER' | 'CONTENT_CREATOR' | 'CONTENT_REVIEWER' | 'STAFF' | 'ADMIN';

export type ProductionProjectStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type ProductionContentType = 'MOVIE' | 'SERIES';

export type MilestoneStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ProductionPlanStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED';

export type SceneStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'GENERATING'
  | 'COMPLETED';

export type PlanReviewStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export type ReviewStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export type QuotaAllocationType = 'INITIAL' | 'TOP_UP';

export type QuotaAllocationStatus = 'ACTIVE' | 'CONSUMED' | 'RETURNED' | 'SUPERSEDED';

export type GenerationJobType =
  | 'SCRIPT'
  | 'VOICE'
  | 'BACKGROUND_AUDIO'
  | 'SUBTITLE'
  | 'TRANSLATION'
  | 'POSTER'
  | 'THUMBNAIL'
  | 'VIDEO_ASSEMBLY';

export type GenerationJobStatus = 'PENDING' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type AssetType =
  | 'SCRIPT'
  | 'DUB_AUDIO'
  | 'BACKGROUND_AUDIO'
  | 'SUBTITLE'
  | 'POSTER'
  | 'THUMBNAIL'
  | 'VIDEO';

export type GeneratedAssetStatus = 'GENERATED' | 'VALIDATION_FAILED' | 'REJECTED' | 'ACCEPTED';

export type EpisodePackageStatus = 'ASSEMBLED' | 'SUPERSEDED';

export type SubmissionType = 'PLAN' | 'SCENE' | 'EPISODE';

export type SubmissionStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED';

export type ApiLabelType = 'AI_GENERATED' | 'AI_EDITED' | 'AI_ASSISTED';

export type ComplianceCheckType = 'AI_LABEL_PRESENCE' | 'CONTENT_POLICY' | 'COPYRIGHT' | 'LEGAL';

export type ComplianceResult = 'PENDING' | 'PASS' | 'FAIL';

export type EpisodeProductionStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';

// ==========================================
// 2. REQUEST DTO INTERFACES
// ==========================================

export interface CreateProjectMilestoneDto {
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
  episodeCount?: number;
  productionStartDate: string;
  deadline: string;
  plannedReleaseDate: string;
  totalAiQuotaBudget: number;
  genreIds?: string[];
  policyIds?: string[];
  assignedCreatorId: string;
  milestones?: CreateProjectMilestoneDto[];
}

export interface UpdateProductionProjectDto {
  title?: string;
  description?: string;
  defaultEpisodeDurationSeconds?: number;
  deadline?: string;
  plannedReleaseDate?: string;
  totalAiQuotaBudget?: number;
  genreIds?: string[];
  policyIds?: string[];
}

export interface CancelProductionProjectDto {
  cancelledReason?: string;
}

export interface CreateMilestoneDto {
  title: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
}

export interface UpdateMilestoneDto {
  title?: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
  status?: MilestoneStatus;
  resultText?: string;
}

export interface SubmitProductionPlanSceneDto {
  sceneNumber: number;
  title: string;
  scriptText?: string;
  targetDurationSeconds: number;
}

export interface SubmitProductionPlanDto {
  scriptText: string;
  productionApproach: string;
  targetDurationSeconds: number;
  estimatedAiResourceUsage: number;
  scenes: SubmitProductionPlanSceneDto[];
}

export interface UpdateProductionPlanDto {
  scriptText?: string;
  productionApproach?: string;
  targetDurationSeconds?: number;
  targetLanguages?: string[];
  estimatedAiResourceUsage?: number;
}

export interface CreateProductionPlanRevisionDto {
  createdById: string;
  scriptText?: string;
  productionApproach?: string;
  targetDurationSeconds?: number;
  targetLanguages?: string[];
  estimatedAiResourceUsage?: number;
}

export interface CreateSceneDto {
  sceneNumber: number;
  title: string;
  scriptText?: string;
  targetDurationSeconds: number;
}

export interface UpdateSceneDto {
  title?: string;
  sceneNumber?: number;
  scriptText?: string;
  targetDurationSeconds?: number;
}

export interface SubmitSceneDto {
  submittedById: string;
}

export interface CreatePlanReviewDto {
  reviewerId: string;
  sceneIds?: string[];
  comments?: string;
}

export interface DecidePlanReviewDto {
  decision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';
  comments?: string;
  rejectionReason?: string;
}

export interface CreateQuotaAllocationDto {
  allocationType: QuotaAllocationType;
  allocatedAmount: number;
  allocatedById?: string;
}

export interface CreateGenerationJobDto {
  createdById: string;
  aiModelId: string;
  jobType: GenerationJobType;
  sceneId?: string;
  parentJobId?: string;
  configSnapshot?: Record<string, unknown>;
}

export interface CreateGeneratedAssetDto {
  assetType: AssetType;
  language?: string;
  contentText?: string;
  storageKey?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  checksumSha256?: string;
  durationSeconds?: number;
  resolution?: string;
  metadata?: Record<string, unknown>;
}

export interface CompleteGenerationJobDto {
  resourceCost?: number;
}

export interface CreateEpisodePackageDto {
  assembledById?: string;
  assemblyJobId?: string;
  assetIds?: string[];
}

export interface CreateEpisodeSubmissionDto {
  submittedById: string;
}

export interface CreateReviewDto {
  reviewerId: string;
  submissionId?: string;
  comments?: string;
}

export interface DecideReviewDto {
  decision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';
  comments?: string;
  rejectionReason?: string;
}

export interface CreateAiContentLabelDto {
  labelType: ApiLabelType;
  labelText: string;
  displayLocation?: string;
  appliedById?: string;
  policyId: string;
}

export interface CreateComplianceCheckDto {
  checkType: ComplianceCheckType;
  policyId: string;
  result?: ComplianceResult;
  checkedBySystem?: string;
  failureReason?: string;
}

export interface DecideComplianceCheckDto {
  result: ComplianceResult;
  checkedById?: string;
  failureReason?: string;
}

export interface CreateCatalogDto {
  createdById: string;
  title?: string;
  synopsis?: string;
  releaseDate?: string;
}

export interface UpdateCatalogEpisodeDto {
  title?: string;
}

export interface CreatePublicationDto {
  packageId: string;
  publishedById: string;
  scheduledAt?: string;
}

// ==========================================
// 3. BACKEND API ENTITIES & RESPONSES
// ==========================================

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiGenre {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ApiPolicy {
  id: string;
  name: string;
  type: string;
  version: string;
  documentReference?: string;
  content: Record<string, unknown>;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface ApiMilestone {
  id: string;
  productionProjectId: string;
  title: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
  status: MilestoneStatus;
  resultText?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiScene {
  id: string;
  productionPlanId: string;
  sceneNumber: number;
  title: string;
  scriptText?: string;
  description?: string;
  targetDurationSeconds: number;
  status: SceneStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPlanReview {
  id: string;
  productionPlanId: string;
  sceneId?: string;
  reviewerId: string;
  status: PlanReviewStatus;
  comments?: string;
  rejectionReason?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiQuotaAllocation {
  id: string;
  productionPlanId: string;
  productionProjectId: string;
  allocationType: QuotaAllocationType;
  allocatedAmount: number;
  remainingAmount: number;
  status: QuotaAllocationStatus;
  allocatedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiGeneratedAsset {
  id: string;
  generationJobId: string;
  assetType: AssetType;
  language?: string;
  contentText?: string;
  storageKey?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  checksumSha256?: string;
  durationSeconds?: number;
  resolution?: string;
  metadata?: Record<string, unknown>;
  status: GeneratedAssetStatus;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiGenerationJob {
  id: string;
  productionPlanId: string;
  sceneId?: string;
  aiModelId: string;
  jobType: GenerationJobType;
  attemptNumber: number;
  parentJobId?: string;
  configSnapshot?: Record<string, unknown>;
  status: GenerationJobStatus;
  resourceCost?: number;
  quotaAllocationId?: string;
  queuedAt?: string;
  completedAt?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  generatedAssets?: ApiGeneratedAsset[];
}

export interface ApiAiContentLabel {
  id: string;
  episodePackageId: string;
  labelType: ApiLabelType;
  labelText: string;
  displayLocation?: string;
  appliedById?: string;
  policyId: string;
  createdAt: string;
}

export interface ApiComplianceCheck {
  id: string;
  episodePackageId: string;
  checkType: ComplianceCheckType;
  policyId: string;
  result: ComplianceResult;
  checkedById?: string;
  checkedBySystem?: string;
  failureReason?: string;
  checkedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiReview {
  id: string;
  episodePackageId: string;
  reviewerId: string;
  submissionId?: string;
  status: ReviewStatus;
  comments?: string;
  rejectionReason?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiEpisodePackage {
  id: string;
  productionPlanId: string;
  packageVersion: number;
  assembledById?: string;
  assemblyJobId?: string;
  status: EpisodePackageStatus;
  createdAt: string;
  updatedAt: string;
  assets?: ApiGeneratedAsset[];
  complianceChecks?: ApiComplianceCheck[];
  aiContentLabels?: ApiAiContentLabel[];
  reviews?: ApiReview[];
}

export interface ApiProductionPlan {
  id: string;
  productionProjectId: string;
  episodeNumber: number;
  planVersion: number;
  previousPlanId?: string;
  scriptText?: string;
  productionApproach?: string;
  targetDurationSeconds?: number;
  targetLanguages: string[];
  estimatedAiResourceUsage?: number;
  status: ProductionPlanStatus;
  totalSceneCount: number;
  completedSceneCount: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  scenes?: ApiScene[];
  planReviews?: ApiPlanReview[];
  quotaAllocations?: ApiQuotaAllocation[];
  generationJobs?: ApiGenerationJob[];
  episodePackages?: ApiEpisodePackage[];
}

export interface ApiProductionProject {
  id: string;
  title: string;
  description?: string;
  contentType: ProductionContentType;
  status: ProductionProjectStatus;
  createdById: string;
  assignedCreatorId: string;
  episodeCount: number;
  productionStartDate: string;
  deadline: string;
  plannedReleaseDate: string;
  defaultEpisodeDurationSeconds?: number;
  totalAiQuotaBudget: number;
  remainingAiQuotaBudget: number;
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
  milestones?: ApiMilestone[];
  plans?: ApiProductionPlan[];
  genres?: { genre: ApiGenre }[];
  policies?: { policy: ApiPolicy }[];
  assignedCreator?: ApiUser;
  createdBy?: ApiUser;
}

export interface ApiPublication {
  id: string;
  episodeId: string;
  episodePackageId: string;
  scheduledAt?: string;
  publishedAt?: string;
  unpublishedAt?: string;
  publishedById: string;
  createdAt: string;
  updatedAt: string;
}
