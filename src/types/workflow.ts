/**
 * PostgreSQL Schema aligned Type Definitions for Main Flow 1:
 * "AI Movie Production & Publishing" (Maker - Checker Workflow)
 */

export type WorkflowState =
  | 'PLAN_DRAFT'          // Maker is drafting the content brief
  | 'PLAN_PENDING'        // Maker submitted plan, awaiting Checker review & quota
  | 'QUOTA_ALLOCATED'     // Checker approved plan and assigned AI token quota
  | 'IN_PRODUCTION'       // Maker is generating video/audio assets in Studio
  | 'EPISODE_SUBMITTED'   // Maker completed assembly and submitted episode package
  | 'CHANGES_REQUESTED'   // Checker requested plan or content revisions
  | 'COMPLIANCE_PASSED'   // Checker validated Article 44 & Decree 142 AI compliance
  | 'PUBLISHED';          // Published live to OTT streaming catalog

export type Role = 'creator' | 'reviewer';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type LabelType = 'AI_GENERATED_FULL' | 'AI_GENERATED_PARTIAL' | 'AI_ENHANCED';

export type DisplayLocation = 'INTRO_OUTRO' | 'PERSISTENT_WATERMARK' | 'METADATA_BADGE';

export type RulesetVersion = 'DECREE_142_2024_V1' | 'AI_LAW_ART44_V2025';

export type ReviewType = 'plan' | 'content';

export type ReviewDecision = 'approved' | 'rejected' | 'changes_requested';

export type PublicationVisibility = 'public' | 'vip_only' | 'unlisted';

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
 * 2. generation_job: Tác vụ sinh tài nguyên AI (Video, Voice, SFX)
 */
export interface GenerationJob {
  id: string;
  episode_id: string;
  scene_id: string;
  scene_number: number;
  title: string;
  prompt_video: string;
  prompt_audio: string;
  ai_model: string;
  status: JobStatus;
  progress: number; // 0 - 100
  token_cost: number;
  output_asset_id?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 3. generated_asset: Tài nguyên đầu ra sau khi sinh AI hoàn tất
 */
export interface GeneratedAsset {
  id: string;
  job_id: string;
  scene_id: string;
  asset_type: 'video' | 'audio' | 'thumbnail';
  url: string;
  thumbnail_url: string;
  duration_seconds: number;
  resolution: string;
  file_size_mb: number;
  metadata: {
    fps: number;
    codec: string;
    model: string;
    seed?: number;
    prompt: string;
  };
  created_at: string;
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
 * 5. review: Nhật ký thẩm định của Reviewer (Kế hoạch hoặc Nội dung)
 */
export interface ReviewLog {
  id: string;
  episode_package_id: string;
  reviewer_id: string;
  reviewer_name: string;
  review_type: ReviewType;
  decision: ReviewDecision;
  feedback_notes: string;
  quota_granted?: number;
  created_at: string;
}

/**
 * 6. compliance_check: Báo cáo kiểm định tuân thủ pháp lý AI
 */
export interface ComplianceCheck {
  id: string;
  episode_package_id: string;
  checker_id: string;
  checker_name: string;
  article_44_passed: boolean;
  decree142_passed: boolean;
  watermark_verified: boolean;
  moderation_score: number; // e.g. 98.5
  ai_content_percentage: number; // e.g. 100
  status: 'passed' | 'failed' | 'pending';
  notes?: string;
  checked_at?: string;
}

/**
 * 7. ai_content_label: Nhãn định danh nội dung AI theo Điều 44 & Nghị định 142
 */
export interface AIContentLabel {
  id: string;
  episode_package_id: string;
  label_type: LabelType;
  label_text: string;
  display_location: DisplayLocation;
  ruleset_version: RulesetVersion;
  certification_id: string;
  is_active: boolean;
}

/**
 * 8. publication: Lịch trình công chiếu và phát hành lên nền tảng OTT
 */
export interface Publication {
  id: string;
  episode_package_id: string;
  movie_catalog_id: string;
  title: string;
  scheduled_at: string | null;
  published_at: string | null;
  visibility: PublicationVisibility;
  platform_channels: string[];
  streaming_url: string;
  quality: string;
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
  episodes: EpisodePackage[];
  created_at: string;
  updated_at: string;
}
