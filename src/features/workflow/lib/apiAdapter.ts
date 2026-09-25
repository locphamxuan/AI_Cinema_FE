/**
 * Maps the NestJS MF-1 responses onto the workspace store shapes.
 * An episode's `id` is its latest production plan id, so every store action
 * can call the plan-scoped endpoints directly.
 */

import { PENDING_FIELD_REVIEW } from '@/types/workflow';
import { API_ROUTES } from '@/constants/apiRoutes';
import { languageLabel } from '@/constants/languages';
import { formatDuration } from '@/services/movieAdapter';
import type {
  EpisodePackage,
  FinalCut,
  FieldReview,
  ProductionProject,
  ProjectMilestone,
  QuotaRequest,
  SceneBreakdownItem,
  SceneReviewStatus,
  WorkflowState,
} from '@/types/workflow';
import { buildSceneJobs } from './jobAdapter';
import { buildReviewLog } from './reviewLog';
import { episodeLabel } from './episodeLabel';
import { MAX_EPISODE_MINUTES } from './limits';
import type {
  ApiEpisodePackage,
  ApiMilestone,
  ApiPlanReview,
  ApiProductionPlan,
  ApiComplianceCheck,
  ApiProductionProject,
  ApiQuotaRequest,
  ComplianceCheckType,
  ReviewStatus,
} from '@/types/workflow-api';

/** Every check type the backend requires for BR-42, AI_LABEL_PRESENCE included. */
const COMPLIANCE_CHECK_TYPES: ComplianceCheckType[] = [
  'AI_LABEL_PRESENCE',
  'CONTENT_POLICY',
  'LEGAL',
  'COPYRIGHT',
  'WATERMARK',
  'REAL_PERSON_LIKENESS',
];

const DEFAULT_EPISODE_SECONDS = MAX_EPISODE_MINUTES * 60;

const toNumber = (value: number | string | null | undefined): number => Number(value ?? 0) || 0;

const toDate = (iso: string | null | undefined): string => (iso ? iso.split('T')[0] : '');

function adaptMilestone(m: ApiMilestone): ProjectMilestone {
  return {
    id: m.id,
    title: m.title,
    description: m.description ?? '',
    startDate: m.startDate ?? undefined,
    deadline: toDate(m.targetDate),
    status: m.status === 'IN_PROGRESS' ? 'in_progress' : m.status === 'COMPLETED' ? 'completed' : 'pending',
    result: m.resultText ?? undefined,
  };
}

function toFieldStatus(status: ReviewStatus): SceneReviewStatus {
  if (status === 'APPROVED') return 'approved';
  if (status === 'CHANGES_REQUESTED' || status === 'REJECTED') return 'changes_requested';
  return 'pending';
}

function toFieldReview(review: ApiPlanReview | undefined): FieldReview {
  if (!review) return PENDING_FIELD_REVIEW;
  return {
    status: toFieldStatus(review.status),
    comment: review.rejectionReason ?? review.comments ?? undefined,
    review_id: review.id,
  };
}

/**
 * Latest review of every target — each scene, each plan-level field (BR-39).
 * Reviews arrive oldest first. A freshly (re)submitted plan has no open round
 * yet, so its previous verdicts no longer apply.
 */
function latestReviews(plan: ApiProductionPlan): Map<string, ApiPlanReview> {
  const latest = new Map<string, ApiPlanReview>();
  if (plan.status === 'SUBMITTED') return latest;
  for (const review of plan.planReviews ?? []) {
    latest.set(review.field === 'SCENE' ? `scene:${review.sceneId}` : review.field, review);
  }
  return latest;
}

/**
 * BR-42 as the backend computes it: the latest check of every type must PASS,
 * so a check that failed and was re-run later no longer counts.
 */
export function isCompliant(checks: ApiComplianceCheck[]): boolean {
  const latest = new Map<string, ApiComplianceCheck>();
  for (const check of checks) {
    const current = latest.get(check.checkType);
    if (!current || (check.checkedAt ?? '') >= (current.checkedAt ?? '')) latest.set(check.checkType, check);
  }
  return COMPLIANCE_CHECK_TYPES.every((type) => latest.get(type)?.result === 'PASS');
}

