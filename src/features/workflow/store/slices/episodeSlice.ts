import type { StateCreator } from 'zustand';
import type { EpisodePackage, ProductionProject } from '@/types/workflow';
import { PENDING_FIELD_REVIEW } from '@/types/workflow';
import { EMPTY_PROJECT } from '@/features/workflow/lib/emptyProject';
import type { EpisodeSlice, WorkflowStoreState } from '../types';
import { withProjectUpdate } from './projectRoster';
import { workflowService } from '@/services/workflowService';
import { adaptApiProjectToUiProject } from '@/features/workflow/lib/apiAdapter';
import { buildSceneJobs, draftStepId, isDraftStep } from '@/features/workflow/lib/jobAdapter';
import { apiResult } from './apiResult';

/** Episodes whose plan has gone past quota allocation can hold generation jobs. */
const HAS_JOBS = new Set(['IN_PRODUCTION', 'EPISODE_SUBMITTED', 'CHANGES_REQUESTED', 'COMPLIANCE_PASSED', 'PUBLISHED']);

/** Fills each episode's scene rows with its backend jobs, keeping the Creator's draft steps. */
async function withJobs(project: ProductionProject, previous: ProductionProject | undefined): Promise<ProductionProject> {
  const episodes = await Promise.all(
    project.episodes.map(async (episode) => {
      const previousRows = previous?.episodes.find((e) => e.id === episode.id)?.jobs;
      const res = HAS_JOBS.has(episode.status) ? await workflowService.listJobs(episode.id) : null;
      return { ...episode, ...buildSceneJobs(episode, res?.success ? res.data : [], previousRows) };
    })
  );
  return { ...project, episodes };
}

const MILESTONE_STATUS = { pending: 'PLANNED', in_progress: 'IN_PROGRESS', completed: 'COMPLETED' } as const;

/**
 * Saves the draft's scenes to the plan (removed ones deleted, the rest updated
 * or created), then submits the plan with the overall script (BR-39).
 */
async function saveAndSubmitPlan(pkg: EpisodePackage, overallScript: string): Promise<boolean> {
  const brief = pkg.brief;
  const project = await apiResult(workflowService.getProject(pkg.project_id), 'Không tải được kế hoạch');
  const saved = project?.productionPlans?.find((p) => p.id === pkg.id)?.scenes;
  if (!saved) return false;

  const kept = new Set(brief.scene_breakdown.map((s) => s.id));
  for (const scene of saved.filter((s) => !kept.has(s.id))) {
    if ((await apiResult(workflowService.deleteScene(scene.id), 'Không xoá được phân cảnh')) === null) return false;
  }

  const scenes: { sceneId: string; scriptText: string }[] = [];
  for (const s of brief.scene_breakdown) {
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
      `Không lưu được phân cảnh ${s.scene_number}`
    );
    if (!scene) return false;
    scenes.push({ sceneId: scene.id, scriptText: s.description });
  }

  const submitted = await apiResult(
    workflowService.submitPlan(pkg.id, {
      scriptText: overallScript,
      productionApproach: brief.production_approach,
      targetDurationSeconds: brief.target_duration_minutes * 60,
      estimatedAiResourceUsage: brief.estimated_tokens,
      scenes,
    }),
    'Không nộp được kế hoạch'
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
    const adapted = await withJobs(adaptApiProjectToUiProject(res.data), previous);
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
    await get().loadProject(get().activeProjectId);
    return ok;
  },

  reviseProductionPlan: async (packageId, updatedBrief) => {
    get().updateContentBrief(packageId, updatedBrief);
    return get().submitProductionPlan(packageId);
  },

  updateOverallScript: (script) => {
    set((state) =>
      withProjectUpdate(state, (project) => {
        if (script === project.overall_script) return project;
        return {
          ...project,
          overall_script: script,
          script_version: project.script_version + 1,
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

  setActiveMilestone: (milestoneId) => {
    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        active_milestone_id: milestoneId,
        updated_at: new Date().toISOString(),
      }))
    );
  },

  updateMilestoneStatus: async (milestoneId, status) => {
    const updated = await apiResult(
      workflowService.updateMilestone(milestoneId, { status: MILESTONE_STATUS[status] }),
      'Không cập nhật được cột mốc'
    );
    if (!updated) return false;
    await get().loadProject(get().activeProjectId);
    return true;
  },
});
