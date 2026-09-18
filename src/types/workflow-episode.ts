import type { WorkflowState } from './workflow-role';
import type { GenerationJob, GeneratedAsset } from './workflow-job';

/**
 * 1. content_brief: Kịch bản và kế hoạch sản xuất ban đầu
 */
export interface SceneBreakdownItem {
  scene_number: number;
  title: string;
  description: string;
  target_duration_sec: number;
  estimated_tokens: number;
  visual_prompt: string;
  audio_prompt: string;
  voice_model?: string;
  video_model?: string;
}

export interface ContentBrief {
  id: string;
  project_id: string;
  episode_id: string;
  title: string;
  synopsis: string;
  overview_script: string;
  scene_count: number;
  target_duration_minutes: number;
  estimated_tokens: number;
  storyboard_summary: string;
  scene_breakdown: SceneBreakdownItem[];
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
  total_episodes: number;
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

