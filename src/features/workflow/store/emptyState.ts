import {
  PENDING_FIELD_REVIEW,
  type AIContentLabel,
  type ComplianceCheck,
  type ProductionProject,
  type Publication,
  type ReviewLog,
} from '@/types/workflow';

export const createEmptyProject = (): ProductionProject => {
  const now = new Date().toISOString();

  return {
    id: '',
    title: 'Chưa có dự án',
    genre: [],
    synopsis: 'Đang chờ dữ liệu từ backend...',
    overall_script: '',
    script_version: 1,
    script_review: { ...PENDING_FIELD_REVIEW },
    season_count: 1,
    episodes_per_season: 1,
    total_episodes: 0,
    total_budget_tokens: 0,
    allocated_tokens: 0,
    consumed_tokens: 0,
    production_start_date: '',
    deadline: '',
    planned_release_date: '',
    creator_name: '',
    reviewer_name: '',
    overall_status: 'NOT_STARTED',
    milestones: [],
    active_milestone_id: '',
    episodes: [],
    created_at: now,
    updated_at: now,
  };
};

export const EMPTY_PROJECTS: ProductionProject[] = [];
export const EMPTY_REVIEWS: ReviewLog[] = [];
export const EMPTY_COMPLIANCE_CHECKS: Record<string, ComplianceCheck> = {};
export const EMPTY_LABELS: Record<string, AIContentLabel> = {};
export const EMPTY_PUBLICATIONS: Record<string, Publication> = {};
