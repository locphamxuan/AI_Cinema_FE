import type { WorkflowState } from './workflow-role';
import type { GenerationJob, GeneratedAsset } from './workflow-job';
import type { FieldReview, ReviewLog, SceneReview } from './workflow-review';

/**
 * 1. content_brief: Episode Plan — kế hoạch sản xuất của một tập. Chỉ giữ mô tả
 * phân cảnh ở bước lập kế hoạch — prompt AI thuộc bước sản xuất (Studio),
 * xem GenerationStep trong workflow-job.ts. Kịch bản tổng thể nằm ở cấp
 * ProductionProject (overall_script), không lặp lại theo từng tập.
 */
export interface SceneBreakdownItem {
  /** Backend scene id; absent for scenes the Creator added but has not saved yet. */
  id?: string;
  scene_number: number;
  title: string;
  description: string;
  target_duration_sec: number;
  estimated_tokens: number;
}

export interface ContentBrief {
  id: string;
  project_id: string;
  episode_id: string;
  title: string;
  scene_count: number;
  /** Creator's proposed duration (proposed_duration), checked against EpisodePackage.target_duration_minutes. */
  target_duration_minutes: number;
  /** Planning estimate summed from scene_breakdown — not a hard quota (BR-38). */
  estimated_tokens: number;
  /** How the Creator plans to produce/assemble assets (model/prompt strategy). */
  production_approach: string;
  storyboard_summary: string;
  scene_breakdown: SceneBreakdownItem[];
  /** Field-level reviewer verdicts (BR-39) — all reset to 'pending' on every (re)submit. */
  scene_reviews: SceneReview[];
  /** This plan's verdict on the overall script; falls back to ProductionProject.script_review. */
  script_review?: FieldReview;
  duration_review: FieldReview;
  token_review: FieldReview;
  status: WorkflowState;
  created_at: string;
  updated_at: string;
}

/**
 * 4. episode_package: Gói tập phim hoàn chỉnh ghép từ các phân cảnh.
 * `id` is the backend production plan id — every MF-1 call is keyed by plan.
 */
export interface PackageSubtitle {
  language: string;
  label: string;
  /** API endpoint of the WebVTT track; it needs the signed-in user's token. */
  endpoint: string;
}

export interface FinalCut {
  stream_url: string;
  /** Renditions, lowest first, e.g. ['360p', '720p', '1080p']. */
  qualities: string[];
  subtitles: PackageSubtitle[];
}

export interface EpisodePackage {
  id: string;
  /** Latest backend episode package, once the Creator assembled one. */
  package_id?: string;
  /** Catalog episode created from the package, needed to publish it. */
  catalog_episode_id?: string;
  project_id: string;
  episode_number: number;
  season_number: number;
  title: string;
  /** Reviewer's target duration for this specific episode, set at project creation. */
  target_duration_minutes: number;
  status: WorkflowState;
  total_duration: string;
  actual_tokens_used: number;
  quota_allocated: number;
  /** The assembled cut the Reviewer audits; absent until the Creator submits one. */
  final_cut?: FinalCut;
  brief: ContentBrief;
  jobs: GenerationJob[];
  assets: GeneratedAsset[];
  /** Reviewer decisions on this episode's plan and cuts, newest first. */
  review_log: ReviewLog[];
  created_at: string;
  updated_at: string;
}

/**
 * Cột mốc tiến độ dự án do Content Reviewer quy định
 */
export interface ProjectMilestone {
  id: string;
  title: string;
  startDate?: string;
  deadline: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

/**
 * Production Project: Dự án tổng thể chứa nhiều tập phim
 */
export interface ProductionProject {
  id: string;
  title: string;
  genre: string[];
  synopsis: string;
  /** Overall script of the whole movie/series, shared by every episode plan. */
  overall_script: string;
  script_version: number;
  script_review: FieldReview;
  season_count: number;
  total_episodes: number;
  total_budget_tokens: number;
  allocated_tokens: number;
  consumed_tokens: number;
  production_start_date: string;
  /** Production end date (production_end_date). */
  deadline: string;
  planned_release_date: string;
  creator_name: string;
  reviewer_name: string;
  creator_role?: string;
  thumbnail_url?: string;
  overall_status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'COMPLETED';
  active_episode_title?: string;
  progress_percent?: number;
  milestones?: ProjectMilestone[];
  active_milestone_id?: string;
  episodes: EpisodePackage[];
  created_at: string;
  updated_at: string;
}

