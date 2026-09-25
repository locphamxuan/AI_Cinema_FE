import { PENDING_FIELD_REVIEW } from '@/types/workflow';
import type { ContentBrief, FieldReview, ProductionProject } from '@/types/workflow';

export type PlanVerdict = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';

/** The overall-script verdict of an episode plan. */
export function scriptReview(project: Pick<ProductionProject, 'script_review'>, brief: ContentBrief | undefined): FieldReview {
  return brief?.script_review ?? project?.script_review ?? PENDING_FIELD_REVIEW;
}

/** Every field review of an episode plan: overall script, duration, token estimate and each scene (BR-39). */
export function planFieldReviews(project: Pick<ProductionProject, 'script_review'>, brief: ContentBrief): FieldReview[] {
  return [
    scriptReview(project, brief),
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

/** One line per flagged field with the Reviewer's comment — the default text when sending a plan back. */
export function summarizeFlaggedFields(project: Pick<ProductionProject, 'script_review'>, brief: ContentBrief): string {
  const flagged: string[] = [];
  const add = (label: string, review?: FieldReview) => {
    if (review?.status === 'changes_requested') flagged.push(`• ${label}: ${review.comment ?? 'cần chỉnh sửa'}`);
  };
  add('Kịch bản tổng thể', scriptReview(project, brief));
  add('Thời lượng đề xuất', brief?.duration_review);
  add('Token dự tính', brief?.token_review);
  (brief?.scene_reviews || []).forEach((sr) => add(`Cảnh ${sr.scene_number}`, sr));
  return flagged.join('\n');
}

/**
 * Project AI budget not yet granted to an episode quota — what the token review compares against.
 * Read from the backend's remaining budget: an episode's quota_allocated only counts its ACTIVE
 * allocations, so summing episodes would hand out tokens already spent.
 */
export function availableBudget(project: Pick<ProductionProject, 'total_budget_tokens' | 'allocated_tokens'>): number {
  return Math.max(0, (project?.total_budget_tokens || 0) - (project?.allocated_tokens || 0));
}
