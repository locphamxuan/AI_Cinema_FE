import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkflowStore } from '@/store/useWorkflowStore';

describe('Zustand Workflow Store (src/features/workflow/store)', () => {
  beforeEach(() => {
    useWorkflowStore.getState().resetDemoData();
  });

  describe('Maker (Creator) plan actions', () => {
    it('submits a production plan and moves it to PLAN_PENDING', () => {
      const store = useWorkflowStore.getState();
      store.submitProductionPlan('pkg-ep-03');

      const pkg = useWorkflowStore.getState().getPackage('pkg-ep-03');
      expect(pkg?.status).toBe('PLAN_PENDING');
      expect(pkg?.brief.status).toBe('PLAN_PENDING');
    });
  });

  describe('Checker (Reviewer) plan review actions', () => {
    it('allocates quota and moves the package to QUOTA_ALLOCATED', () => {
      const store = useWorkflowStore.getState();
      store.allocateQuota('pkg-ep-03', 500, 'Đạt chuẩn');

      const state = useWorkflowStore.getState();
      const pkg = state.getPackage('pkg-ep-03');
      expect(pkg?.status).toBe('QUOTA_ALLOCATED');
      expect(pkg?.quota_allocated).toBe(500);
      expect(state.project.allocated_tokens).toBe(900 + 500);
      expect(state.reviews[0].decision).toBe('approved');
    });

    it('requests plan changes and moves the package to CHANGES_REQUESTED', () => {
      const store = useWorkflowStore.getState();
      store.requestPlanChanges('pkg-ep-02', 'Cần bổ sung phân cảnh mở đầu');

      const state = useWorkflowStore.getState();
      const pkg = state.getPackage('pkg-ep-02');
      expect(pkg?.status).toBe('CHANGES_REQUESTED');
      expect(state.reviews[0].decision).toBe('changes_requested');
      expect(state.reviews[0].feedback_notes).toBe('Cần bổ sung phân cảnh mở đầu');
    });
  });

  describe('Checker (Reviewer) compliance & publishing actions', () => {
    it('saves a compliance check and moves the package to COMPLIANCE_PASSED', () => {
      const store = useWorkflowStore.getState();
      store.saveComplianceCheck('pkg-ep-02', { article_44_passed: true, decree142_passed: true });

      const state = useWorkflowStore.getState();
      expect(state.getPackage('pkg-ep-02')?.status).toBe('COMPLIANCE_PASSED');
      expect(state.complianceChecks['pkg-ep-02'].status).toBe('passed');
      expect(state.labels['pkg-ep-02'].label_type).toBe('AI_GENERATED_FULL');
    });

    it('schedules and publishes a package, moving it to PUBLISHED', () => {
      const store = useWorkflowStore.getState();
      store.scheduleAndPublish('pkg-ep-02', {
        scheduled_at: '2026-10-01T20:00:00Z',
        visibility: 'public',
        channels: ['WEB_OTT'],
      });

      const state = useWorkflowStore.getState();
      expect(state.getPackage('pkg-ep-02')?.status).toBe('PUBLISHED');
      expect(state.publications['pkg-ep-02'].visibility).toBe('public');
    });
  });
});
