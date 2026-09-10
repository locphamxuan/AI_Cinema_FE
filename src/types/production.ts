/**
 * AI Cinema - Production & Publishing Flow Type Definitions
 * Maker-Checker Workflow (Reviewer & Creator)
 */

export type ProductionState =
  | 'DRAFT'               // Creator is drafting initial production plan
  | 'PLAN_SUBMITTED'      // Creator submitted plan -> Waiting for Reviewer
  | 'PLAN_REJECTED'       // Reviewer requested changes with feedback
  | 'QUOTA_ALLOCATED'     // Reviewer approved & allocated AI Token Quota
  | 'PRODUCING'           // Creator is generating video/audio clips in AI Studio
  | 'CONTENT_SUBMITTED'   // Creator submitted final video draft -> Waiting for Reviewer
  | 'CONTENT_REJECTED'    // Reviewer requested scene revisions
  | 'COMPLIANCE_PENDING'  // Content approved -> In legal compliance & scheduling
  | 'PUBLISHED';          // Published live to platform catalog

export type ProductionRole = 'reviewer' | 'creator';

export interface ScenePlan {
  sceneNumber: number;
  title: string;
  description: string;
  targetDurationSec: number;
  estimatedTokens: number;
  visualPrompt: string;
  audioPrompt: string;
}

export interface FeedbackItem {
  id: string;
  author: string;
  role: ProductionRole;
  type: 'plan_changes' | 'content_changes' | 'approval';
  content: string;
  createdAt: string;
}

export interface ProductionPlan {
  id: string;
  projectId: string;
  episodeId: string;
  overviewScript: string;
  totalScenes: number;
  targetDuration: string; // e.g. "45 phút"
  estimatedTokens: number; // e.g. 450
  storyboardSummary: string;
  sceneBreakdown: ScenePlan[];
  submittedAt?: string;
  feedbackHistory: FeedbackItem[];
}

export type SceneRenderStatus = 'idle' | 'rendering' | 'completed' | 'error';

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  prompt: string;
  dialogue: string;
  voiceModel: string;
  videoModel: string;
  status: SceneRenderStatus;
  progress: number; // 0 - 100
  durationSec: number;
  tokenCost: number;
  videoUrl: string;
  thumbnailUrl: string;
}

export interface QuotaAllocation {
  allocatedTokens: number;
  allocatedAt: string;
  allocatedBy: string;
  notes?: string;
}

export interface ComplianceMetadata {
  aiLawArticle44Verified: boolean;
  decree142LabelAttached: boolean;
  aiWatermarkEnabled: boolean;
  certificationId: string;
  moderationScore: number;
  aiContentPercentage: number;
  verifiedBy: string;
  verifiedAt: string;
}

export interface ProductionEpisode {
  id: string;
  projectId: string;
  episodeNumber: number;
  title: string;
  status: ProductionState;
  plan: ProductionPlan;
  quota: QuotaAllocation | null;
  scenes: Scene[];
  totalDuration: string;
  actualTokensUsed: number;
  videoDraftUrl: string;
  compliance: ComplianceMetadata | null;
  scheduledReleaseDate: string | null;
}

export interface Project {
  id: string;
  title: string;
  genre: string[];
  synopsis: string;
  totalEpisodes: number;
  episodes: ProductionEpisode[];
  deadline: string;
  plannedReleaseDate: string;
  totalBudgetTokens: number;
  allocatedTokens: number;
  consumedTokens: number;
  status: 'planning' | 'in_production' | 'completed';
  createdAt: string;
  updatedAt: string;
  creatorName: string;
  reviewerName: string;
}
