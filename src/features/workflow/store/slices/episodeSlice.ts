import type { StateCreator } from 'zustand';
import type { EpisodePackage, ProductionProject, SceneBreakdownItem } from '@/types/workflow';
import { PENDING_FIELD_REVIEW } from '@/types/workflow';
import { EMPTY_PROJECT } from '@/features/workflow/lib/emptyProject';
import type { EpisodeSlice, WorkflowStoreState } from '../types';
import { withProjectUpdate } from './projectRoster';
import { workflowService } from '@/services/workflowService';
import { adaptApiProjectToUiProject } from '@/features/workflow/lib/apiAdapter';
import { buildSceneJobs, draftStepId, isDraftStep } from '@/features/workflow/lib/jobAdapter';
import { apiResult } from './apiResult';
import { isPlanApproved } from '@/features/workflow/lib/workflowState';

/** Episodes whose plan has gone past quota allocation can hold generation jobs. */

/** Fills each episode's scene rows with its backend jobs, keeping the Creator's draft steps. */
async function withJobs(project: ProductionProject, previous: ProductionProject | undefined): Promise<ProductionProject> {
  const episodes = await Promise.all(
    project.episodes.map(async (episode) => {
      const previousRows = previous?.episodes.find((e) => e.id === episode.id)?.jobs;
      const res = isPlanApproved(episode.status) ? await workflowService.listJobs(episode.id) : null;
      return { ...episode, ...buildSceneJobs(episode, res?.success ? res.data : [], previousRows) };
    })
  );
  return { ...project, episodes };
}

/**
 * Reloading the project must not wipe what the Creator typed but has not saved yet
 * (another episode, or the overall script): those briefs are carried over.
 */
function keepUnsavedDrafts(project: ProductionProject, previous: ProductionProject | undefined): ProductionProject {
  if (!previous) return project;
  const unsaved = new Map(previous.episodes.filter((e) => e.brief.has_unsaved_changes).map((e) => [e.id, e.brief]));
  if (unsaved.size === 0) return project;
  return {
    ...project,
    overall_script: previous.overall_script,
    episodes: project.episodes.map((e) => (unsaved.has(e.id) ? { ...e, brief: unsaved.get(e.id)! } : e)),
  };
}

const MILESTONE_STATUS = { pending: 'PLANNED', in_progress: 'IN_PROGRESS', completed: 'COMPLETED' } as const;

/**
 * Writes the draft's scenes to the plan: removed ones are deleted, the rest
 * updated or created. Returns the scenes with their server ids, in order.
 */
async function syncScenes(pkg: EpisodePackage): Promise<SceneBreakdownItem[] | null> {
  const project = await apiResult(workflowService.getProject(pkg.project_id), 'Không tải được kế hoạch');
  const saved = project?.productionPlans?.find((p) => p.id === pkg.id)?.scenes;
  if (!saved) return null;

  const kept = new Set(pkg.brief.scene_breakdown.map((s) => s.id));
  for (const scene of saved.filter((s) => !kept.has(s.id))) {
    if ((await apiResult(workflowService.deleteScene(scene.id), 'Không xoá được cảnh')) === null) return null;
  }

  const synced: SceneBreakdownItem[] = [];
  for (const s of pkg.brief.scene_breakdown) {
    const dto = {
      sceneNumber: s.scene_number,
      title: s.title,
      description: s.description,
      scriptText: s.description,
      targetDurationSeconds: s.target_duration_sec,
      estimatedTokens: s.estimated_tokens,
    };
    const scene = await apiResult(
      s.id ? workflowService.updateScene(s.id, dto) : workflowService.createScene(pkg.id, dto),
      `Không lưu được cảnh ${s.scene_number}`
    );
    if (!scene) return null;
    synced.push({ ...s, id: scene.id });
  }
  return synced;
}

/** Saves the scenes, then submits the plan with the overall script (BR-39). */
async function saveAndSubmitPlan(pkg: EpisodePackage, overallScript: string): Promise<boolean> {
  const scenes = await syncScenes(pkg);
  if (!scenes) return false;
  const submitted = await apiResult(
    workflowService.submitPlan(pkg.id, {
      scriptText: overallScript,
      targetDurationSeconds: pkg.brief.target_duration_minutes * 60,
      estimatedAiResourceUsage: pkg.brief.estimated_tokens,
      scenes: scenes.map((s) => ({ sceneId: s.id!, scriptText: s.description })),
    }),
    'Không gửi được kế hoạch'
  );
  return submitted !== null;
}

