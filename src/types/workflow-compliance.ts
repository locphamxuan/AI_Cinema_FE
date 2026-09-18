export type LabelType = 'AI_GENERATED_FULL' | 'AI_GENERATED_PARTIAL' | 'AI_ENHANCED';

export type DisplayLocation = 'INTRO_OUTRO' | 'PERSISTENT_WATERMARK' | 'METADATA_BADGE';

export type RulesetVersion = 'DECREE_142_2024_V1' | 'AI_LAW_ART44_V2025';

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
