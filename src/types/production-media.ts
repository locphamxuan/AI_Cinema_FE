/** Delivered versions, review, labels, compliance and releases of MF-1 (steps 5–16). */
import type {
  ComplianceCheckType,
  ComplianceResult,
  EpisodeStatus,
  JobStatus,
  LabelLocation,
  LabelType,
  MediaIngestStatus,
  MediaSourceMethod,
  MovieStatus,
  PriceAlertStatus,
  ReviewDecision,
  UnpublishMode,
  UnpublishReason,
} from './production-enums';
import type { Person } from './production';

export interface AiDisclosure {
  aiTools: string[];
  aiGeneratedParts: string[];
  humanEdited: boolean;
  noRealPersonLikeness: boolean;
  noCopyrightedMaterial: boolean;
}

export interface IngestJob {
  id: string;
  jobType: 'DOWNLOAD' | 'TRANSCODE' | 'VALIDATE';
  status: JobStatus;
  attempts: number;
  progressPercent: number | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  episodeId: string;
  version: number;
  sourceMethod: MediaSourceMethod;
  sourceUrl: string | null;
  streamUrl: string | null;
  isSelfHosted: boolean;
  qualities: string[];
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  ingestStatus: MediaIngestStatus;
  failureReason: string | null;
  aiDisclosure: AiDisclosure;
  proposedLabelType: LabelType;
  submissionNote: string | null;
  lastCheckedAt: string | null;
  createdAt: string;
  /** The Creator delivering on the studio's behalf; null when the studio delivered through its portal. */
  submittedBy: Person | null;
  studioHandoff: { id: string; studioName: string } | null;
  ingestJobs: IngestJob[];
}

export interface PolicyRef {
  id: string;
  name: string;
  documentReference: string | null;
}

export interface ContentReview {
  id: string;
  decision: ReviewDecision;
  comments: string | null;
  createdAt: string;
  reviewer: Person;
}

export interface AiContentLabel {
  id: string;
  labelType: LabelType;
  labelText: string;
  displayLocation: LabelLocation | null;
  appliedAt: string;
  policy: PolicyRef;
}

export interface ComplianceCheck {
  id: string;
  checkType: ComplianceCheckType;
  result: ComplianceResult;
  failureReason: string | null;
  checkedAt: string | null;
  policy: PolicyRef;
}

export interface ReviewSheet extends Omit<MediaAsset, 'ingestJobs'> {
  episode: {
    id: string;
    episodeNumber: number;
    title: string;
    status: EpisodeStatus;
    targetDurationSeconds: number;
    movie: { id: string; title: string; status: MovieStatus };
  };
  contentReviews: ContentReview[];
  aiContentLabel: AiContentLabel | null;
  complianceChecks: ComplianceCheck[];
  isApprovedVersion: boolean;
  durationCheck: {
    targetSeconds: number;
    actualSeconds: number | null;
    deviationSeconds: number | null;
    warning: boolean;
  };
}

export interface Publication {
  id: string;
  episodeId: string;
  mediaAssetId: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  unpublishedAt: string | null;
  unpublishReason: UnpublishReason | null;
  unpublishNote: string | null;
  unpublishMode: UnpublishMode | null;
  createdAt: string;
  publishedBy: Person;
  unpublishedBy: Person | null;
}

export interface PriceAlert {
  id: string;
  coinPrice: number;
  rangeMin: number;
  rangeMax: number;
  status: PriceAlertStatus;
  adminNote: string | null;
  createdAt: string;
  handledAt: string | null;
  episode: { id: string; episodeNumber: number; title: string; coinPrice: number | null; movie: { id: string; title: string } };
  setBy: Person;
  handledBy: Person | null;
}
