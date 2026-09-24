export type ReviewType = 'plan' | 'content';

export type ReviewDecision = 'approved' | 'rejected' | 'changes_requested';

export type SceneReviewStatus = 'pending' | 'approved' | 'changes_requested';

/**
 * Verdict + comment for one reviewable field of a production plan (BR-39).
 */
export interface FieldReview {
  status: SceneReviewStatus;
  comment?: string;
  /** Backend PlanReview row this verdict is recorded on, once a review round exists. */
  review_id?: string;
}

/** Plan fields the Reviewer signs off besides the individual scenes. */
export type PlanFieldKey = 'script' | 'duration' | 'token';

export const PENDING_FIELD_REVIEW: FieldReview = { status: 'pending' };

/**
 * Per-scene verdict inside a plan review (BR-39) — lets Reviewer approve
 * individual scenes and send only the flagged ones back for rework.
 */
export interface SceneReview extends FieldReview {
  scene_number: number;
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
