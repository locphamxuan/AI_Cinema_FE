import type { WorkflowState } from './workflow-role';
import type { GenerationJob, GeneratedAsset } from './workflow-job';
import type { SceneReview } from './workflow-review';

/**
 * 1. content_brief: Kịch bản và kế hoạch sản xuất ban đầu. Chỉ giữ mô tả
 * phân cảnh ở bước lập kế hoạch — prompt AI thuộc bước sản xuất (Studio),
 * xem GenerationStep trong workflow-job.ts.
 */
export interface SceneBreakdownItem {
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
  overview_script: string;
  scene_count: number;
  target_duration_minutes: number;
  estimated_tokens: number;
  storyboard_summary: string;
  scene_breakdown: SceneBreakdownItem[];
  /** Per-scene reviewer verdict — reset to 'pending' on every (re)submit. */
  scene_reviews: SceneReview[];
  status: WorkflowState;
  created_at: string;
  updated_at: string;
}

/**
 * 4. episode_package: Gói tập phim hoàn chỉnh ghép từ các phân cảnh
 */
export interface EpisodePackage {
  id: string;
  project_id: string;
  episode_number: number;
  season_number: number;
  title: string;
  status: WorkflowState;
  total_duration: string;
  actual_tokens_used: number;
  quota_allocated: number;
  video_draft_url: string;
  thumbnail_url: string;
  brief: ContentBrief;
  jobs: GenerationJob[];
  assets: GeneratedAsset[];
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
  season_count: number;
  episodes_per_season: number;
  total_episodes: number;
  /** Baseline Reviewer sets at project creation — Creator's proposed duration per episode is checked against this during plan review. */
  target_duration_per_episode_minutes: number;
  total_budget_tokens: number;
  allocated_tokens: number;
  consumed_tokens: number;
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

