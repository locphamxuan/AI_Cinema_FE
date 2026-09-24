import { PENDING_FIELD_REVIEW, type ProductionProject } from '@/types/workflow';

/**
 * Placeholder for "no project selected" until loadProjects() fills the store
 * from the backend. Workspace pages check `hasSelection` before rendering it.
 */
export const EMPTY_PROJECT: ProductionProject = {
  id: '',
  title: '',
  genre: [],
  synopsis: '',
  overall_script: '',
  script_version: 1,
  script_review: PENDING_FIELD_REVIEW,
  season_count: 0,
  total_episodes: 0,
  total_budget_tokens: 0,
  allocated_tokens: 0,
  consumed_tokens: 0,
  production_start_date: '',
  deadline: '',
  planned_release_date: '',
  creator_name: '',
  reviewer_name: '',
  milestones: [],
  episodes: [],
  created_at: '',
  updated_at: '',
};
