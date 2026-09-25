import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { routeDefaults } from '@/features/workflow/lib/modelRouting';
import { apiJob, apiPackage, apiPlan, apiProject, apiScene } from '@/tests/fixtures/workflowApiFixtures';
import { api, fail, ok, resetWorkflowStore, serveBackendProject } from '@/tests/support/workflowStoreHarness';

vi.mock('@/services/workflowService', () => import('@/tests/support/workflowServiceMock'));

describe('Workflow store — studio production', () => {
  beforeEach(resetWorkflowStore);

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
