import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkflowStore } from '@/store/useWorkflowStore';

describe('Zustand Workflow Store (src/store/useWorkflowStore.ts) — Main Flow 1', () => {
  beforeEach(() => {
    useWorkflowStore.getState().resetDemoData();
  });

  describe('addEpisode', () => {
    it('creates an episode at DRAFT then auto-assigns it, logging both events', () => {
      const store = useWorkflowStore.getState();
      const beforeEvents = store.events.length;
      const res = store.addEpisode({ title: 'Tập Mới', target_duration_minutes: 20 });

      expect(res.success).toBe(true);
      const episode = useWorkflowStore.getState().project.episodes.find((e) => e.id === res.episodeId);
      expect(episode?.status).toBe('ASSIGNED');

      const newEvents = useWorkflowStore.getState().events.slice(beforeEvents);
      expect(newEvents.map((e) => e.event_name)).toEqual(['EPISODE_CREATED', 'CREATOR_ASSIGNED']);
    });

    it('rejects target duration over 30 minutes (BR-31) without mutating state', () => {
      const store = useWorkflowStore.getState();
      const episodeCountBefore = store.project.episodes.length;

      const res = store.addEpisode({ title: 'Tập Quá Dài', target_duration_minutes: 45 });

      expect(res.success).toBe(false);
      expect(useWorkflowStore.getState().project.episodes.length).toBe(episodeCountBefore);
    });
  });

  describe('submitProductionPlan (BR-31)', () => {
    it('rejects a plan with target_duration_minutes > 30', () => {
      const store = useWorkflowStore.getState();
      const res = store.submitProductionPlan('pkg-ep-03', { target_duration_minutes: 40 });

      expect(res.success).toBe(false);
      expect(useWorkflowStore.getState().getPackage('pkg-ep-03')?.status).toBe('PLAN_REVIEW');
    });

    it('accepts a plan within the 30 minute limit and moves to PLAN_REVIEW', () => {
      const store = useWorkflowStore.getState();
      store.addEpisode({ title: 'Tập 4', target_duration_minutes: 20 });
      const episodeId = useWorkflowStore.getState().project.episodes.at(-1)!.id;
      useWorkflowStore.getState().updateContentBrief(episodeId, { synopsis: 'x' });

      const res = useWorkflowStore.getState().submitProductionPlan(episodeId, { target_duration_minutes: 20 });
      expect(res.success).toBe(true);
      expect(useWorkflowStore.getState().getPackage(episodeId)?.status).toBe('PLAN_REVIEW');
    });
  });

  describe('plan vs content change-request loops stay distinct', () => {
    it('requestPlanChanges sets PLAN_CHANGES_REQUESTED, not the generic CHANGES_REQUESTED', () => {
      useWorkflowStore.getState().requestPlanChanges('pkg-ep-03', 'Sửa lại kịch bản cảnh 2.');
      expect(useWorkflowStore.getState().getPackage('pkg-ep-03')?.status).toBe('PLAN_CHANGES_REQUESTED');
    });

    it('requestContentChanges sets CHANGES_REQUESTED (content loop)', () => {
      useWorkflowStore.getState().requestContentChanges('pkg-ep-02', 'Ánh sáng cảnh 2 chưa đạt.');
      expect(useWorkflowStore.getState().getPackage('pkg-ep-02')?.status).toBe('CHANGES_REQUESTED');
    });
  });

  describe('allocateQuota (BR-12)', () => {
    it('rejects when total allocated quota would exceed the project budget', () => {
      const store = useWorkflowStore.getState();
      store.approveProductionPlan('pkg-ep-03');

      const project = useWorkflowStore.getState().project;
      const remaining = project.total_budget_tokens - project.allocated_tokens;

      const res = useWorkflowStore.getState().allocateQuota('pkg-ep-03', remaining + 1000);
      expect(res.success).toBe(false);
      expect(useWorkflowStore.getState().getPackage('pkg-ep-03')?.status).toBe('PLAN_APPROVED');
    });

    it('accepts an allocation within the remaining project budget', () => {
      const store = useWorkflowStore.getState();
      store.approveProductionPlan('pkg-ep-03');

      const res = useWorkflowStore.getState().allocateQuota('pkg-ep-03', 100);
      expect(res.success).toBe(true);
      expect(useWorkflowStore.getState().getPackage('pkg-ep-03')?.status).toBe('READY_FOR_PRODUCTION');
    });

    it('rejects allocation when the plan has not been approved yet', () => {
      const res = useWorkflowStore.getState().allocateQuota('pkg-ep-03', 100);
      expect(res.success).toBe(false);
    });
  });

  describe('approveContent bug fix', () => {
    it('moves to COMPLIANCE_REVIEW (not straight to COMPLIANCE_PASSED), logging both events', () => {
      const store = useWorkflowStore.getState();
      const beforeEvents = store.events.length;

      store.approveContent('pkg-ep-02');

      const state = useWorkflowStore.getState();
      expect(state.getPackage('pkg-ep-02')?.status).toBe('COMPLIANCE_REVIEW');
      const newEvents = state.events.slice(beforeEvents);
      expect(newEvents.map((e) => e.event_name)).toEqual(['EPISODE_APPROVED', 'COMPLIANCE_CHECK_STARTED']);
    });
  });

  describe('saveComplianceCheck real pass/fail branch', () => {
    it('fails when any checklist item is false, and can be retried afterwards', () => {
      useWorkflowStore.getState().approveContent('pkg-ep-02');

      const failResult = useWorkflowStore.getState().saveComplianceCheck('pkg-ep-02', {
        article_44_passed: false,
        decree142_passed: true,
        watermark_verified: true,
      });
      expect(failResult.passed).toBe(false);
      expect(useWorkflowStore.getState().getPackage('pkg-ep-02')?.status).toBe('COMPLIANCE_CHANGES_REQUESTED');
      expect(useWorkflowStore.getState().complianceChecks['pkg-ep-02'].status).toBe('failed');

      const retryResult = useWorkflowStore.getState().saveComplianceCheck('pkg-ep-02', {
        article_44_passed: true,
        decree142_passed: true,
        watermark_verified: true,
      });
      expect(retryResult.passed).toBe(true);
      expect(useWorkflowStore.getState().getPackage('pkg-ep-02')?.status).toBe('COMPLIANCE_PASSED');
    });
  });

  describe('scheduleFilm / publishFilm (BR-19, BR-29)', () => {
    it('publishFilm rejects when the episode is not SCHEDULED yet', () => {
      const res = useWorkflowStore.getState().publishFilm('pkg-ep-01');
      expect(res.success).toBe(false);
    });

    it('scheduleFilm requires a positive coin price', () => {
      useWorkflowStore.getState().approveContent('pkg-ep-02');
      useWorkflowStore.getState().saveComplianceCheck('pkg-ep-02', {
        article_44_passed: true,
        decree142_passed: true,
        watermark_verified: true,
      });

      const res = useWorkflowStore.getState().scheduleFilm('pkg-ep-02', {
        scheduled_at: '2026-10-01T20:00',
        coin_price: 0,
        visibility: 'public',
        channels: ['WEB_OTT'],
      });
      expect(res.success).toBe(false);
    });

    it('schedules then publishes, storing coin_price on the episode', () => {
      useWorkflowStore.getState().approveContent('pkg-ep-02');
      useWorkflowStore.getState().saveComplianceCheck('pkg-ep-02', {
        article_44_passed: true,
        decree142_passed: true,
        watermark_verified: true,
      });

      const scheduleRes = useWorkflowStore.getState().scheduleFilm('pkg-ep-02', {
        scheduled_at: '2026-10-01T20:00',
        coin_price: 30,
        visibility: 'public',
        channels: ['WEB_OTT'],
      });
      expect(scheduleRes.success).toBe(true);
      expect(useWorkflowStore.getState().getPackage('pkg-ep-02')?.status).toBe('SCHEDULED');
      expect(useWorkflowStore.getState().getPackage('pkg-ep-02')?.coin_price).toBe(30);

      const publishRes = useWorkflowStore.getState().publishFilm('pkg-ep-02');
      expect(publishRes.success).toBe(true);
      expect(useWorkflowStore.getState().getPackage('pkg-ep-02')?.status).toBe('PUBLISHED');
    });
  });

  describe('production event log is append-only (BR-16)', () => {
    it('only grows and never mutates existing entries', () => {
      const before = useWorkflowStore.getState().events;
      useWorkflowStore.getState().requestPlanChanges('pkg-ep-03', 'test');
      const after = useWorkflowStore.getState().events;

      expect(after.length).toBeGreaterThan(before.length);
      before.forEach((event, idx) => {
        expect(after[idx]).toEqual(event);
      });
    });
  });
});
