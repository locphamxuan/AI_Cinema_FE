export type ReviewType = 'plan' | 'content';

export type ReviewDecision = 'approved' | 'rejected' | 'changes_requested';

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