/** Where the episode is in MF-1, derived from the plan and its latest package. */
function deriveEpisodeState(plan: ApiProductionPlan, pkg: ApiEpisodePackage | undefined): WorkflowState {
  const episode = pkg?.currentForEpisode;
  if (episode?.productionStatus === 'PUBLISHED') return 'PUBLISHED';

  if (pkg) {
    const review = pkg.reviews[0];
    if (review?.status === 'CHANGES_REQUESTED' || review?.status === 'REJECTED') return 'CUT_CHANGES_REQUESTED';
    // Ready to publish once the cut is approved, which the backend only allows on a compliant package.
    if (review?.status === 'APPROVED' && isCompliant(pkg.complianceChecks)) return 'COMPLIANCE_PASSED';
    if (pkg.submissions.length > 0) return 'EPISODE_SUBMITTED';
  }

  switch (plan.status) {
    case 'DRAFT':
      return 'PLAN_DRAFT';
    case 'CHANGES_REQUESTED':
      return 'CHANGES_REQUESTED';
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
      return 'PLAN_PENDING';
    case 'APPROVED':
      if (plan._count.generationJobs > 0) return 'IN_PRODUCTION';
      return plan.quotaAllocations.some((q) => q.status === 'ACTIVE') ? 'QUOTA_ALLOCATED' : 'PLAN_PENDING';
  }
}

function finalCutOf(pkg: ApiEpisodePackage, streamUrl: string): FinalCut {
  return {
    stream_url: streamUrl,
    qualities: pkg.qualities,
    subtitles: pkg.subtitles.map(({ language }) => ({
      language,
      label: languageLabel(language),
      endpoint: API_ROUTES.WORKFLOW.PACKAGE_SUBTITLE(pkg.id, language),
    })),
  };
}

function adaptQuotaRequest(request: ApiQuotaRequest, plan: ApiProductionPlan): QuotaRequest {
  const grant = plan.quotaAllocations.find((q) => q.id === request.quotaAllocationId);
  return {
    id: request.id,
    requested_amount: request.requestedAmount,
    granted_amount: grant ? toNumber(grant.allocatedAmount) : undefined,
    reason: request.reason,
    status: request.status === 'APPROVED' ? 'approved' : request.status === 'REJECTED' ? 'rejected' : 'pending',
    requested_by_name: request.requestedBy?.fullName ?? '',
    decided_by_name: request.decidedBy?.fullName ?? undefined,
    decision_note: request.decisionNote ?? undefined,
    created_at: request.createdAt,
    decided_at: request.decidedAt ?? undefined,
  };
}

function adaptPlan(plan: ApiProductionPlan, project: ApiProductionProject, multiSeason: boolean): EpisodePackage {
  const reviews = latestReviews(plan);
  const pkg = plan.episodePackages[0];
  const status = deriveEpisodeState(plan, pkg);
  // The Reviewer's allotted duration is the baseline; the Creator proposes the plan's own duration.
  const allottedSeconds = plan.allottedDurationSeconds ?? project.defaultEpisodeDurationSeconds ?? DEFAULT_EPISODE_SECONDS;
  const allottedMinutes = Math.round(allottedSeconds / 60);
  const proposedMinutes = Math.round((plan.targetDurationSeconds ?? allottedSeconds) / 60);
  const numbered = { season_number: plan.seasonNumber, episode_number: plan.seasonEpisodeNumber };
  const title = `${episodeLabel(numbered, multiSeason)}: ${project.title}`;

  const scenes: SceneBreakdownItem[] = plan.scenes.map((s) => ({
    id: s.id,
    scene_number: s.sceneNumber,
    title: s.title,
    description: s.description ?? s.scriptText ?? '',
    target_duration_sec: s.targetDurationSeconds,
    estimated_tokens: s.estimatedTokens,
  }));

  const activeQuota = plan.quotaAllocations.filter((q) => q.status === 'ACTIVE');
  const allocated = activeQuota.reduce((sum, q) => sum + toNumber(q.allocatedAmount), 0);
  const remaining = activeQuota.reduce((sum, q) => sum + toNumber(q.remainingAmount), 0);

  const episode: EpisodePackage = {
    id: plan.id,
    package_id: pkg?.id,
    catalog_episode_id: pkg?.currentForEpisode?.id,
    project_id: project.id,
    ...numbered,
    title,
    target_duration_minutes: allottedMinutes,
    status,
    total_duration: pkg?.durationSeconds ? formatDuration(pkg.durationSeconds) : `${proposedMinutes}:00`,
    actual_tokens_used: allocated - remaining,
    quota_allocated: allocated,
    quota_requests: plan.quotaRequests.map((r) => adaptQuotaRequest(r, plan)),
    is_labelled: (pkg?.aiContentLabels.length ?? 0) > 0,
    is_compliant: pkg ? isCompliant(pkg.complianceChecks) : false,
    final_cut: pkg?.streamUrl ? finalCutOf(pkg, pkg.streamUrl) : undefined,
    brief: {
      id: plan.id,
      project_id: project.id,
      episode_id: plan.id,
      title,
      scene_count: scenes.length,
      target_duration_minutes: proposedMinutes,
      estimated_tokens: toNumber(plan.estimatedAiResourceUsage),
      production_approach: plan.productionApproach ?? '',
      storyboard_summary: plan.scriptText ?? '',
      scene_breakdown: scenes,
      scene_reviews: scenes.map((s) => ({ scene_number: s.scene_number, ...toFieldReview(reviews.get(`scene:${s.id}`)) })),
      script_review: toFieldReview(reviews.get('OVERALL_SCRIPT')),
      duration_review: toFieldReview(reviews.get('DURATION')),
      token_review: toFieldReview(reviews.get('TOKEN_ESTIMATE')),
      status,
      created_at: plan.createdAt,
      updated_at: plan.updatedAt,
    },
    jobs: [],
    assets: [],
    review_log: buildReviewLog(plan),
    created_at: plan.createdAt,
    updated_at: plan.updatedAt,
  };
  // Jobs are listed per plan; the store fills them in for episodes in production.
  return { ...episode, ...buildSceneJobs(episode, []) };
}

