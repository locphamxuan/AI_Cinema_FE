import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { apiPackage, apiPlan, apiProject } from '@/tests/fixtures/workflowApiFixtures';
import { api, ok, resetWorkflowStore, serveBackendProject } from '@/tests/support/workflowStoreHarness';

vi.mock('@/services/workflowService', () => import('@/tests/support/workflowServiceMock'));

describe('Workflow store — compliance and publishing', () => {
  beforeEach(resetWorkflowStore);

  describe('Compliance & publishing (BR-42)', () => {
    const allPassed = { CONTENT_POLICY: true, LEGAL: true, COPYRIGHT: true, WATERMARK: true, REAL_PERSON_LIKENESS: true };
    const submitted = () => apiProject([apiPlan({ status: 'APPROVED', episodePackages: [apiPackage()] })]);

    const givenCompliancePass = () => {
      api.listPolicies.mockReturnValue(ok({ data: [{ id: 'policy-1', name: 'AI', type: 'AI_LABELING', version: '1', isActive: true }] }));
      api.createReview.mockReturnValue(ok({ id: 'review-1' }) as never);
      api.decideReview.mockReturnValue(ok({}) as never);
      api.createAiContentLabel.mockReturnValue(ok({}) as never);
      api.recordComplianceReview.mockReturnValue(ok({ verdict: 'PASS', checks: [] }) as never);
    };
    const firstCalls = (...mocks: { mock: { invocationCallOrder: number[] } }[]) => mocks.map((m) => m.mock.invocationCallOrder[0]);

    it('labels the cut, records every manual check as passed, then approves it', async () => {
      serveBackendProject(submitted());
      givenCompliancePass();

      expect(await useWorkflowStore.getState().passCompliance('plan-1', allPassed, 'INTRO_OUTRO')).toBe(true);
      expect(api.decideReview).toHaveBeenCalledWith('review-1', { decision: 'APPROVED' });
      // The backend refuses to approve a package that is not yet labelled and compliant (BR-42).
      const order = firstCalls(api.createAiContentLabel, api.recordComplianceReview, api.createReview, api.decideReview);
      expect(order).toEqual([...order].sort((a, b) => a - b));
      expect(api.createAiContentLabel).toHaveBeenCalledWith('package-1', expect.objectContaining({ policyId: 'policy-1', displayLocation: 'INTRO_OUTRO' }));
      const { checks } = api.recordComplianceReview.mock.calls[0][1];
      expect(checks.map((c) => c.checkType).sort()).toEqual(['CONTENT_POLICY', 'COPYRIGHT', 'LEGAL', 'REAL_PERSON_LIKENESS', 'WATERMARK']);
      expect(checks.every((c) => c.result === 'PASS')).toBe(true);
    });

    it('skips the label and checks an earlier attempt already recorded', async () => {
      const done = apiPackage({
        aiContentLabels: [{ id: 'label-1', labelType: 'AI_GENERATED', labelText: 'AI' }],
        complianceChecks: (['AI_LABEL_PRESENCE', 'CONTENT_POLICY', 'LEGAL', 'COPYRIGHT', 'WATERMARK', 'REAL_PERSON_LIKENESS'] as const).map(
          (checkType) => ({ id: checkType, checkType, result: 'PASS' as const, checkedAt: '2026-09-02T00:00:00Z' })
        ),
      });
      serveBackendProject(apiProject([apiPlan({ status: 'APPROVED', episodePackages: [done] })]));
      givenCompliancePass();

      expect(await useWorkflowStore.getState().passCompliance('plan-1', allPassed, 'INTRO_OUTRO')).toBe(true);
      expect(api.createAiContentLabel).not.toHaveBeenCalled();
      expect(api.recordComplianceReview).not.toHaveBeenCalled();
      expect(api.decideReview).toHaveBeenCalledWith('review-1', { decision: 'APPROVED' });
    });

    it('does not approve when the recorded verdict is not PASS', async () => {
      serveBackendProject(submitted());
      givenCompliancePass();
      api.recordComplianceReview.mockReturnValue(ok({ verdict: 'PENDING', checks: [] }) as never);

      expect(await useWorkflowStore.getState().passCompliance('plan-1', allPassed, 'INTRO_OUTRO')).toBe(false);
      expect(api.createReview).not.toHaveBeenCalled();
    });

    it('records nothing when any check failed — the cut goes back through "request changes"', async () => {
      serveBackendProject(submitted());
      expect(await useWorkflowStore.getState().passCompliance('plan-1', { ...allPassed, COPYRIGHT: false }, 'INTRO_OUTRO')).toBe(false);
      expect(api.createReview).not.toHaveBeenCalled();
      expect(api.recordComplianceReview).not.toHaveBeenCalled();
    });

    it('creates the catalog episode on first publish, then publishes the package', async () => {
      serveBackendProject(submitted());
      api.createCatalog.mockReturnValue(ok({ id: 'movie-1', episodes: [{ id: 'episode-1', currentPackageId: 'package-1' }] }));
      api.createPublication.mockReturnValue(ok({ id: 'pub-1' }) as never);
      api.publish.mockReturnValue(ok({}) as never);

      expect(await useWorkflowStore.getState().publishEpisode('plan-1', '2026-10-01T13:00:00.000Z')).toBe(true);
      expect(api.createPublication).toHaveBeenCalledWith('episode-1', { packageId: 'package-1', scheduledAt: '2026-10-01T13:00:00.000Z' });
      expect(api.publish).toHaveBeenCalledWith('pub-1');
    });

    it('requests content changes through a new review of the package', async () => {
      serveBackendProject(submitted());
      api.createReview.mockReturnValue(ok({ id: 'review-2' }) as never);
      api.decideReview.mockReturnValue(ok({}) as never);

      expect(await useWorkflowStore.getState().requestContentChanges('plan-1', 'Âm thanh lệch')).toBe(true);
      expect(api.decideReview).toHaveBeenCalledWith('review-2', { decision: 'CHANGES_REQUESTED', rejectionReason: 'Âm thanh lệch' });
    });
  });
});
