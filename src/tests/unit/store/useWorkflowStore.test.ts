import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { workflowService } from '@/services/workflowService';
import { availableBudget, derivePlanVerdict, summarizeFlaggedFields } from '@/features/workflow/lib/planVerdict';
import { creatorGroups, reviewerGroups } from '@/features/workflow/lib/projectGroups';
import { adaptApiProjectToUiProject } from '@/features/workflow/lib/apiAdapter';
import { routeDefaults } from '@/features/workflow/lib/modelRouting';
import { initialProject, mockAssignedProjects } from '@/tests/fixtures/workflowFixtures';
import { apiJob, apiPackage, apiPlan, apiPlanReview, apiProject, apiScene } from '@/tests/fixtures/workflowApiFixtures';
import type { ApiProductionProject } from '@/types/workflow-api';

vi.mock('@/services/workflowService', () => ({
  workflowService: {
    listProjects: vi.fn(),
    getProject: vi.fn(),
    createProject: vi.fn(),
    updateMilestone: vi.fn(),
    createScene: vi.fn(),
    updateScene: vi.fn(),
    deleteScene: vi.fn(),
    submitPlan: vi.fn(),
    createPlanReview: vi.fn(),
    decidePlanReview: vi.fn(),
    allocateQuota: vi.fn(),
    createReview: vi.fn(),
    decideReview: vi.fn(),
    listPolicies: vi.fn(),
    createAiContentLabel: vi.fn(),
    recordComplianceReview: vi.fn(),
    createCatalog: vi.fn(),
    createPublication: vi.fn(),
    publish: vi.fn(),
    listJobs: vi.fn(),
    createJob: vi.fn(),
    runJob: vi.fn(),
    retryJob: vi.fn(),
    submitScene: vi.fn(),
    createEpisodePackage: vi.fn(),
    submitEpisodePackage: vi.fn(),
    getRouting: vi.fn(),
    resolveRoute: vi.fn(),
  },
}));

const api = vi.mocked(workflowService);
const ok = <T,>(data: T) => Promise.resolve({ success: true, data });
const fail = (message: string) => Promise.resolve({ success: false, data: null as never, message });

/** Loads `project` into the store and makes every reload return it. */
function serveBackendProject(project: ApiProductionProject) {
  api.getProject.mockImplementation(() => ok(project));
  useWorkflowStore.setState({
    project: adaptApiProjectToUiProject(project),
    projects: [adaptApiProjectToUiProject(project)],
    activeProjectId: project.id,
    activePackageId: project.productionPlans?.[0]?.id ?? '',
  });
}