/** The detail endpoint returns every plan version, newest first per episode — keep the newest, in season order. */
function latestPlans(plans: ApiProductionPlan[]): ApiProductionPlan[] {
  const byEpisode = new Map<number, ApiProductionPlan>();
  for (const plan of plans) {
    if (!byEpisode.has(plan.episodeNumber)) byEpisode.set(plan.episodeNumber, plan);
  }
  return [...byEpisode.values()].sort((a, b) => a.seasonNumber - b.seasonNumber || a.seasonEpisodeNumber - b.seasonEpisodeNumber);
}

function overallStatus(api: ApiProductionProject, episodes: EpisodePackage[]): ProductionProject['overall_status'] {
  if (api.status === 'COMPLETED' || (episodes.length > 0 && episodes.every((e) => e.status === 'PUBLISHED'))) return 'COMPLETED';
  if (episodes.some((e) => e.status === 'CHANGES_REQUESTED' || e.status === 'CUT_CHANGES_REQUESTED')) return 'CHANGES_REQUESTED';
  if (episodes.some((e) => e.status === 'PLAN_PENDING' || e.status === 'EPISODE_SUBMITTED')) return 'PENDING_REVIEW';
  if (episodes.some((e) => e.status !== 'PLAN_DRAFT')) return 'IN_PROGRESS';
  return 'NOT_STARTED';
}

/**
 * The list endpoint carries no plans, so its projects get no episodes until
 * the detail endpoint is loaded for them.
 */
export function adaptApiProjectToUiProject(api: ApiProductionProject): ProductionProject {
  const plans = latestPlans(api.productionPlans ?? []);
  const seasonCount = Math.max(1, ...plans.map((p) => p.seasonNumber));
  const episodes = plans.map((plan) => adaptPlan(plan, api, seasonCount > 1));
  const milestones = (api.milestones ?? []).map(adaptMilestone);
  const total = toNumber(api.totalAiQuotaBudget);
  const allocated = total - toNumber(api.remainingAiQuotaBudget);
  const scriptPlan = plans.find((p) => p.planReviews.some((r) => r.field === 'OVERALL_SCRIPT')) ?? plans[0];
  const published = episodes.filter((e) => e.status === 'PUBLISHED').length;

  return {
    id: api.id,
    title: api.title,
    genre: (api.productionProjectGenres ?? []).map((g) => g.genre.name),
    synopsis: api.description ?? '',
    overall_script: scriptPlan?.scriptText ?? '',
    script_version: scriptPlan?.planVersion ?? 1,
    script_review: scriptPlan ? toFieldReview(latestReviews(scriptPlan).get('OVERALL_SCRIPT')) : PENDING_FIELD_REVIEW,
    season_count: seasonCount,
    total_episodes: api.episodeCount,
    total_budget_tokens: total,
    allocated_tokens: allocated,
    consumed_tokens: episodes.reduce((sum, e) => sum + e.actual_tokens_used, 0),
    production_start_date: toDate(api.productionStartDate),
    deadline: toDate(api.deadline),
    planned_release_date: toDate(api.plannedReleaseDate),
    creator_name: api.assignedCreator?.fullName ?? '',
    reviewer_name: api.createdBy?.fullName ?? '',
    overall_status: overallStatus(api, episodes),
    active_episode_title: episodes[0]?.title ?? '',
    progress_percent: api.episodeCount > 0 ? Math.round((published / api.episodeCount) * 100) : 0,
    milestones,
    episodes,
    created_at: api.createdAt,
    updated_at: api.updatedAt,
  };
}
