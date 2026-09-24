/** Enums of the NestJS MF-1 API, matching the Prisma schema. */

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
