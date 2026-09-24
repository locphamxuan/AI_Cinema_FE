import type { StateCreator } from 'zustand';
import type { ProductionSlice, WorkflowStoreState } from '../types';
import { toast } from '@/components/ui/Toast';
import { workflowService } from '@/services/workflowService';
import { buildSceneJobs, isDraftStep, JOB_TYPE_OF } from '@/features/workflow/lib/jobAdapter';
import { routeDefaults } from '@/features/workflow/lib/modelRouting';
import { withProjectUpdate } from './projectRoster';
import { apiResult } from './apiResult';

export const createProductionSlice: StateCreator<WorkflowStoreState, [], [], ProductionSlice> = (set, get) => {
  const reload = () => get().loadProject(get().activeProjectId);

  /** Marks a scene row as generating while its jobs run. */
  const markGenerating = (packageId: string, sceneJobId: string) =>
    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        episodes: project.episodes.map((ep) =>
          ep.id !== packageId ? ep : { ...ep, jobs: ep.jobs.map((j) => (j.id === sceneJobId ? { ...j, status: 'processing' } : j)) }
        ),
      }))
    );

  return {
    routing: [],

    loadRouting: async () => {
      if (get().routing.length > 0) return;
      const res = await workflowService.getRouting();
      if (res.success) set({ routing: res.data });
    },

    routeStep: async (packageId, sceneJobId, stepId, change) => {
      get().updateGenerationStep(packageId, sceneJobId, stepId, { ...change, ...routeDefaults(get().routing, change) });
      const described = change.function_type === 'CUSTOM' ? change.custom_function?.trim() : '';
      if (!described) return;

      const res = await workflowService.resolveRoute('CUSTOM', described);
      if (!res.success) return;
      const step = get().getJobs(packageId).find((j) => j.id === sceneJobId)?.generation_steps.find((s) => s.id === stepId);
      // A newer description replaced this one while the request was in flight.
      if (step?.function_type !== 'CUSTOM' || step.custom_function?.trim() !== described) return;
      get().updateGenerationStep(packageId, sceneJobId, stepId, {
        selected_model: res.data.model,
        token_cost: res.data.estimatedTokenCost,
        model_match: res.data.match,
      });
    },

    loadJobs: async (packageId) => {
      const res = await workflowService.listJobs(packageId);
      if (!res.success) return;
      set((state) =>
        withProjectUpdate(state, (project) => ({
          ...project,
          episodes: project.episodes.map((ep) => (ep.id === packageId ? { ...ep, ...buildSceneJobs(ep, res.data, ep.jobs) } : ep)),
        }))
      );
    },

    triggerGenerationJob: async (packageId, sceneJobId) => {
      const row = get().getJobs(packageId).find((j) => j.id === sceneJobId);
      if (!row) return false;

      // A custom step needs its function described before the backend can route it.
      const drafts = row.generation_steps.filter(
        (s) => isDraftStep(s) && s.prompt.trim() && (s.function_type !== 'CUSTOM' || s.custom_function?.trim())
      );
      const saved = row.generation_steps.filter((s) => !isDraftStep(s));
      if (drafts.length === 0 && saved.length === 0) {
        toast.warning('Chưa có nội dung', 'Thêm ít nhất một mục có mô tả trước khi tạo clip.');
        return false;
      }

      markGenerating(packageId, sceneJobId);
      let ok = true;
      if (drafts.length > 0) {
        for (const step of drafts) {
          const job = await apiResult(
            workflowService.createJob(packageId, {
              jobType: JOB_TYPE_OF[step.function_type],
              prompt: step.prompt,
              customFunction: step.function_type === 'CUSTOM' ? step.custom_function : undefined,
              sceneId: row.scene_id,
            }),
            'Không tạo được yêu cầu sinh'
          );
          if (!job || !(await apiResult(workflowService.runJob(job.id), 'Sinh nội dung thất bại'))) {
            ok = false;
            break;
          }
          // The step is now a backend job; drop the draft so a reload does not show it twice.
          get().removeGenerationStep(packageId, sceneJobId, step.id);
        }
      } else {
        // Regenerating: a new attempt of every saved step, charged again (BR-41).
        for (const step of saved) {
          const job = await apiResult(workflowService.retryJob(step.id), 'Không tạo lại được');
          if (!job || !(await apiResult(workflowService.runJob(job.id), 'Sinh nội dung thất bại'))) {
            ok = false;
            break;
          }
        }
      }

      await reload();
      return ok;
    },

    submitEpisodePackage: async (packageId) => {
      const pkg = get().getPackage(packageId);
      if (!pkg) return false;

      const detail = await apiResult(workflowService.getProject(pkg.project_id), 'Không tải được kế hoạch');
      const scenes = detail?.productionPlans?.find((p) => p.id === packageId)?.scenes;
      if (!scenes) return false;

      for (const scene of scenes.filter((s) => s.status !== 'COMPLETED')) {
        if ((await apiResult(workflowService.submitScene(scene.id), `Phân cảnh ${scene.sceneNumber} chưa sẵn sàng`)) === null) {
          await reload();
          return false;
        }
      }

      const assembled = await apiResult(workflowService.createEpisodePackage(packageId), 'Không đóng gói được tập phim');
      const submitted = assembled && (await apiResult(workflowService.submitEpisodePackage(assembled.id), 'Không nộp được bản dựng'));
      await reload();
      return Boolean(submitted);
    },
  };
};
