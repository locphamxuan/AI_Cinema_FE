/**
 * Adapter converting Backend Prisma API objects into Frontend Workflow Store shapes
 */

import type { ProductionProject, EpisodePackage, ProjectMilestone, SceneBreakdownItem } from '@/types/workflow';
import type { ApiProductionProject, ApiProductionPlan, ApiMilestone } from '@/types/workflow-api';
import { pendingPlanReviews } from './planVerdict';

export function adaptApiMilestoneToUi(m: ApiMilestone): ProjectMilestone {
  return {
    id: m.id,
    title: m.title,
    description: m.description || '',
    startDate: m.startDate,
    deadline: m.targetDate || '',
    status: (m.status?.toLowerCase() as any) || 'pending',
  };
}

export function adaptApiPlanToEpisodePackage(plan: ApiProductionPlan, project: ApiProductionProject): EpisodePackage {
  const scenes: SceneBreakdownItem[] = (plan.scenes || []).map((s) => ({
    scene_number: s.sceneNumber,
    title: s.title,
    description: s.description || s.scriptText || '',
    target_duration_sec: s.targetDurationSeconds || 15,
    estimated_tokens: 60,
  }));

  const pkg = plan.episodePackages?.[0];
  const now = new Date().toISOString();

  return {
    id: pkg?.id || `pkg-${plan.id}`,
    project_id: project.id,
    episode_number: plan.episodeNumber,
    season_number: 1,
    title: `Tập ${plan.episodeNumber}: ${project.title}`,
    target_duration_minutes: Math.round((plan.targetDurationSeconds || 1800) / 60),
    status: (pkg?.status as any) || (plan.status as any) || 'PLAN_DRAFT',
    total_duration: `${Math.round((plan.targetDurationSeconds || 1800) / 60)}:00`,
    actual_tokens_used: plan.estimatedAiResourceUsage || 0,
    quota_allocated: plan.estimatedAiResourceUsage || 0,
    video_draft_url: '',
    thumbnail_url: '',
    brief: {
      id: `brief-${plan.id}`,
      project_id: project.id,
      episode_id: pkg?.id || `pkg-${plan.id}`,
      title: `Tập ${plan.episodeNumber}: ${project.title}`,
      scene_count: scenes.length,
      target_duration_minutes: Math.round((plan.targetDurationSeconds || 1800) / 60),
      estimated_tokens: plan.estimatedAiResourceUsage || 0,
      production_approach: plan.productionApproach || '',
      storyboard_summary: '',
      scene_breakdown: scenes,
      ...pendingPlanReviews(scenes),
      status: (plan.status as any) || 'PLAN_DRAFT',
      created_at: plan.createdAt || now,
      updated_at: plan.updatedAt || now,
    },
    jobs: [],
    assets: [],
    created_at: plan.createdAt || now,
    updated_at: plan.updatedAt || now,
  };
}

function mapBEProjectStatus(status?: string): 'NOT_STARTED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'COMPLETED' {
  switch (status) {
    case 'DRAFT':
    case 'NOT_STARTED':
      return 'NOT_STARTED';
    case 'ACTIVE':
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
    case 'CHANGES_REQUESTED':
      return 'CHANGES_REQUESTED';
    case 'PENDING_REVIEW':
      return 'PENDING_REVIEW';
    default:
      return 'IN_PROGRESS';
  }
}

export function adaptApiProjectToUiProject(api: ApiProductionProject): ProductionProject {
  const genres = api.genres?.map((g) => g.genre?.name).filter(Boolean) as string[] || [];
  const milestones = (api.milestones || []).map(adaptApiMilestoneToUi);

  const episodes: EpisodePackage[] = (api.plans && api.plans.length > 0)
    ? api.plans.map((plan) => adaptApiPlanToEpisodePackage(plan, api))
    : Array.from({ length: Math.max(1, api.episodeCount || 1) }, (_, i) => {
        const epNum = i + 1;
        const now = new Date().toISOString();
        return {
          id: `pkg-${api.id}-${epNum}`,
          project_id: api.id,
          episode_number: epNum,
          season_number: 1,
          title: `Tập ${epNum}: ${api.title}`,
          target_duration_minutes: Math.round((api.defaultEpisodeDurationSeconds || 1800) / 60),
          status: 'PLAN_DRAFT',
          total_duration: '',
          actual_tokens_used: 0,
          quota_allocated: 0,
          video_draft_url: '',
          thumbnail_url: '',
          brief: {
            id: `brief-${api.id}-${epNum}`,
            project_id: api.id,
            episode_id: `pkg-${api.id}-${epNum}`,
            title: `Tập ${epNum}: ${api.title}`,
            scene_count: 0,
            target_duration_minutes: Math.round((api.defaultEpisodeDurationSeconds || 1800) / 60),
            estimated_tokens: 0,
            production_approach: '',
            storyboard_summary: '',
            scene_breakdown: [],
            ...pendingPlanReviews([]),
            status: 'PLAN_DRAFT',
            created_at: now,
            updated_at: now,
          },
          jobs: [],
          assets: [],
          created_at: now,
          updated_at: now,
        };
      });

  const allocated = Math.max(0, (api.totalAiQuotaBudget || 0) - (api.remainingAiQuotaBudget || 0));

  return {
    id: api.id,
    title: api.title,
    genre: genres.length > 0 ? genres : ['Khoa học viễn tưởng'],
    synopsis: api.description || 'Dự án phim sản xuất bằng AI.',
    overall_script: api.plans?.[0]?.scriptText || '',
    script_version: api.plans?.[0]?.planVersion || 1,
    script_review: { status: 'approved' },
    season_count: 1,
    episodes_per_season: api.episodeCount || 1,
    total_episodes: api.episodeCount || 1,
    total_budget_tokens: api.totalAiQuotaBudget || 0,
    allocated_tokens: allocated,
    consumed_tokens: allocated,
    production_start_date: api.productionStartDate || new Date().toISOString().split('T')[0],
    deadline: api.deadline || new Date().toISOString().split('T')[0],
    planned_release_date: api.plannedReleaseDate || new Date().toISOString().split('T')[0],
    creator_name: api.assignedCreator?.fullName || 'Trần Minh Huy',
    reviewer_name: api.createdBy?.fullName || 'Lê Quốc Bảo',
    creator_role: 'Đạo diễn / Maker',
    overall_status: mapBEProjectStatus(api.status),
    active_episode_title: episodes[0]?.title || '',
    progress_percent: 0,
    milestones,
    active_milestone_id: milestones[0]?.id || 'ms-1',
    episodes,
    created_at: api.createdAt || new Date().toISOString(),
    updated_at: api.updatedAt || new Date().toISOString(),
  };
}
