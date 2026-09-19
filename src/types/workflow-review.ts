export type ReviewType = 'plan' | 'content';

export type ReviewDecision = 'approved' | 'rejected' | 'changes_requested';

export type SceneReviewStatus = 'pending' | 'approved' | 'changes_requested';

/**
 * Per-scene verdict inside a plan review (BR-39) — lets Reviewer approve
 * individual scenes and send only the flagged ones back for rework.
 */
export interface SceneReview {
  scene_number: number;
  status: SceneReviewStatus;
  comment?: string;
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
