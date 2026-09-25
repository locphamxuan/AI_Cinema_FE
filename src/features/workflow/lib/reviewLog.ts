/**
 * Builds an episode's feedback history from the backend: one entry per closed
 * plan review round, one per quota grant, one per turned-down top-up request
 * and one per decided content review.
 */

import type { ReviewLog } from '@/types/workflow';
import type { ApiPlanReview, ApiProductionPlan, ApiReview, ReviewStatus } from '@/types/workflow-api';

const FIELD_LABEL: Record<Exclude<ApiPlanReview['field'], 'SCENE'>, string> = {
  OVERALL_SCRIPT: 'Kịch bản tổng thể',
  DURATION: 'Thời lượng đề xuất',
  TOKEN_ESTIMATE: 'Token dự tính',
};

const DECISION: Partial<Record<ReviewStatus, ReviewLog['decision']>> = {
  APPROVED: 'approved',
  CHANGES_REQUESTED: 'changes_requested',
  REJECTED: 'rejected',
};

const latestDecision = (rows: ApiPlanReview[]) => rows.reduce((max, r) => (r.decidedAt && r.decidedAt > max ? r.decidedAt : max), '');

/**
 * Plan reviews carry no round id, but a round only opens after the previous
 * one is fully decided — so a row created after that point starts a new round.
 */
export function planReviewRounds(reviews: ApiPlanReview[]): ApiPlanReview[][] {
  const rounds: ApiPlanReview[][] = [];
  for (const review of reviews) {
    const current = rounds.at(-1);
    const closed = current?.every((r) => r.decidedAt) && review.createdAt >= latestDecision(current);
    if (!current || closed) rounds.push([review]);
    else current.push(review);
  }
  return rounds;
}

function roundEntry(plan: ApiProductionPlan, round: ApiPlanReview[]): ReviewLog | null {
  if (!round.every((r) => r.decidedAt)) return null;
  const decidedAt = latestDecision(round);
  const reviewer = round.find((r) => r.decidedAt === decidedAt)?.reviewer;
  const flagged = round.filter((r) => r.status !== 'APPROVED');
  const label = (r: ApiPlanReview) =>
    r.field === 'SCENE' ? `Cảnh ${plan.scenes.find((s) => s.id === r.sceneId)?.sceneNumber ?? ''}`.trim() : FIELD_LABEL[r.field];

  return {
    id: `plan-round-${round[0].id}`,
    episode_package_id: plan.id,
    reviewer_id: reviewer?.id ?? '',
    reviewer_name: reviewer?.fullName ?? '',
    review_type: 'plan',
    decision: flagged.length > 0 ? 'changes_requested' : 'approved',
    feedback_notes:
      flagged.length > 0
        ? flagged.map((r) => `• ${label(r)}: ${r.rejectionReason ?? r.comments ?? 'cần chỉnh sửa'}`).join('\n')
        : 'Kế hoạch được duyệt.',
    created_at: decidedAt,
  };
}

function contentEntry(planId: string, review: ApiReview): ReviewLog | null {
  const decision = DECISION[review.status];
  if (!decision || !review.decidedAt) return null;
  return {
    id: review.id,
    episode_package_id: planId,
    reviewer_id: review.reviewer?.id ?? '',
    reviewer_name: review.reviewer?.fullName ?? '',
    review_type: 'content',
    decision,
    feedback_notes: review.rejectionReason ?? review.comments ?? (decision === 'approved' ? 'Bản dựng được duyệt.' : 'Cần chỉnh sửa bản dựng.'),
    created_at: review.decidedAt,
  };
}

export function buildReviewLog(plan: ApiProductionPlan): ReviewLog[] {
  const rounds = planReviewRounds(plan.planReviews).map((round) => roundEntry(plan, round));
  const grants: ReviewLog[] = plan.quotaAllocations.map((q) => {
    const note = plan.quotaRequests.find((r) => r.quotaAllocationId === q.id)?.decisionNote;
    const granted = `Đã cấp ${Number(q.allocatedAmount)} token ${q.allocationType === 'INITIAL' ? 'để bắt đầu sản xuất' : 'bổ sung'}.`;
    return {
      id: q.id,
      episode_package_id: plan.id,
      reviewer_id: q.allocatedBy?.id ?? '',
      reviewer_name: q.allocatedBy?.fullName ?? '',
      review_type: 'plan',
      decision: 'approved',
      feedback_notes: note ? `${granted}
${note}` : granted,
      quota_granted: Number(q.allocatedAmount),
      created_at: q.createdAt,
    };
  });
  const refusals: ReviewLog[] = plan.quotaRequests
    .filter((r) => r.status === 'REJECTED' && r.decidedAt)
    .map((r) => ({
      id: r.id,
      episode_package_id: plan.id,
      reviewer_id: r.decidedBy?.id ?? '',
      reviewer_name: r.decidedBy?.fullName ?? '',
      review_type: 'plan',
      decision: 'rejected',
      feedback_notes: `Không cấp thêm ${r.requestedAmount} token: ${r.decisionNote ?? ''}`.trim(),
      created_at: r.decidedAt!,
    }));
  const content = plan.episodePackages.flatMap((pkg) => pkg.reviews.map((r) => contentEntry(plan.id, r)));

  return [...rounds, ...grants, ...refusals, ...content]
    .filter((entry): entry is ReviewLog => entry !== null)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}
