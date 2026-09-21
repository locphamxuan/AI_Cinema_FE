import type { StateCreator } from 'zustand';
import { EpisodePackage, ProductionProject, PENDING_FIELD_REVIEW } from '@/types/workflow';
import { initialProject, mockAssignedProjects } from '@/features/workflow/mocks/workflowMock';
import type { EpisodeSlice, WorkflowStoreState } from '../types';
import { pendingPlanReviews } from '@/features/workflow/lib/planVerdict';
import { withProjectUpdate } from './projectRoster';

function buildBlankEpisode(projectId: string, episodeNumber: number, seasonNumber: number, targetDurationMinutes: number): EpisodePackage {
  const now = new Date().toISOString();
  const episodeId = `pkg-${projectId}-${episodeNumber}`;
  return {
    id: episodeId,
    project_id: projectId,
    episode_number: episodeNumber,
    season_number: seasonNumber,
    title: `Tập ${episodeNumber}: Chưa đặt tên`,
    target_duration_minutes: targetDurationMinutes,
    status: 'PLAN_DRAFT',
    total_duration: '',
    actual_tokens_used: 0,
    quota_allocated: 0,
    video_draft_url: '',
    thumbnail_url: '',
    brief: {
      id: `brief-${episodeId}`,
      project_id: projectId,
      episode_id: episodeId,
      title: `Tập ${episodeNumber}: Chưa đặt tên`,
      scene_count: 0,
      target_duration_minutes: targetDurationMinutes,
      estimated_tokens: 0,
      production_approach: '',
      storyboard_summary: '',
      scene_breakdown: [],
      ...pendingPlanReviews([]),
      status: 'PLAN_DRAFT',
      created_at: now,
      updated_at: now,
    },
    jobs: [],
    assets: [],
    created_at: now,
    updated_at: now,
  };
}

export const createEpisodeSlice: StateCreator<WorkflowStoreState, [], [], EpisodeSlice> = (set, get) => ({
  project: initialProject,
  projects: mockAssignedProjects,

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

  submitProductionPlan: (packageId) => {
    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        overall_status: 'PENDING_REVIEW',
        updated_at: new Date().toISOString(),
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'PLAN_PENDING',
            brief: {
              ...ep.brief,
              status: 'PLAN_PENDING',
              ...pendingPlanReviews(ep.brief.scene_breakdown),
              updated_at: new Date().toISOString(),
            },
          };
        }),
      }))
    );
  },

  reviseProductionPlan: (packageId, updatedBrief) => {
    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        overall_status: 'PENDING_REVIEW',
        updated_at: new Date().toISOString(),
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          const scenes = updatedBrief.scene_breakdown || ep.brief.scene_breakdown;
          return {
            ...ep,
            status: 'PLAN_PENDING',
            brief: {
              ...ep.brief,
              ...updatedBrief,
              status: 'PLAN_PENDING',
              ...pendingPlanReviews(scenes),
              updated_at: new Date().toISOString(),
            },
          };
        }),
      }))
    );
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

  addSceneJob: (packageId, sceneData) => {
    const newJobId = `job-${Date.now()}`;
    const newJob = {
      ...sceneData,
      id: newJobId,
      status: 'pending' as const,
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            jobs: [...ep.jobs, newJob],
          };
        }),
      }))
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
                    generation_steps: [...j.generation_steps, { ...step, id: `step-${Date.now()}` }],
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
                    generation_steps: j.generation_steps.map((s) => (s.id === stepId ? { ...s, ...data } : s)),
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
              j.id !== jobId ? j : { ...j, generation_steps: j.generation_steps.filter((s) => s.id !== stepId) }
            ),
          };
        }),
      }))
    );
  },

  removeSceneJob: (packageId, jobId) => {
    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            jobs: ep.jobs.filter((j) => j.id !== jobId),
            assets: ep.assets.filter((a) => a.job_id !== jobId),
          };
        }),
      }))
    );
  },

  submitEpisodePackage: (packageId) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return false;

    const uncompleted = pkg.jobs.filter((j) => j.status !== 'completed');
    if (uncompleted.length > 0) {
      alert(`Còn ${uncompleted.length} phân cảnh chưa render hoàn tất. Vui lòng sinh xong clip trước khi submit!`);
      return false;
    }

    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        updated_at: new Date().toISOString(),
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'EPISODE_SUBMITTED',
            video_draft_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            updated_at: new Date().toISOString(),
          };
        }),
      }))
    );

    return true;
  },

  createProject: (data) => {
    const milestones = data.milestones && data.milestones.length > 0 ? data.milestones : [
      {
        id: `ms-1-${Date.now()}`,
        title: 'Khởi tạo kịch bản & phân cảnh',
        deadline: data.deadline,
        description: 'Tạo bản thảo kịch bản chi tiết và danh sách cảnh phim.',
        status: 'in_progress' as const,
      }
    ];

    const projectId = `proj-${Date.now()}`;
    const totalEpisodes = data.season_count * data.episodes_per_season;
    const episodes: EpisodePackage[] = [];
    let episodeNumber = 1;
    for (let season = 1; season <= data.season_count; season += 1) {
      for (let i = 0; i < data.episodes_per_season; i += 1) {
        const duration = data.episode_target_durations[episodeNumber - 1] ?? data.episode_target_durations[0] ?? 30;
        episodes.push(buildBlankEpisode(projectId, episodeNumber, season, duration));
        episodeNumber += 1;
      }
    }

    const newProject: ProductionProject = {
      id: projectId,
      title: data.title,
      genre: data.genre,
      synopsis: data.synopsis,
      overall_script: '',
      script_version: 1,
      script_review: PENDING_FIELD_REVIEW,
      season_count: data.season_count,
      episodes_per_season: data.episodes_per_season,
      total_episodes: totalEpisodes,
      total_budget_tokens: data.total_budget_tokens,
      allocated_tokens: 0,
      consumed_tokens: 0,
      production_start_date: data.production_start_date,
      deadline: data.deadline,
      planned_release_date: data.planned_release_date,
      creator_name: data.creator_name?.trim() || 'Trần Minh Huy',
      reviewer_name: 'Lê Quốc Bảo',
      overall_status: 'NOT_STARTED',
      milestones,
      active_milestone_id: milestones[0]?.id,
      episodes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      project: newProject,
      projects: [newProject, ...state.projects],
      activeProjectId: newProject.id,
      activePackageId: episodes[0]?.id || '',
    }));
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

  updateMilestoneStatus: (milestoneId, status) => {
    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        milestones: project.milestones?.map((m) => (m.id === milestoneId ? { ...m, status } : m)),
        updated_at: new Date().toISOString(),
      }))
    );
  },
});
