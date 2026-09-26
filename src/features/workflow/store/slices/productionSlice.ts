import type { StateCreator } from 'zustand';
import type { ProductionSlice, WorkflowStoreState } from '../types';
import { toast } from '@/components/ui/Toast';
import { workflowService } from '@/services/workflowService';
import { buildSceneJobs, isDraftStep, JOB_TYPE_OF } from '@/features/workflow/lib/jobAdapter';
import { routeDefaults } from '@/features/workflow/lib/modelRouting';
import { withProjectUpdate } from './projectRoster';
import { apiResult } from './apiResult';
import { waitForJob } from '@/features/workflow/lib/jobPolling';
import type { ApiGenerationJob } from '@/types/workflow';

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

  /** Starts a job; a queued one is collected so every started job can be awaited together. */
  const start = async (job: ApiGenerationJob | null, started: ApiGenerationJob[]) => {
    const running = job && (await apiResult(workflowService.runJob(job.id), 'Tạo nội dung thất bại'));
    if (running) started.push(running);
    return Boolean(running);
  };

  /** Waits for every started job; true unless one of them failed. */
  const finish = async (started: ApiGenerationJob[]) => {
    const done = await Promise.all(started.map((job) => waitForJob(job)));
    const failed = done.filter((job) => job.status === 'FAILED');
    if (failed.length > 0) toast.error('Tạo nội dung thất bại', failed[0].errorMessage ?? 'Dịch vụ AI không trả kết quả.');
    return failed.length === 0;
  };

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
      const started: ApiGenerationJob[] = [];
      if (drafts.length > 0) {
        for (const step of drafts) {
          const job = await apiResult(
            workflowService.createJob(packageId, {
              jobType: JOB_TYPE_OF[step.function_type],
              prompt: step.prompt,
              customFunction: step.function_type === 'CUSTOM' ? step.custom_function : undefined,
              sceneId: row.scene_id,
            }),
            'Không tạo được yêu cầu'
          );
          if (!(await start(job, started))) {
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
          if (!(await start(job, started))) {
            ok = false;
            break;
          }
        }
      }

      ok = (await finish(started)) && ok;
      await reload();
      return ok;
    },

    regenerateStep: async (packageId, sceneJobId, stepId, prompt) => {
      markGenerating(packageId, sceneJobId);
      const job = await apiResult(workflowService.retryJob(stepId, prompt.trim()), 'Không tạo lại được');
      const started: ApiGenerationJob[] = [];
      const ok = (await start(job, started)) && (await finish(started));
      await reload();
      return ok;
    },

    discardStep: async (packageId, sceneJobId, stepId) => {
      const ok = (await apiResult(workflowService.discardJob(stepId), 'Không xóa được mục này')) !== null;
      if (ok) await get().loadJobs(packageId);
      return ok;
    },

    updateSceneDirection: async (sceneId, data) => {
      const ok = (await apiResult(workflowService.updateSceneDirection(sceneId, data), 'Không lưu được cảnh')) !== null;
      if (ok) await reload();
      return ok;
    },

    resetScene: async (sceneId) => {
      const ok = (await apiResult(workflowService.resetScene(sceneId), 'Không làm lại được cảnh')) !== null;
      if (ok) await reload();
      return ok;
    },

    submitEpisodePackage: async (packageId) => {
      const pkg = get().getPackage(packageId);
      if (!pkg) return false;

      const detail = await apiResult(workflowService.getProject(pkg.project_id), 'Không tải được kế hoạch');
      const scenes = detail?.productionPlans?.find((p) => p.id === packageId)?.scenes;
      if (!scenes) return false;

      for (const scene of scenes.filter((s) => s.status !== 'COMPLETED')) {
        if ((await apiResult(workflowService.submitScene(scene.id), `Cảnh ${scene.sceneNumber} chưa tạo xong`)) === null) {
          await reload();
          return false;
        }
      }

      const assembled = await apiResult(workflowService.createEpisodePackage(packageId), 'Không đóng gói được tập phim');
      const submitted = assembled && (await apiResult(workflowService.submitEpisodePackage(assembled.id), 'Không gửi được bản dựng'));
      await reload();
      return Boolean(submitted);
    },
  };
};
