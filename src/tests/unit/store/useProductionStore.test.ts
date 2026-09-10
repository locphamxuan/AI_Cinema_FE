import { describe, it, expect, beforeEach } from 'vitest';
import { useProductionStore } from '@/store/useProductionStore';
import { mockProjectCyber } from '@/mocks/productionMock';

describe('Zustand Production Store (src/store/useProductionStore.ts)', () => {
  beforeEach(() => {
    useProductionStore.setState({
      projects: [JSON.parse(JSON.stringify(mockProjectCyber))],
      activeProjectId: 'proj-cyber-01',
      activeRole: 'reviewer',
    });
  });

  describe('Reviewer Actions (Checker Workflow)', () => {
    it('creates a new production project with correct defaults', () => {
      const store = useProductionStore.getState();
      const newProj = store.createProject({
        title: 'Dự Án Thử Nghiệm AI',
        genre: ['Khoa học viễn tưởng'],
        synopsis: 'Mô tả tóm tắt...',
        totalEpisodes: 3,
        deadline: '2026-12-31',
        plannedReleaseDate: '2027-01-10',
        totalBudgetTokens: 2000,
        creatorName: 'Creator Test',
        reviewerName: 'Reviewer Test',
        episodes: [],
      });

      expect(newProj.id).toBeDefined();
      expect(newProj.status).toBe('planning');
      expect(newProj.totalBudgetTokens).toBe(2000);
      expect(useProductionStore.getState().projects[0].id).toBe(newProj.id);
    });

    it('requests plan changes and transitions episode state to PLAN_REJECTED with feedback log', () => {
      const store = useProductionStore.getState();
      const proj = store.getProject('proj-cyber-01')!;

      const success = store.requestPlanChanges(
        proj.id,
        'ep-prod-05',
        'Token ước tính quá cao, yêu cầu tối ưu lại.'
      );

      expect(success).toBe(true);
      const updatedEp = useProductionStore.getState().getEpisode('ep-prod-05', proj.id);
      expect(updatedEp?.status).toBe('PLAN_REJECTED');
      expect(updatedEp?.plan.feedbackHistory[0].content).toContain('Token ước tính quá cao');
    });

    it('approves plan and allocates AI Quota to episode', () => {
      const store = useProductionStore.getState();
      const proj = store.getProject('proj-cyber-01')!;

      const success = store.approveAndAllocateQuota(
        proj.id,
        'ep-prod-05',
        450,
        'Cấp hạn ngạch 450 tokens'
      );

      expect(success).toBe(true);
      const updatedEp = useProductionStore.getState().getEpisode('ep-prod-05', proj.id);
      expect(updatedEp?.status).toBe('QUOTA_ALLOCATED');
      expect(updatedEp?.quota?.allocatedTokens).toBe(450);
    });

    it('approves content and moves to COMPLIANCE_PENDING', () => {
      const store = useProductionStore.getState();
      const proj = store.getProject('proj-cyber-01')!;

      const success = store.approveContent(proj.id, 'ep-prod-02');
      expect(success).toBe(true);

      const updatedEp = useProductionStore.getState().getEpisode('ep-prod-02', proj.id);
      expect(updatedEp?.status).toBe('COMPLIANCE_PENDING');
    });

    it('verifies compliance and publishes film to platform (PUBLISHED)', () => {
      const store = useProductionStore.getState();
      const proj = store.getProject('proj-cyber-01')!;

      const complianceData = {
        aiLawArticle44Verified: true,
        decree142LabelAttached: true,
        aiWatermarkEnabled: true,
        certificationId: 'AI-VN-2026-TEST-001',
        moderationScore: 99.5,
        aiContentPercentage: 100,
        verifiedBy: 'Reviewer Test',
        verifiedAt: new Date().toISOString(),
      };

      const success = store.verifyComplianceAndPublish(
        proj.id,
        'ep-prod-02',
        complianceData,
        new Date().toISOString()
      );

      expect(success).toBe(true);
      const updatedEp = useProductionStore.getState().getEpisode('ep-prod-02', proj.id);
      expect(updatedEp?.status).toBe('PUBLISHED');
      expect(updatedEp?.compliance?.certificationId).toBe('AI-VN-2026-TEST-001');
    });
  });

  describe('Creator Actions (Maker AI Studio Workflow)', () => {
    it('submits production plan and transitions state to PLAN_SUBMITTED', () => {
      const store = useProductionStore.getState();
      const proj = store.getProject('proj-cyber-01')!;

      const success = store.submitProductionPlan(proj.id, 'ep-prod-04', {
        overviewScript: 'Kịch bản đã được hiệu chỉnh lại số cảnh.',
        estimatedTokens: 420,
      });

      expect(success).toBe(true);
      const updatedEp = useProductionStore.getState().getEpisode('ep-prod-04', proj.id);
      expect(updatedEp?.status).toBe('PLAN_SUBMITTED');
    });

    it('blocks AI scene video generation when Token Quota is exceeded', async () => {
      const store = useProductionStore.getState();
      const proj = store.getProject('proj-cyber-01')!;
      const ep3 = store.getEpisode('ep-prod-03', proj.id);

      if (ep3 && ep3.quota) {
        // Artificially set actual used to quota limit
        useProductionStore.setState((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== proj.id) return p;
            return {
              ...p,
              episodes: p.episodes.map((e) =>
                e.id === 'ep-prod-03' ? { ...e, actualTokensUsed: 500 } : e
              ),
            };
          }),
        }));

        const result = await store.generateSceneVideo(proj.id, 'ep-prod-03', 'sc-303');
        expect(result.success).toBe(false);
        expect(result.error).toContain('Vượt quá giới hạn hạn ngạch AI Token');
      }
    });

    it('switches between Reviewer and Creator roles', () => {
      const store = useProductionStore.getState();
      store.setActiveRole('creator');
      expect(useProductionStore.getState().activeRole).toBe('creator');

      store.setActiveRole('reviewer');
      expect(useProductionStore.getState().activeRole).toBe('reviewer');
    });
  });
});
