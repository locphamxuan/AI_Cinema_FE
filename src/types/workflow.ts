/**
 * PostgreSQL Schema aligned Type Definitions for Main Flow 1:
 * "AI Movie Production & Publishing" (Maker - Checker Workflow)
 */

/**
 * Episode State Model — Main Flow 1 (docs/PROJECT_OVERVIEW.md §4.1.2), 17 states in order,
 * with 3 self-loops: PLAN_CHANGES_REQUESTED->PLANNING, CHANGES_REQUESTED->IN_PRODUCTION,
 * COMPLIANCE_CHANGES_REQUESTED->COMPLIANCE_REVIEW.
 */
export type WorkflowState =
  | 'DRAFT'                          // Episode created, not yet assigned to a Creator
  | 'ASSIGNED'                       // Creator assigned, plan not started
  | 'PLANNING'                       // Creator is drafting the content brief
  | 'PLAN_REVIEW'                    // Plan submitted, awaiting Reviewer decision
  | 'PLAN_CHANGES_REQUESTED'         // Reviewer requested plan changes (loop -> PLANNING)
  | 'PLAN_APPROVED'                  // Reviewer approved the plan, quota not yet allocated
  | 'READY_FOR_PRODUCTION'           // AI quota allocated, ready to generate assets
  | 'IN_PRODUCTION'                  // Creator is generating video/audio assets in Studio
  | 'CONTENT_REVIEW'                 // Episode submitted, awaiting Reviewer content decision
  | 'CHANGES_REQUESTED'              // Reviewer requested content changes (loop -> IN_PRODUCTION)
  | 'APPROVED'                       // Final content approved, compliance not yet started
  | 'COMPLIANCE_REVIEW'              // Compliance check in progress
  | 'COMPLIANCE_CHANGES_REQUESTED'   // Compliance failed (loop -> COMPLIANCE_REVIEW)
  | 'COMPLIANCE_PASSED'              // Compliance check passed
  | 'SCHEDULED'                      // Release date/time + Coin price set, not yet live
  | 'PUBLISHED'                      // Published live to OTT streaming catalog
  | 'ARCHIVED';                      // Retired from active catalog

/**
 * Movie Project State Model — independent from Episode state (docs/PROJECT_OVERVIEW.md §4.1.3).
 */
export type ProjectStatus =
  | 'DRAFT'
  | 'PLANNING'
  | 'IN_PRODUCTION'
  | 'IN_REVIEW'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * Production Events — audit trail per BR-16, exact 18 names from docs/PROJECT_OVERVIEW.md §4.1.4.
 */
export type ProductionEventName =
  | 'PROJECT_CREATED'
  | 'EPISODE_CREATED'
  | 'CREATOR_ASSIGNED'
  | 'PRODUCTION_PLAN_SUBMITTED'
  | 'PRODUCTION_PLAN_CHANGES_REQUESTED'
  | 'PRODUCTION_PLAN_APPROVED'
  | 'EPISODE_QUOTA_ALLOCATED'
  | 'PRODUCTION_STARTED'
  | 'GENERATION_COMPLETED'
  | 'QUOTA_LOW'
  | 'EPISODE_SUBMITTED'
  | 'CONTENT_CHANGES_REQUESTED'
  | 'EPISODE_APPROVED'
  | 'COMPLIANCE_CHECK_STARTED'
  | 'COMPLIANCE_CHANGES_REQUESTED'
  | 'COMPLIANCE_PASSED'
  | 'EPISODE_SCHEDULED'
  | 'EPISODE_PUBLISHED';

/**
 * production_event: immutable, append-only audit log row (BR-16).
 */
export interface ProductionEvent {
  id: string;
  event_name: ProductionEventName;
  project_id: string;
  episode_id?: string;
  actor_role: Role;
  actor_name: string;
  message?: string;
  created_at: string;
}

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
  coin_price: number | null; // BR-29 — set by Reviewer when scheduling, required before publish
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
  status: ProjectStatus;
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