export const createEpisodeSlice: StateCreator<WorkflowStoreState, [], [], EpisodeSlice> = (set, get) => ({
  project: EMPTY_PROJECT,
  projects: [],
  isLoading: false,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    const res = await workflowService.listProjects();
    if (!res.success) {
      set({ isLoading: false, error: res.message ?? 'Lỗi tải dự án' });
      return;
    }
    // The list carries no plans; keep the episodes already loaded for each project.
    const loaded = new Map(get().projects.map((p) => [p.id, p]));
    const projects = res.data.data.map((api) => {
      const adapted = adaptApiProjectToUiProject(api);
      return { ...adapted, episodes: loaded.get(adapted.id)?.episodes ?? [] };
    });
    const active = projects.find((p) => p.id === get().activeProjectId) ?? projects[0];
    set({ projects, isLoading: false });
    if (active) {
      await get().loadProject(active.id);
    } else {
      set({ project: EMPTY_PROJECT, activeProjectId: '', activePackageId: '' });
    }
  },

  loadProject: async (projectId: string) => {
    if (!projectId) return;
    set({ isLoading: true, error: null });
    const res = await workflowService.getProject(projectId);
    if (!res.success) {
      set({ isLoading: false, error: res.message ?? 'Lỗi tải chi tiết dự án' });
      return;
    }
    const previous = get().projects.find((p) => p.id === projectId);
    const adapted = keepUnsavedDrafts(await withJobs(adaptApiProjectToUiProject(res.data), previous), previous);
    set((state) => {
      const keepPackage = adapted.episodes.some((e) => e.id === state.activePackageId);
      const known = state.projects.some((p) => p.id === adapted.id);
      return {
        isLoading: false,
        project: adapted,
        activeProjectId: adapted.id,
        activePackageId: keepPackage ? state.activePackageId : adapted.episodes[0]?.id ?? '',
        projects: known ? state.projects.map((p) => (p.id === adapted.id ? adapted : p)) : [adapted, ...state.projects],
      };
    });
  },

  getPackage: (packageId) => {
    const id = packageId || get().activePackageId;
    return get().project.episodes.find((ep) => ep.id === id) || get().project.episodes[0];
  },

  getBrief: (packageId) => {
    const pkg = get().getPackage(packageId);
    return pkg?.brief;
  },

  getJobs: (packageId) => {
    const pkg = get().getPackage(packageId);
    return pkg?.jobs || [];
  },

  updateContentBrief: (packageId, briefData) => {
    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        updated_at: new Date().toISOString(),
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            brief: {
              ...ep.brief,
              ...briefData,
              updated_at: new Date().toISOString(),
            },
          };
        }),
      }))
    );
  },

  submitProductionPlan: async (packageId) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return false;
    const ok = await saveAndSubmitPlan(pkg, get().project.overall_script);
    // A sent plan is on the server now: the reload must show it, not the local draft.
    if (ok) get().updateContentBrief(packageId, { has_unsaved_changes: false });
    await get().loadProject(get().activeProjectId);
    return ok;
  },

  savePlanDraft: async (packageId) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return false;
    const scenes = await syncScenes(pkg);
    if (!scenes) return false;
    const saved = await apiResult(
      workflowService.updatePlan(pkg.id, {
        scriptText: get().project.overall_script,
        targetDurationSeconds: pkg.brief.target_duration_minutes * 60,
        estimatedAiResourceUsage: pkg.brief.estimated_tokens,
      }),
      'Không lưu được bản nháp'
    );
    if (!saved) return false;
    // Only the server ids are taken back: whatever was typed while saving stays.
    const ids = new Map(scenes.map((s) => [s.scene_number, s.id]));
    const current = get().getPackage(packageId)!.brief;
    get().updateContentBrief(packageId, {
      scene_breakdown: current.scene_breakdown.map((s) => ({ ...s, id: s.id ?? ids.get(s.scene_number) })),
      has_unsaved_changes: current.updated_at !== pkg.brief.updated_at,
    });
    return true;
  },

  updateOverallScript: (script) => {
    set((state) =>
      withProjectUpdate(state, (project) => {
        if (script === project.overall_script) return project;
        return {
          ...project,
          overall_script: script,
          script_review: PENDING_FIELD_REVIEW,
          updated_at: new Date().toISOString(),
        };
      })
    );
  },

  addGenerationStep: (packageId, jobId, step) => {
    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            jobs: ep.jobs.map((j) =>
              j.id !== jobId
                ? j
                : {
                    ...j,
                    generation_steps: [...j.generation_steps, { ...step, id: draftStepId() }],
                    updated_at: new Date().toISOString(),
                  }
            ),
          };
        }),
      }))
    );
  },

  updateGenerationStep: (packageId, jobId, stepId, data) => {
    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            jobs: ep.jobs.map((j) =>
              j.id !== jobId
                ? j
                : {
                    ...j,
                    generation_steps: j.generation_steps.map((s) => (s.id === stepId && isDraftStep(s) ? { ...s, ...data } : s)),
                    updated_at: new Date().toISOString(),
                  }
            ),
          };
        }),
      }))
    );
  },

  removeGenerationStep: (packageId, jobId, stepId) => {
    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            jobs: ep.jobs.map((j) =>
              j.id !== jobId ? j : { ...j, generation_steps: j.generation_steps.filter((s) => s.id !== stepId || !isDraftStep(s)) }
            ),
          };
        }),
      }))
    );
  },

  createProject: async (data) => {
    const created = await apiResult(
      workflowService.createProject({
        title: data.title,
        description: data.synopsis,
        contentType: data.episodes.length > 1 ? 'SERIES' : 'MOVIE',
        totalAiQuotaBudget: data.total_budget_tokens,
        productionStartDate: data.production_start_date,
        deadline: data.deadline,
        plannedReleaseDate: data.planned_release_date,
        episodes: data.episodes.map((e) => ({ seasonNumber: e.season_number, targetDurationSeconds: e.duration_minutes * 60 })),
        assignedCreatorId: data.creator_id,
        genreIds: data.genre_ids,
        subtitleLanguages: data.subtitle_languages,
        milestones: (data.milestones ?? []).map((m) => ({
          title: m.title,
          description: m.description,
          startDate: m.startDate || undefined,
          targetDate: m.deadline || undefined,
        })),
      }),
      'Không tạo được dự án'
    );
    if (!created) return false;
    set({ activeProjectId: created.id, activePackageId: '' });
    await get().loadProjects();
    return true;
  },

  updateMilestoneStatus: async (milestoneId, status, result) => {
    const updated = await apiResult(
      workflowService.updateMilestone(milestoneId, { status: MILESTONE_STATUS[status], resultText: result }),
      'Không cập nhật được cột mốc'
    );
    if (!updated) return false;
    await get().loadProject(get().activeProjectId);
    return true;
  },
});
