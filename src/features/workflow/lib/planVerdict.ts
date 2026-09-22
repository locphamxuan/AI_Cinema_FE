import { PENDING_FIELD_REVIEW } from '@/types/workflow';
import type { ContentBrief, EpisodePackage, FieldReview, ProductionProject, SceneBreakdownItem } from '@/types/workflow';

export type PlanVerdict = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';

/** Every field review of an episode plan: overall script, duration, token estimate and each scene (BR-39). */
export function planFieldReviews(project: Pick<ProductionProject, 'script_review'>, brief: ContentBrief): FieldReview[] {
  return [
    project?.script_review || PENDING_FIELD_REVIEW,
    brief?.duration_review || PENDING_FIELD_REVIEW,
    brief?.token_review || PENDING_FIELD_REVIEW,
    ...(brief?.scene_reviews || []),
  ];
}

/** Overall verdict of an episode plan, aggregated from its field reviews. */
export function derivePlanVerdict(project: Pick<ProductionProject, 'script_review'>, brief: ContentBrief): PlanVerdict {
  if (!brief) return 'PENDING';
  const reviews = planFieldReviews(project, brief);
  if (reviews.some((r) => r.status === 'changes_requested')) return 'CHANGES_REQUESTED';
  const sceneReviews = brief.scene_reviews || [];
  const allApproved = sceneReviews.length > 0 && reviews.every((r) => r.status === 'approved');
  return allApproved ? 'APPROVED' : 'PENDING';
}

/** Fresh 'pending' field reviews for an episode plan — applied on every (re)submit. */
export function pendingPlanReviews(scenes: SceneBreakdownItem[]): Pick<ContentBrief, 'scene_reviews' | 'duration_review' | 'token_review'> {
  return {
    scene_reviews: (scenes || []).map((sc) => ({ scene_number: sc.scene_number, status: 'pending' as const })),
    duration_review: PENDING_FIELD_REVIEW,
    token_review: PENDING_FIELD_REVIEW,
  };
}

/** One line per flagged field with the Reviewer's comment — the default text when sending a plan back. */
export function summarizeFlaggedFields(project: Pick<ProductionProject, 'script_review'>, brief: ContentBrief): string {
  const flagged: string[] = [];
  const add = (label: string, review?: FieldReview) => {
    if (review?.status === 'changes_requested') flagged.push(`• ${label}: ${review.comment ?? 'cần chỉnh sửa'}`);
  };
  add('Kịch bản tổng thể', project?.script_review);
  add('Thời lượng đề xuất', brief?.duration_review);
  add('Token dự toán', brief?.token_review);
  (brief?.scene_reviews || []).forEach((sr) => add(`Phân cảnh ${sr.scene_number}`, sr));
  return flagged.join('\n');
}

/** Project AI budget not yet granted to an episode quota — what the token review compares against. */
export function availableBudget(project: Pick<ProductionProject, 'total_budget_tokens' | 'allocated_tokens'> & { episodes?: EpisodePackage[] }): number {
  if (project?.episodes && project.episodes.length > 0) {
    const sumAllocated = project.episodes.reduce((sum, ep) => sum + (ep.quota_allocated || 0), 0);
    return Math.max(0, (project.total_budget_tokens || 0) - sumAllocated);
  }
  return Math.max(0, (project?.total_budget_tokens || 0) - (project?.allocated_tokens || 0));
}