describe('Zustand Workflow Store (src/features/workflow/store)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWorkflowStore.setState({
      currentRole: 'creator',
      activeProjectId: 'proj-cyber-01',
      activePackageId: 'pkg-ep-03',
      project: initialProject,
      projects: mockAssignedProjects,
    });
  });

  describe('Loading projects', () => {
    it('lists projects, then loads the detail of the active one', async () => {
      const detail = apiProject([apiPlan()]);
      api.listProjects.mockReturnValue(ok({ data: [apiProject([], { productionPlans: undefined })] }));
      api.getProject.mockReturnValue(ok(detail));
      useWorkflowStore.setState({ activeProjectId: 'project-1', projects: [] });

      await useWorkflowStore.getState().loadProjects();

      const state = useWorkflowStore.getState();
      expect(api.getProject).toHaveBeenCalledWith('project-1');
      expect(state.project.episodes.map((e) => e.id)).toEqual(['plan-1']);
      expect(state.activePackageId).toBe('plan-1');
    });

    it('keeps the selected episode across reloads', async () => {
      serveBackendProject(apiProject([apiPlan(), apiPlan({ id: 'plan-2', episodeNumber: 2 })]));
      useWorkflowStore.setState({ activePackageId: 'plan-2' });

      await useWorkflowStore.getState().loadProject('project-1');
      expect(useWorkflowStore.getState().activePackageId).toBe('plan-2');
    });
  });

  describe('Maker (Creator) plan submission', () => {
    it('deletes removed scenes, saves the rest and submits the plan with their ids', async () => {
      serveBackendProject(apiProject([apiPlan()]));
      const brief = useWorkflowStore.getState().getBrief('plan-1')!;
      useWorkflowStore.getState().updateContentBrief('plan-1', {
        scene_breakdown: [brief.scene_breakdown[0], { scene_number: 2, title: 'Cảnh mới', description: 'Mới', target_duration_sec: 30, estimated_tokens: 50 }],
      });
      api.deleteScene.mockReturnValue(ok({}));
      api.updateScene.mockReturnValue(ok(apiScene(1)));
      api.createScene.mockReturnValue(ok(apiScene(3, { id: 'scene-new' })));
      api.submitPlan.mockReturnValue(ok(apiPlan({ status: 'SUBMITTED' })));

      expect(await useWorkflowStore.getState().submitProductionPlan('plan-1')).toBe(true);

      expect(api.deleteScene).toHaveBeenCalledWith('scene-2');
      expect(api.updateScene).toHaveBeenCalledWith('scene-1', expect.objectContaining({ sceneNumber: 1 }));
      expect(api.createScene).toHaveBeenCalledWith('plan-1', expect.objectContaining({ title: 'Cảnh mới' }));
      expect(api.submitPlan).toHaveBeenCalledWith(
        'plan-1',
        expect.objectContaining({
          scriptText: 'Kịch bản tổng thể',
          scenes: [
            { sceneId: 'scene-1', scriptText: 'Mô tả cảnh 1' },
            { sceneId: 'scene-new', scriptText: 'Mới' },
          ],
        })
      );
    });

    it('stops and reports failure when a scene cannot be saved', async () => {
      serveBackendProject(apiProject([apiPlan()]));
      api.updateScene.mockReturnValue(fail('Total scene duration exceeds the plan target duration'));

      expect(await useWorkflowStore.getState().submitProductionPlan('plan-1')).toBe(false);
      expect(api.submitPlan).not.toHaveBeenCalled();
    });
  });

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

  describe('Compliance & publishing (BR-42)', () => {
    const allPassed = { CONTENT_POLICY: true, LEGAL: true, COPYRIGHT: true, WATERMARK: true, REAL_PERSON_LIKENESS: true };
    const submitted = () => apiProject([apiPlan({ status: 'APPROVED', episodePackages: [apiPackage()] })]);

    it('approves the cut, labels it and records every manual check as passed', async () => {
      serveBackendProject(submitted());
      api.listPolicies.mockReturnValue(ok({ data: [{ id: 'policy-1', name: 'AI', type: 'AI_LABELING', version: '1', isActive: true }] }));
      api.createReview.mockReturnValue(ok({ id: 'review-1' }) as never);
      api.decideReview.mockReturnValue(ok({}) as never);
      api.createAiContentLabel.mockReturnValue(ok({}) as never);
      api.recordComplianceReview.mockReturnValue(ok({ verdict: 'PASS', checks: [] }) as never);

      expect(await useWorkflowStore.getState().passCompliance('plan-1', allPassed, 'INTRO_OUTRO')).toBe(true);
      expect(api.decideReview).toHaveBeenCalledWith('review-1', { decision: 'APPROVED' });
      expect(api.createAiContentLabel).toHaveBeenCalledWith('package-1', expect.objectContaining({ policyId: 'policy-1', displayLocation: 'INTRO_OUTRO' }));
      const { checks } = api.recordComplianceReview.mock.calls[0][1];
      expect(checks.map((c) => c.checkType).sort()).toEqual(['CONTENT_POLICY', 'COPYRIGHT', 'LEGAL', 'REAL_PERSON_LIKENESS', 'WATERMARK']);
      expect(checks.every((c) => c.result === 'PASS')).toBe(true);
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

  describe('Studio production (BR-40, BR-41)', () => {
    const inProduction = (jobs = [apiJob('job-1', 'scene-1')]) => {
      const quota = [{ id: 'q1', allocationType: 'INITIAL' as const, allocatedAmount: '500', remainingAmount: '400', status: 'ACTIVE' as const, createdAt: '' }];
      serveBackendProject(apiProject([apiPlan({ status: 'APPROVED', quotaAllocations: quota, _count: { generationJobs: jobs.length } })]));
      api.listJobs.mockReturnValue(ok(jobs));
    };

    it('creates and runs each draft step of a scene as a backend job', async () => {
      inProduction([]);
      const store = useWorkflowStore.getState();
      store.addGenerationStep('plan-1', 'scene-2', { function_type: 'VIDEO', prompt: 'Toàn cảnh', status: 'pending', selected_model: '', token_cost: 0 });
      store.addGenerationStep('plan-1', 'scene-2', { function_type: 'CUSTOM', custom_function: 'Lip sync', prompt: 'Khớp môi', status: 'pending', selected_model: '', token_cost: 0 });
      api.createJob.mockReturnValueOnce(ok(apiJob('new-1', 'scene-2'))).mockReturnValueOnce(ok(apiJob('new-2', 'scene-2')));
      api.runJob.mockReturnValue(ok(apiJob('x', 'scene-2')));

      expect(await useWorkflowStore.getState().triggerGenerationJob('plan-1', 'scene-2')).toBe(true);
      expect(api.createJob).toHaveBeenNthCalledWith(1, 'plan-1', { jobType: 'SCENE_VIDEO', prompt: 'Toàn cảnh', customFunction: undefined, sceneId: 'scene-2' });
      expect(api.createJob).toHaveBeenNthCalledWith(2, 'plan-1', { jobType: 'CUSTOM', prompt: 'Khớp môi', customFunction: 'Lip sync', sceneId: 'scene-2' });
      expect(api.runJob.mock.calls.map((c) => c[0])).toEqual(['new-1', 'new-2']);
      expect(useWorkflowStore.getState().getJobs('plan-1').find((j) => j.id === 'scene-2')?.generation_steps).toEqual([]);
    });

    it('regenerates the saved steps through a retry when the scene has no drafts', async () => {
      inProduction();
      await useWorkflowStore.getState().loadProject('project-1');
      api.retryJob.mockReturnValue(ok(apiJob('job-1b', 'scene-1')));
      api.runJob.mockReturnValue(ok(apiJob('job-1b', 'scene-1')));

      expect(await useWorkflowStore.getState().triggerGenerationJob('plan-1', 'scene-1')).toBe(true);
      expect(api.retryJob).toHaveBeenCalledWith('job-1');
      expect(api.runJob).toHaveBeenCalledWith('job-1b');
      expect(api.createJob).not.toHaveBeenCalled();
    });

    it('keeps draft steps across a reload and lets only drafts be edited', async () => {
      inProduction();
      await useWorkflowStore.getState().loadProject('project-1');
      const store = useWorkflowStore.getState();
      store.addGenerationStep('plan-1', 'scene-1', { function_type: 'IMAGE', prompt: 'Poster', status: 'pending', selected_model: '', token_cost: 0 });
      store.updateGenerationStep('plan-1', 'scene-1', 'job-1', { prompt: 'đổi' });

      await useWorkflowStore.getState().loadProject('project-1');
      const steps = useWorkflowStore.getState().getJobs('plan-1').find((j) => j.id === 'scene-1')!.generation_steps;
      expect(steps.map((s) => s.prompt)).toEqual(['Mô tả job-1', 'Poster']);
    });

    it('completes the unfinished scenes, assembles the package and submits it', async () => {
      inProduction();
      serveBackendProject(
        apiProject([apiPlan({ status: 'APPROVED', scenes: [apiScene(1, { status: 'COMPLETED' }), apiScene(2, { status: 'GENERATING' })] })])
      );
      api.submitScene.mockReturnValue(ok({}));
      api.createEpisodePackage.mockReturnValue(ok(apiPackage({ id: 'package-9' })));
      api.submitEpisodePackage.mockReturnValue(ok({}));

      expect(await useWorkflowStore.getState().submitEpisodePackage('plan-1')).toBe(true);
      expect(api.submitScene.mock.calls.map((c) => c[0])).toEqual(['scene-2']);
      expect(api.submitEpisodePackage).toHaveBeenCalledWith('package-9');
    });

    it('stops before assembling when a scene cannot be completed', async () => {
      inProduction();
      api.submitScene.mockReturnValue(fail('Scene must have at least one VIDEO asset to be submitted'));

      expect(await useWorkflowStore.getState().submitEpisodePackage('plan-1')).toBe(false);
      expect(api.createEpisodePackage).not.toHaveBeenCalled();
    });
  });

  describe('Project creation', () => {
    it('sends ids, every episode with its season and allotted duration, and selects the new project', async () => {
      api.createProject.mockReturnValue(ok(apiProject([], { id: 'project-new' })));
      api.listProjects.mockReturnValue(ok({ data: [apiProject([], { id: 'project-new', productionPlans: undefined })] }));
      api.getProject.mockReturnValue(ok(apiProject([apiPlan()], { id: 'project-new' })));

      const created = await useWorkflowStore.getState().createProject({
        title: 'Phim thử',
        creator_id: 'creator-1',
        genre_ids: ['genre-1'],
        subtitle_languages: ['vi', 'en'],
        synopsis: '',
        episodes: [
          { season_number: 1, duration_minutes: 20 },
          { season_number: 1, duration_minutes: 25 },
          { season_number: 2, duration_minutes: 30 },
        ],
        total_budget_tokens: 1000,
        production_start_date: '2026-10-01',
        deadline: '2026-12-01',
        planned_release_date: '2027-01-01',
      });

      expect(created).toBe(true);
      expect(api.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          assignedCreatorId: 'creator-1',
          genreIds: ['genre-1'],
          subtitleLanguages: ['vi', 'en'],
          contentType: 'SERIES',
          episodes: [
            { seasonNumber: 1, targetDurationSeconds: 1200 },
            { seasonNumber: 1, targetDurationSeconds: 1500 },
            { seasonNumber: 2, targetDurationSeconds: 1800 },
          ],
        })
      );
      expect(useWorkflowStore.getState().activeProjectId).toBe('project-new');
    });
  });

  describe('Local plan helpers', () => {
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

    it('derives the plan verdict and summarises only the flagged fields', () => {
      const { project, getBrief } = useWorkflowStore.getState();
      const brief = {
        ...getBrief('pkg-ep-03')!,
        token_review: { status: 'changes_requested' as const, comment: 'Vượt ngân sách' },
        scene_reviews: [
          { scene_number: 1, status: 'approved' as const },
          { scene_number: 2, status: 'changes_requested' as const, comment: 'Thiếu mô tả' },
        ],
      };
      expect(derivePlanVerdict(project, brief)).toBe('CHANGES_REQUESTED');
      expect(summarizeFlaggedFields(project, brief)).toBe('• Token dự toán: Vượt ngân sách\n• Phân cảnh 2: Thiếu mô tả');
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
  });

  describe('Model routing from the backend (BR-40)', () => {
    const routing = [
      { jobType: 'SCENE_VIDEO' as const, provider: 'Google', model: 'veo-3', modality: 'VIDEO', estimatedTokenCost: 60 },
      { jobType: 'CUSTOM' as const, provider: 'OpenAI', model: 'gpt', modality: 'TEXT', estimatedTokenCost: 8 },
    ];
    const draftStep = () => useWorkflowStore.getState().getJobs('plan-1').find((j) => j.id === 'scene-1')!.generation_steps[0];

    beforeEach(() => {
      serveBackendProject(apiProject([apiPlan({ status: 'APPROVED' })]));
      useWorkflowStore.setState({ routing });
      useWorkflowStore.getState().addGenerationStep('plan-1', 'scene-1', { function_type: 'VIDEO', prompt: 'x', status: 'pending', selected_model: '', token_cost: 0 });
    });

    it('takes a built-in function’s model and estimate from the routing table', async () => {
      expect(routeDefaults(routing, { function_type: 'VIDEO' })).toEqual({ selected_model: 'veo-3', token_cost: 60, model_match: 'catalog' });
      await useWorkflowStore.getState().routeStep('plan-1', 'scene-1', draftStep().id, { function_type: 'VIDEO' });
      expect(api.resolveRoute).not.toHaveBeenCalled();
    });

    it('waits on an undescribed custom function, then asks the backend for its specialist', async () => {
      const id = draftStep().id;
      await useWorkflowStore.getState().routeStep('plan-1', 'scene-1', id, { function_type: 'CUSTOM', custom_function: '  ' });
      expect(draftStep()).toMatchObject({ model_match: 'pending', token_cost: 0 });
      expect(api.resolveRoute).not.toHaveBeenCalled();

      api.resolveRoute.mockReturnValue(ok({ ...routing[0], jobType: 'CUSTOM', match: 'specialist' }));
      await useWorkflowStore.getState().routeStep('plan-1', 'scene-1', id, { function_type: 'CUSTOM', custom_function: 'Đồng bộ khẩu hình' });
      expect(api.resolveRoute).toHaveBeenCalledWith('CUSTOM', 'Đồng bộ khẩu hình');
      expect(draftStep()).toMatchObject({ selected_model: 'veo-3', token_cost: 60, model_match: 'specialist' });
    });

    it('ignores a route that arrives after the description changed', async () => {
      const id = draftStep().id;
      api.resolveRoute.mockImplementation(() => {
        useWorkflowStore.getState().updateGenerationStep('plan-1', 'scene-1', id, { custom_function: 'mô tả mới' });
        return ok({ ...routing[0], jobType: 'CUSTOM', match: 'specialist' });
      });
      await useWorkflowStore.getState().routeStep('plan-1', 'scene-1', id, { function_type: 'CUSTOM', custom_function: 'cũ' });
      expect(draftStep()).toMatchObject({ model_match: 'pending', selected_model: '' });
    });
  });
});
