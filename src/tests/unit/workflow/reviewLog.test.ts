import { describe, it, expect } from 'vitest';
import { buildReviewLog, planReviewRounds } from '@/features/workflow/lib/reviewLog';
import { apiPackage, apiPlan, apiPlanReview } from '@/tests/fixtures/workflowApiFixtures';

const reviewer = { id: 'reviewer-1', fullName: 'Reviewer Một' };
const decided = (field: 'SCENE' | 'DURATION', status: 'APPROVED' | 'CHANGES_REQUESTED', createdAt: string, decidedAt: string, extra = {}) =>
  apiPlanReview(field, { id: `${field}-${createdAt}`, status, createdAt, decidedAt, reviewer, ...extra });

describe('reviewLog', () => {
  it('splits plan reviews into rounds at the first row created after a round closed', () => {
    const rounds = planReviewRounds([
      decided('SCENE', 'APPROVED', '2026-09-01T00:00:00Z', '2026-09-01T01:00:00Z', { sceneId: 'scene-1' }),
      decided('DURATION', 'CHANGES_REQUESTED', '2026-09-01T00:00:00Z', '2026-09-01T02:00:00Z'),
      decided('SCENE', 'APPROVED', '2026-09-03T00:00:00Z', '2026-09-03T01:00:00Z', { sceneId: 'scene-1' }),
      decided('DURATION', 'APPROVED', '2026-09-03T00:00:00Z', '2026-09-03T01:30:00Z'),
    ]);
    expect(rounds.map((r) => r.length)).toEqual([2, 2]);
  });

  it('logs each closed round, quota grant and decided content review, newest first', () => {
    const log = buildReviewLog(
      apiPlan({
        planReviews: [
          decided('SCENE', 'CHANGES_REQUESTED', '2026-09-01T00:00:00Z', '2026-09-01T01:00:00Z', { sceneId: 'scene-2', rejectionReason: 'Thiếu mô tả' }),
          decided('DURATION', 'APPROVED', '2026-09-01T00:00:00Z', '2026-09-01T02:00:00Z'),
          decided('DURATION', 'APPROVED', '2026-09-03T00:00:00Z', '2026-09-03T01:00:00Z'),
          apiPlanReview('SCENE', { id: 'open', sceneId: 'scene-2', createdAt: '2026-09-03T00:00:00Z' }),
        ],
        quotaAllocations: [
          { id: 'q1', allocationType: 'INITIAL', allocatedAmount: '400', remainingAmount: '400', status: 'ACTIVE', createdAt: '2026-09-02T00:00:00Z', allocatedBy: reviewer },
        ],
        episodePackages: [
          apiPackage({
            reviews: [
              { id: 'r2', status: 'PENDING', decidedAt: null, createdAt: '2026-09-06T00:00:00Z' },
              { id: 'r1', status: 'CHANGES_REQUESTED', rejectionReason: 'Âm thanh lệch', decidedAt: '2026-09-05T00:00:00Z', createdAt: '2026-09-05T00:00:00Z', reviewer },
            ],
          }),
        ],
      })
    );

    expect(log.map((e) => [e.review_type, e.decision, e.feedback_notes, e.reviewer_name])).toEqual([
      ['content', 'changes_requested', 'Âm thanh lệch', 'Reviewer Một'],
      ['plan', 'approved', 'Đã cấp 400 token để bắt đầu sản xuất.', 'Reviewer Một'],
      ['plan', 'changes_requested', '• Cảnh 2: Thiếu mô tả', 'Reviewer Một'],
    ]);
    expect(log[1].quota_granted).toBe(400);
  });
});
