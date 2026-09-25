import type { StateCreator } from 'zustand';
import type { FieldReview, PlanFieldKey, SceneReviewStatus } from '@/types/workflow';
import type { DecideReviewDto, PlanReviewField } from '@/types/workflow-api';
import type { ReviewSlice, WorkflowStoreState } from '../types';
import { toast } from '@/components/ui/Toast';
import { workflowService } from '@/services/workflowService';
import { planFieldReviews, scriptReview } from '@/features/workflow/lib/planVerdict';
import { apiResult } from './apiResult';

const FIELD_OF: Record<PlanFieldKey, PlanReviewField> = {
  script: 'OVERALL_SCRIPT',
  duration: 'DURATION',
  token: 'TOKEN_ESTIMATE',
};

interface ReviewTarget {
  field: PlanReviewField;
  sceneId?: string;
}

function decision(status: SceneReviewStatus, comment?: string): DecideReviewDto {
  if (status === 'approved') return { decision: 'APPROVED', comments: comment };
  return { decision: 'CHANGES_REQUESTED', rejectionReason: comment || 'Cần chỉnh sửa' };
}

export const createReviewSlice: StateCreator<WorkflowStoreState, [], [], ReviewSlice> = (_set, get) => {
  const reload = () => get().loadProject(get().activeProjectId);

  /** The verdict currently shown for a plan target. */
  const currentVerdict = (packageId: string, target: ReviewTarget): FieldReview | undefined => {
    const brief = get().getBrief(packageId);
    if (!brief) return undefined;
    if (target.field === 'SCENE') {
      const scene = brief.scene_breakdown.find((s) => s.id === target.sceneId);
      return brief.scene_reviews.find((r) => r.scene_number === scene?.scene_number);
    }
    if (target.field === 'OVERALL_SCRIPT') return scriptReview(brief);
    return target.field === 'DURATION' ? brief.duration_review : brief.token_review;
  };

  /** Id of the undecided review row of a target, opening the plan's review round when none is open yet. */
  const openReviewId = async (packageId: string, target: ReviewTarget): Promise<string | null> => {
    const current = currentVerdict(packageId, target);
    if (current?.review_id) {
      if (current.status === 'pending') return current.review_id;
      toast.info('Mục này đã được chốt', 'Không thể đổi quyết định trong vòng duyệt hiện tại.');
      return null;
    }
    const rows = await apiResult(workflowService.createPlanReview(packageId), 'Không mở được vòng duyệt');
    const row = rows?.find((r) => r.field === target.field && (target.field !== 'SCENE' || r.sceneId === target.sceneId));
    return row?.id ?? null;
  };

  const decideTarget = async (packageId: string, target: ReviewTarget, status: SceneReviewStatus, comment?: string) => {
    if (status === 'pending') return false;
    const reviewId = await openReviewId(packageId, target);
    if (!reviewId) {
      await reload();
      return false;
    }
    const decided = await apiResult(workflowService.decidePlanReview(reviewId, decision(status, comment)), 'Không lưu được đánh giá');
    await reload();
    return decided !== null;
  };

  return {
    reviewScene: async (packageId, sceneNumber, status, comment) => {
      const scene = get().getBrief(packageId)?.scene_breakdown.find((s) => s.scene_number === sceneNumber);
      if (!scene?.id) return false;
      return decideTarget(packageId, { field: 'SCENE', sceneId: scene.id }, status, comment);
    },

    reviewPlanField: (packageId, field, status, comment) => decideTarget(packageId, { field: FIELD_OF[field] }, status, comment),

    requestPlanChanges: async (packageId, feedbackNotes) => {
      const brief = get().getBrief(packageId);
      if (!brief) return false;
      const undecided = planFieldReviews(brief).filter((r) => r.status === 'pending' && r.review_id);
      for (const review of undecided) {
        const decided = await apiResult(
          workflowService.decidePlanReview(review.review_id!, { decision: 'CHANGES_REQUESTED', rejectionReason: feedbackNotes }),
          'Không trả được kế hoạch về'
        );
        if (!decided) {
          await reload();
          return false;
        }
      }
      await reload();
      return true;
    },

    allocateQuota: async (packageId, requestedQuota) => {
      const existing = get().getPackage(packageId)?.quota_allocated ?? 0;
      const amount = requestedQuota - existing;
      if (amount <= 0) return false;
      const allocation = await apiResult(
        workflowService.allocateQuota(packageId, { allocationType: existing > 0 ? 'TOP_UP' : 'INITIAL', allocatedAmount: amount }),
        'Không cấp được token'
      );
      if (!allocation) return false;
      await reload();
      return true;
    },

    requestQuota: async (packageId, amount, reason) => {
      const request = await apiResult(workflowService.requestQuota(packageId, { requestedAmount: amount, reason }), 'Không gửi được yêu cầu');
      if (!request) return false;
      await reload();
      return true;
    },

    approveQuotaRequest: async (requestId, amount, note) => {
      const decided = await apiResult(
        workflowService.approveQuotaRequest(requestId, { approvedAmount: amount, note: note || undefined }),
        'Không cấp được token'
      );
      await reload();
      return decided !== null;
    },

    rejectQuotaRequest: async (requestId, note) => {
      const decided = await apiResult(workflowService.rejectQuotaRequest(requestId, { note }), 'Không từ chối được yêu cầu');
      await reload();
      return decided !== null;
    },

    requestContentChanges: async (packageId, feedbackNotes) => {
      const pkgId = get().getPackage(packageId)?.package_id;
      if (!pkgId) return false;
      const review = await apiResult(workflowService.createReview(pkgId, { comments: feedbackNotes }), 'Không tạo được phiên duyệt');
      if (!review) return false;
      const decided = await apiResult(
        workflowService.decideReview(review.id, { decision: 'CHANGES_REQUESTED', rejectionReason: feedbackNotes }),
        'Không gửi được yêu cầu chỉnh sửa'
      );
      await reload();
      return decided !== null;
    },
  };
};
