import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { apiPlan, apiPlanReview, apiProject } from '@/tests/fixtures/workflowApiFixtures';
import { api, fail, ok, resetWorkflowStore, serveBackendProject } from '@/tests/support/workflowStoreHarness';

vi.mock('@/services/workflowService', () => import('@/tests/support/workflowServiceMock'));

describe('Workflow store — plan review and quota', () => {
  beforeEach(resetWorkflowStore);

  describe('Checker (Reviewer) field-level plan review (BR-39)', () => {
    it('opens the review round on the first verdict, then decides that row', async () => {
      serveBackendProject(apiProject([apiPlan({ status: 'SUBMITTED' })]));
      api.createPlanReview.mockReturnValue(
        ok([apiPlanReview('SCENE', { id: 'row-s1', sceneId: 'scene-1' }), apiPlanReview('DURATION', { id: 'row-d' })])
      );
      api.decidePlanReview.mockReturnValue(ok(apiPlanReview('DURATION')));

      expect(await useWorkflowStore.getState().reviewPlanField('plan-1', 'duration', 'approved')).toBe(true);
      expect(api.createPlanReview).toHaveBeenCalledWith('plan-1');
      expect(api.decidePlanReview).toHaveBeenCalledWith('row-d', { decision: 'APPROVED', comments: undefined });
    });

    it('decides the open row of a scene directly, sending the comment as the reason', async () => {
      serveBackendProject(apiProject([apiPlan({ status: 'UNDER_REVIEW', planReviews: [apiPlanReview('SCENE', { id: 'row-s2', sceneId: 'scene-2' })] })]));
      api.decidePlanReview.mockReturnValue(ok(apiPlanReview('SCENE')));

      await useWorkflowStore.getState().reviewScene('plan-1', 2, 'changes_requested', 'Thiếu mô tả');
      expect(api.createPlanReview).not.toHaveBeenCalled();
      expect(api.decidePlanReview).toHaveBeenCalledWith('row-s2', { decision: 'CHANGES_REQUESTED', rejectionReason: 'Thiếu mô tả' });
    });

    it('does not re-decide a field already decided in this round', async () => {
      serveBackendProject(
        apiProject([apiPlan({ status: 'UNDER_REVIEW', planReviews: [apiPlanReview('TOKEN_ESTIMATE', { status: 'APPROVED', decidedAt: 'x' })] })])
      );
      expect(await useWorkflowStore.getState().reviewPlanField('plan-1', 'token', 'changes_requested', 'x')).toBe(false);
      expect(api.decidePlanReview).not.toHaveBeenCalled();
    });

    it('sends every undecided field back when requesting changes', async () => {
      serveBackendProject(
        apiProject([
          apiPlan({
            status: 'UNDER_REVIEW',
            planReviews: [
              apiPlanReview('TOKEN_ESTIMATE', { status: 'CHANGES_REQUESTED', decidedAt: 'x' }),
              apiPlanReview('DURATION', { id: 'row-d' }),
            ],
          }),
        ])
      );
      api.decidePlanReview.mockReturnValue(ok(apiPlanReview('DURATION')));

      expect(await useWorkflowStore.getState().requestPlanChanges('plan-1', 'Sửa token')).toBe(true);
      expect(api.decidePlanReview).toHaveBeenCalledTimes(1);
      expect(api.decidePlanReview).toHaveBeenCalledWith('row-d', { decision: 'CHANGES_REQUESTED', rejectionReason: 'Sửa token' });
    });
  });

  describe('Quota allocation', () => {
    it('grants an INITIAL quota, then only the difference as TOP_UP', async () => {
      serveBackendProject(apiProject([apiPlan({ status: 'APPROVED' })]));
      api.allocateQuota.mockReturnValue(ok({}) as never);
      await useWorkflowStore.getState().allocateQuota('plan-1', 400);
      expect(api.allocateQuota).toHaveBeenCalledWith('plan-1', { allocationType: 'INITIAL', allocatedAmount: 400 });

      const quota = [{ id: 'q1', allocationType: 'INITIAL' as const, allocatedAmount: '400', remainingAmount: '400', status: 'ACTIVE' as const, createdAt: '' }];
      serveBackendProject(apiProject([apiPlan({ status: 'APPROVED', quotaAllocations: quota })]));
      await useWorkflowStore.getState().allocateQuota('plan-1', 600);
      expect(api.allocateQuota).toHaveBeenLastCalledWith('plan-1', { allocationType: 'TOP_UP', allocatedAmount: 200 });
    });

    it('does nothing when the requested quota is not above the current one', async () => {
      const quota = [{ id: 'q1', allocationType: 'INITIAL' as const, allocatedAmount: '400', remainingAmount: '400', status: 'ACTIVE' as const, createdAt: '' }];
      serveBackendProject(apiProject([apiPlan({ status: 'APPROVED', quotaAllocations: quota })]));
      expect(await useWorkflowStore.getState().allocateQuota('plan-1', 400)).toBe(false);
      expect(api.allocateQuota).not.toHaveBeenCalled();
    });
  });

  describe('Quota top-up requests', () => {
    beforeEach(() => serveBackendProject(apiProject([apiPlan({ status: 'APPROVED' })])));

    it('sends the Creator request and reloads the project', async () => {
      api.requestQuota.mockReturnValue(ok({}) as never);
      expect(await useWorkflowStore.getState().requestQuota('plan-1', 500, 'Sinh lại cảnh 3')).toBe(true);
      expect(api.requestQuota).toHaveBeenCalledWith('plan-1', { requestedAmount: 500, reason: 'Sinh lại cảnh 3' });
      expect(api.getProject).toHaveBeenCalled();
    });

    it('grants the amount the Reviewer chose, without an empty note', async () => {
      api.approveQuotaRequest.mockReturnValue(ok({}) as never);
      expect(await useWorkflowStore.getState().approveQuotaRequest('request-1', 300, '')).toBe(true);
      expect(api.approveQuotaRequest).toHaveBeenCalledWith('request-1', { approvedAmount: 300, note: undefined });
    });

    it('reloads even when the request was already decided elsewhere', async () => {
      api.rejectQuotaRequest.mockReturnValue(fail('already decided'));
      expect(await useWorkflowStore.getState().rejectQuotaRequest('request-1', 'Hết ngân sách')).toBe(false);
      expect(api.rejectQuotaRequest).toHaveBeenCalledWith('request-1', { note: 'Hết ngân sách' });
      expect(api.getProject).toHaveBeenCalled();
    });
  });
});
