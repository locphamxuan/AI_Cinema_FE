import { describe, it, expect, beforeEach } from 'vitest';
import { useProductionStore } from '@/store/useProductionStore';
import { mockProjectCyber, mockUserDevices } from '@/mocks/productionMock';

describe('Zustand Production Store (src/store/useProductionStore.ts)', () => {
  beforeEach(() => {
    useProductionStore.setState({
      projects: [JSON.parse(JSON.stringify(mockProjectCyber))],
      activeProjectId: 'proj-cyber-01',
      activeRole: 'reviewer',
      devices: JSON.parse(JSON.stringify(mockUserDevices)),
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

  describe('MainFlow4 Features (Milestones, Policies, Devices, Reviews, Tokens, Submissions)', () => {
    it('manages user devices (revoke one, revoke all other devices)', () => {
      const store = useProductionStore.getState();
      expect(store.devices.length).toBeGreaterThanOrEqual(2);

      const targetId = store.devices.find((d) => !d.isCurrentDevice)?.id;
      if (targetId) {
        store.revokeDevice(targetId);
        expect(useProductionStore.getState().devices.find((d) => d.id === targetId)).toBeUndefined();
      }

      store.revokeAllOtherDevices();
      const remaining = useProductionStore.getState().devices;
      expect(remaining.length).toBe(1);
      expect(remaining[0].isCurrentDevice).toBe(true);
    });

    it('adds, updates, and removes project milestones', () => {
      const store = useProductionStore.getState();
      const projId = 'proj-cyber-01';

      store.addMilestone(projId, {
        title: 'Cột mốc thử nghiệm',
        dueDate: '2026-11-01',
        assignedTo: 'Tester',
        deliverable: 'Bản render demo',
        description: 'Mô tả mốc',
        status: 'pending',
      });

      const updatedProj = useProductionStore.getState().getProject(projId)!;
      const added = updatedProj.milestones?.find((m) => m.title === 'Cột mốc thử nghiệm');
      expect(added).toBeDefined();

      if (added) {
        store.updateMilestone(projId, added.id, { status: 'completed' });
        const checkDone = useProductionStore.getState().getProject(projId)?.milestones?.find((m) => m.id === added.id);
        expect(checkDone?.status).toBe('completed');

        store.removeMilestone(projId, added.id);
        const checkRemoved = useProductionStore.getState().getProject(projId)?.milestones?.find((m) => m.id === added.id);
        expect(checkRemoved).toBeUndefined();
      }
    });

    it('reorders scenes and updates scene review status individually', () => {
      const store = useProductionStore.getState();
      const projId = 'proj-cyber-01';
      const epId = 'ep-prod-02';

      // Review scene
      store.reviewScene(projId, epId, 'sc-203', 'approved');
      const ep = useProductionStore.getState().getEpisode(epId, projId)!;
      const sc3 = ep.scenes.find((s) => s.id === 'sc-203');
      expect(sc3?.reviewStatus).toBe('approved');

      // Reorder scenes
      const initialFirstSceneId = ep.scenes[0].id;
      const initialSecondSceneId = ep.scenes[1].id;
      store.reorderScenes(projId, epId, 0, 1);
      const reorderedEp = useProductionStore.getState().getEpisode(epId, projId)!;
      expect(reorderedEp.scenes[0].id).toBe(initialSecondSceneId);
      expect(reorderedEp.scenes[1].id).toBe(initialFirstSceneId);
      expect(reorderedEp.scenes[0].sceneNumber).toBe(1);
    });

    it('handles token extension requests and approves them, automatically crediting quota', () => {
      const store = useProductionStore.getState();
      const projId = 'proj-cyber-01';
      const epId = 'ep-prod-03';

      const initialQuota = store.getEpisode(epId, projId)?.quota?.allocatedTokens || 0;
      store.requestTokenExtension(projId, epId, 150, 'Cần thêm tokens cho VFX phức tạp');

      const projWithReq = useProductionStore.getState().getProject(projId)!;
      const pendingReq = projWithReq.tokenExtensionRequests?.find((r) => r.status === 'pending');
      expect(pendingReq).toBeDefined();
      expect(pendingReq?.requestedTokens).toBe(150);

      if (pendingReq) {
        store.respondToTokenExtension(projId, pendingReq.id, true, 'Đã đồng ý cấp thêm 150 tokens');
        const afterProj = useProductionStore.getState().getProject(projId)!;
        const approvedReq = afterProj.tokenExtensionRequests?.find((r) => r.id === pendingReq.id);
        expect(approvedReq?.status).toBe('approved');

        const afterEp = useProductionStore.getState().getEpisode(epId, projId)!;
        expect(afterEp.quota?.allocatedTokens).toBe(initialQuota + 150);
      }
    });

    it('submits episode draft and creates official EpisodeSubmission entity', () => {
      const store = useProductionStore.getState();
      const projId = 'proj-cyber-01';
      const epId = 'ep-prod-02';

      const result = store.submitEpisodeDraft(projId, epId, 'Bản nộp Master 4K hoàn chỉnh');
      expect(result.success).toBe(true);
      expect(result.submission).toBeDefined();
      expect(result.submission?.versionNumber).toBe('v1.1.0');

      const updatedEp = useProductionStore.getState().getEpisode(epId, projId)!;
      expect(updatedEp.status).toBe('CONTENT_SUBMITTED');
      expect(updatedEp.submissions?.length).toBe(1);
    });
  });
});

