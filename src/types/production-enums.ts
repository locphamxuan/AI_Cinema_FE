/** Enums of the MF-1 API, spelled as the Prisma schema spells them. */

export type UserRole = 'MEMBER' | 'CONTENT_CREATOR' | 'CONTENT_REVIEWER' | 'STAFF' | 'ADMIN';

export type MovieStatus = 'DRAFT' | 'ASSIGNED' | 'IN_PRODUCTION' | 'COMPLETED' | 'UNDER_REVISION' | 'CANCELLED';

export type EpisodeStatus =
  | 'DRAFT'
  | 'AWAITING_MEDIA'
  | 'PROCESSING'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'LABELED'
  | 'COMPLIANCE_PASSED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'UNPUBLISHED';

export type MediaSourceMethod = 'UPLOAD' | 'HLS_URL' | 'REMOTE_FILE';
export type MediaIngestStatus = 'PENDING' | 'DOWNLOADING' | 'TRANSCODING' | 'VALIDATING' | 'READY' | 'FAILED' | 'SUPERSEDED';
export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type LabelType = 'AI_GENERATED' | 'AI_EDITED' | 'AI_ASSISTED';
export type LabelLocation = 'TOP_RIGHT' | 'TOP_LEFT' | 'BOTTOM_RIGHT' | 'BOTTOM_LEFT' | 'INTRO_NOTICE';
export type ReviewDecision = 'APPROVED' | 'CHANGES_REQUESTED';
export type ComplianceCheckType = 'AI_LABEL_PRESENCE' | 'DECREE_142_NOTICE' | 'CONTENT_SAFETY' | 'REAL_PERSON_LIKENESS';
export type ComplianceResult = 'PENDING' | 'PASS' | 'FAIL';
export type TokenEntryType = 'INITIAL' | 'TOP_UP' | 'CORRECTION';
export type ChangeRequestStatus = 'OPEN' | 'ACCEPTED' | 'REJECTED';
export type UnpublishMode = 'REVISION' | 'REMOVAL';
export type UnpublishReason = 'MANUAL' | 'COMPLIANCE_ISSUE' | 'BROKEN_SOURCE';
export type PriceAlertStatus = 'OPEN' | 'CHANGE_REQUESTED' | 'RESOLVED';
export type AgeRating = 'T16' | 'T18';
