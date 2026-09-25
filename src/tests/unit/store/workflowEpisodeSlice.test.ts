import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { availableBudget, derivePlanVerdict, summarizeFlaggedFields } from '@/features/workflow/lib/planVerdict';
import { creatorGroups, reviewerGroups } from '@/features/workflow/lib/projectGroups';
import { apiPlan, apiProject, apiScene } from '@/tests/fixtures/workflowApiFixtures';
import { api, fail, ok, resetWorkflowStore, serveBackendProject } from '@/tests/support/workflowStoreHarness';

vi.mock('@/services/workflowService', () => import('@/tests/support/workflowServiceMock'));

describe('Workflow store — projects, plans and milestones', () => {
  beforeEach(resetWorkflowStore);

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
    it('saves the whole plan in one request, then submits it with the scene ids the server gave', async () => {
      serveBackendProject(apiProject([apiPlan()]));
      const brief = useWorkflowStore.getState().getBrief('plan-1')!;
      useWorkflowStore.getState().updateContentBrief('plan-1', {
        scene_breakdown: [brief.scene_breakdown[0], { scene_number: 2, title: 'Cảnh mới', description: 'Mới', target_duration_sec: 30, estimated_tokens: 50 }],
      });
      api.savePlanDraft.mockReturnValue(ok([apiScene(1), apiScene(2, { id: 'scene-new' })]));
      api.submitPlan.mockReturnValue(ok(apiPlan({ status: 'SUBMITTED' })));

      expect(await useWorkflowStore.getState().submitProductionPlan('plan-1')).toBe(true);

      expect(api.savePlanDraft).toHaveBeenCalledTimes(1);
      expect(api.savePlanDraft).toHaveBeenCalledWith(
        'plan-1',
        expect.objectContaining({
          scenes: [
            expect.objectContaining({ id: 'scene-1', sceneNumber: 1 }),
            expect.objectContaining({ id: undefined, sceneNumber: 2, title: 'Cảnh mới' }),
          ],
        })
      );
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

    it('stops and reports failure when the plan cannot be saved', async () => {
      serveBackendProject(apiProject([apiPlan()]));
      api.savePlanDraft.mockReturnValue(fail('Only a DRAFT or CHANGES_REQUESTED plan can be edited'));

      expect(await useWorkflowStore.getState().submitProductionPlan('plan-1')).toBe(false);
      expect(api.submitPlan).not.toHaveBeenCalled();
    });

    it('saves a draft without submitting it, taking back the new scene ids', async () => {
      serveBackendProject(apiProject([apiPlan()]));
      const brief = useWorkflowStore.getState().getBrief('plan-1')!;
      useWorkflowStore.getState().updateContentBrief('plan-1', {
        target_duration_minutes: 12,
        scene_breakdown: [...brief.scene_breakdown, { scene_number: 3, title: 'Cảnh mới', description: '', target_duration_sec: 20, estimated_tokens: 40 }],
        has_unsaved_changes: true,
      });
      api.savePlanDraft.mockReturnValue(ok([apiScene(1), apiScene(2), apiScene(3, { id: 'scene-new' })]));

      expect(await useWorkflowStore.getState().savePlanDraft('plan-1')).toBe(true);

      expect(api.savePlanDraft).toHaveBeenCalledWith(
        'plan-1',
        expect.objectContaining({ scriptText: 'Kịch bản tổng thể', targetDurationSeconds: 720, estimatedAiResourceUsage: brief.estimated_tokens })
      );
      expect(api.submitPlan).not.toHaveBeenCalled();
      const saved = useWorkflowStore.getState().getBrief('plan-1')!;
      expect(saved.scene_breakdown.at(-1)!.id).toBe('scene-new');
      expect(saved.has_unsaved_changes).toBe(false);
    });

    it('keeps unsaved edits of an episode when the project reloads', async () => {
      serveBackendProject(apiProject([apiPlan(), apiPlan({ id: 'plan-2', episodeNumber: 2 })]));
      useWorkflowStore.getState().updateContentBrief('plan-2', { target_duration_minutes: 7, script_text: 'Bản đang viết', has_unsaved_changes: true });

      await useWorkflowStore.getState().loadProject('project-1');

      const state = useWorkflowStore.getState();
      expect(state.getBrief('plan-2')!.target_duration_minutes).toBe(7);
      expect(state.getBrief('plan-2')!.script_text).toBe('Bản đang viết');
      expect(state.getBrief('plan-1')!.script_text).toBe('Kịch bản tổng thể');
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
    it('keeps a separate script for every episode and sends each plan its own', async () => {
      serveBackendProject(apiProject([apiPlan(), apiPlan({ id: 'plan-2', episodeNumber: 2, scriptText: 'Tập 2 cũ' })]));
      useWorkflowStore.getState().updateContentBrief('plan-2', { script_text: 'Tập 2 mới' });
      api.savePlanDraft.mockReturnValue(ok([]));

      await useWorkflowStore.getState().savePlanDraft('plan-2');

      expect(useWorkflowStore.getState().getBrief('plan-1')!.script_text).toBe('Kịch bản tổng thể');
      expect(api.savePlanDraft).toHaveBeenCalledWith('plan-2', expect.objectContaining({ scriptText: 'Tập 2 mới' }));
    });

    it('computes the available project budget from allocated tokens', () => {
      expect(availableBudget(useWorkflowStore.getState().project)).toBe(3000 - 900);
    });

    it('derives the plan verdict and summarises only the flagged fields', () => {
      const { getBrief } = useWorkflowStore.getState();
      const brief = {
        ...getBrief('pkg-ep-03')!,
        token_review: { status: 'changes_requested' as const, comment: 'Vượt ngân sách' },
        scene_reviews: [
          { scene_number: 1, status: 'approved' as const },
          { scene_number: 2, status: 'changes_requested' as const, comment: 'Thiếu mô tả' },
        ],
      };
      expect(derivePlanVerdict(brief)).toBe('CHANGES_REQUESTED');
      expect(summarizeFlaggedFields(brief)).toBe('• Token dự tính: Vượt ngân sách\n• Cảnh 2: Thiếu mô tả');
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
});
