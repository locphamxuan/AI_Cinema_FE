import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { availableBudget, derivePlanVerdict, summarizeFlaggedFields } from '@/features/workflow/lib/planVerdict';
import { creatorGroups, reviewerGroups } from '@/features/workflow/lib/projectGroups';
import {
  initialProject,
  mockAssignedProjects,
  initialReviews,
  initialComplianceChecks,
  initialLabels,
  initialPublications,
} from '@/tests/fixtures/workflowFixtures';

describe('Zustand Workflow Store (src/features/workflow/store)', () => {
  beforeEach(() => {
    useWorkflowStore.setState({
      currentRole: 'creator',
      activeProjectId: 'proj-cyber-01',
      activePackageId: 'pkg-ep-03',
      project: initialProject,
      projects: mockAssignedProjects,
      reviews: initialReviews,
      complianceChecks: initialComplianceChecks,
      labels: initialLabels,
      publications: initialPublications,
    });
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

  describe('Field-level plan review (BR-39)', () => {
    const approveEverything = (packageId: string) => {
      const s = useWorkflowStore.getState();
      s.reviewPlanField(packageId, 'script', 'approved');
      s.reviewPlanField(packageId, 'duration', 'approved');
      s.reviewPlanField(packageId, 'token', 'approved');
      s.getBrief(packageId)?.scene_breakdown.forEach((sc) => s.reviewScene(packageId, sc.scene_number, 'approved'));
    };
    const verdictOf = (packageId: string) => {
      const { project, getBrief } = useWorkflowStore.getState();
      return derivePlanVerdict(project, getBrief(packageId)!);
    };

    it('stays PENDING until every field is approved, then becomes APPROVED', () => {
      useWorkflowStore.getState().submitProductionPlan('pkg-ep-03');
      useWorkflowStore.getState().reviewPlanField('pkg-ep-03', 'script', 'approved');
      expect(verdictOf('pkg-ep-03')).toBe('PENDING');

      approveEverything('pkg-ep-03');
      expect(verdictOf('pkg-ep-03')).toBe('APPROVED');
    });

    it('turns CHANGES_REQUESTED when a single field is flagged, keeping its comment', () => {
      approveEverything('pkg-ep-03');
      useWorkflowStore.getState().reviewPlanField('pkg-ep-03', 'token', 'changes_requested', 'Vượt ngân sách còn lại');

      expect(verdictOf('pkg-ep-03')).toBe('CHANGES_REQUESTED');
      expect(useWorkflowStore.getState().getBrief('pkg-ep-03')?.token_review).toEqual({
        status: 'changes_requested',
        comment: 'Vượt ngân sách còn lại',
      });
    });

    it('resets episode field reviews on resubmit', () => {
      approveEverything('pkg-ep-03');
      useWorkflowStore.getState().submitProductionPlan('pkg-ep-03');

      const brief = useWorkflowStore.getState().getBrief('pkg-ep-03');
      expect(brief?.duration_review.status).toBe('pending');
      expect(brief?.token_review.status).toBe('pending');
      expect(brief?.scene_reviews.every((r) => r.status === 'pending')).toBe(true);
    });

    it('bumps script_version and resets its review only when the overall script changes', () => {
      const before = useWorkflowStore.getState().project;
      useWorkflowStore.getState().updateOverallScript(before.overall_script);
      expect(useWorkflowStore.getState().project.script_version).toBe(before.script_version);
      expect(useWorkflowStore.getState().project.script_review.status).toBe('approved');

      useWorkflowStore.getState().updateOverallScript('Kịch bản mới');
      const after = useWorkflowStore.getState().project;
      expect(after.script_version).toBe(before.script_version + 1);
      expect(after.script_review.status).toBe('pending');
    });

    it('computes the available project budget from allocated tokens', () => {
      expect(availableBudget(useWorkflowStore.getState().project)).toBe(3000 - 900);
    });
  });

  describe('Scene production token cost (BR-41)', () => {
    it('settles each step with an output duration and cost that scale with output length', async () => {
      const { settleGenerationStep } = await import('@/features/workflow/lib/tokenCost');
      const short = settleGenerationStep({ function_type: 'VIDEO', prompt: 'cảnh ngắn' });
      const long = settleGenerationStep({ function_type: 'VIDEO', prompt: 'x'.repeat(400) });

      expect(long.output_duration).toBeGreaterThan(short.output_duration);
      expect(long.token_cost).toBeGreaterThan(short.token_cost);
      expect(short.token_cost).toBe(Math.round(short.output_duration * 3));
    });
  });

  describe('Flow guards from the product spec', () => {
    it('never grants more than the project budget still available (SUM of quotas <= budget)', () => {
      const store = useWorkflowStore.getState();
      const left = availableBudget(store.project);
      store.allocateQuota('pkg-ep-03', left + 5000, 'vượt ngân sách');

      const state = useWorkflowStore.getState();
      expect(state.getPackage('pkg-ep-03')?.quota_allocated).toBe(left);
      expect(availableBudget(state.project)).toBe(0);
    });

    it('does not record a compliance check as passed when any item failed', () => {
      useWorkflowStore.getState().saveComplianceCheck('pkg-ep-02', { article_44_passed: false });
      expect(useWorkflowStore.getState().complianceChecks['pkg-ep-02']?.status).not.toBe('passed');
      expect(useWorkflowStore.getState().getPackage('pkg-ep-02')?.status).not.toBe('COMPLIANCE_PASSED');
    });

    it('summarises only the flagged plan fields, with their comments', () => {
      const store = useWorkflowStore.getState();
      store.reviewPlanField('pkg-ep-03', 'token', 'changes_requested', 'Vượt ngân sách');
      store.reviewScene('pkg-ep-03', 2, 'changes_requested', 'Thiếu mô tả');
      store.reviewScene('pkg-ep-03', 1, 'approved');

      const { project, getBrief } = useWorkflowStore.getState();
      expect(summarizeFlaggedFields(project, getBrief('pkg-ep-03')!)).toBe('• Token dự toán: Vượt ngân sách\n• Phân cảnh 2: Thiếu mô tả');
    });

    it('keeps every seeded episode inside the 30 minute MVP cap', () => {
      const { project } = useWorkflowStore.getState();
      expect(project.episodes.every((ep) => ep.target_duration_minutes <= 30 && ep.brief.target_duration_minutes <= 30)).toBe(true);
    });
  });

  describe('Sidebar project groups', () => {
    it('splits the creator roster into assigned and completed films', () => {
      const [assigned, completed] = creatorGroups(useWorkflowStore.getState().projects);
      expect(assigned.projects.length + completed.projects.length).toBe(useWorkflowStore.getState().projects.length);
      expect(completed.projects.every((p) => p.overall_status === 'COMPLETED')).toBe(true);
    });

    it('places each project in exactly one reviewer stage', () => {
      const { projects } = useWorkflowStore.getState();
      const groups = reviewerGroups(projects);
      expect(groups.map((g) => g.key)).toEqual(['new', 'planReview', 'production', 'released']);
      expect(groups.reduce((sum, g) => sum + g.projects.length, 0)).toBe(projects.length);
      expect(groups.find((g) => g.key === 'planReview')?.projects.map((p) => p.id)).toContain('proj-cyber-01');
      expect(groups.find((g) => g.key === 'production')?.projects.length).toBeGreaterThan(0);
    });

    it('moves a brand new project to the plan-review stage once its plan is submitted', () => {
      const store = useWorkflowStore.getState();
      store.createProject({
        title: 'Phim thử',
        genre: ['Hành động'],
        synopsis: '',
        season_count: 1,
        episodes_per_season: 1,
        episode_target_durations: [30],
        total_budget_tokens: 1000,
        production_start_date: '2026-10-01',
        deadline: '2026-12-01',
        planned_release_date: '2027-01-01',
      });
      const created = useWorkflowStore.getState().project;
      const stageOf = (id: string) => reviewerGroups(useWorkflowStore.getState().projects).find((g) => g.projects.some((p) => p.id === id))?.key;
      expect(stageOf(created.id)).toBe('new');

      useWorkflowStore.getState().submitProductionPlan(created.episodes[0].id);
      expect(stageOf(created.id)).toBe('planReview');
    });
  });

  describe('Custom generation functions (BR-40)', () => {
    it('maps built-in functions straight to their catalog model', async () => {
      const { resolveModel } = await import('@/features/workflow/lib/modelRegistry');
      expect(resolveModel({ function_type: 'VIDEO' }).match).toBe('catalog');
    });

    it('finds a specialist model for a custom function, ignoring Vietnamese diacritics', async () => {
      const { resolveModel } = await import('@/features/workflow/lib/modelRegistry');
      const lipsync = resolveModel({ function_type: 'CUSTOM', custom_function: 'Đồng bộ khẩu hình cho nhân vật' });
      expect(lipsync.match).toBe('specialist');
      expect(lipsync.model?.name).toBe('LipSync Studio');
    });

    it('falls back to the general model for unknown functions and waits while the label is empty', async () => {
      const { resolveModel, stepDefaults } = await import('@/features/workflow/lib/modelRegistry');
      expect(resolveModel({ function_type: 'CUSTOM', custom_function: 'làm gì đó rất lạ' }).match).toBe('general');
      expect(resolveModel({ function_type: 'CUSTOM', custom_function: '  ' }).match).toBe('pending');
      expect(stepDefaults({ function_type: 'CUSTOM', custom_function: '' })).toEqual({ selected_model: '', token_cost: 0 });
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
