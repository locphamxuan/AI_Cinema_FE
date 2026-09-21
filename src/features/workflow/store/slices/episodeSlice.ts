import type { StateCreator } from 'zustand';
import { ProductionProject } from '@/types/workflow';
import { initialProject } from '@/features/workflow/mocks/workflowMock';
import type { EpisodeSlice, WorkflowStoreState } from '../types';
import { toast } from '@/components/ui/Toast';

export const createEpisodeSlice: StateCreator<WorkflowStoreState, [], [], EpisodeSlice> = (set, get) => ({
  project: initialProject,

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
    set((state) => ({
      project: {
        ...state.project,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
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
      },
    }));
  },

  submitProductionPlan: (packageId) => {
    set((state) => ({
      project: {
        ...state.project,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'PLAN_PENDING',
            brief: {
              ...ep.brief,
              status: 'PLAN_PENDING',
              updated_at: new Date().toISOString(),
            },
          };
        }),
      },
    }));
  },

  reviseProductionPlan: (packageId, updatedBrief) => {
    set((state) => ({
      project: {
        ...state.project,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'PLAN_PENDING',
            brief: {
              ...ep.brief,
              ...updatedBrief,
              status: 'PLAN_PENDING',
              updated_at: new Date().toISOString(),
            },
          };
        }),
      },
    }));
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

    set((state) => ({
      project: {
        ...state.project,
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            jobs: [...ep.jobs, newJob],
          };
        }),
      },
    }));
  },

  removeSceneJob: (packageId, jobId) => {
    set((state) => ({
      project: {
        ...state.project,
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            jobs: ep.jobs.filter((j) => j.id !== jobId),
            assets: ep.assets.filter((a) => a.job_id !== jobId),
          };
        }),
      },
    }));
  },

  submitEpisodePackage: (packageId) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return false;

    const uncompleted = pkg.jobs.filter((j) => j.status !== 'completed');
    if (uncompleted.length > 0) {
      toast.warning(
        'Chưa hoàn tất render!',
        `Còn ${uncompleted.length} phân cảnh chưa render hoàn tất. Vui lòng sinh xong toàn bộ clip trước khi nộp bản dựng.`
      );
      return false;
    }

    set((state) => ({
      project: {
        ...state.project,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'EPISODE_SUBMITTED',
            video_draft_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            updated_at: new Date().toISOString(),
          };
        }),
      },
    }));

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

    const newProject: ProductionProject = {
      id: `proj-${Date.now()}`,
      title: data.title,
      genre: data.genre,
      synopsis: data.synopsis,
      total_episodes: data.total_episodes,
      total_budget_tokens: data.total_budget_tokens,
      allocated_tokens: 0,
      consumed_tokens: 0,
      deadline: data.deadline,
      planned_release_date: data.planned_release_date,
      creator_name: 'Đạo diễn Trần Minh Huy (Maker)',
      reviewer_name: 'Thẩm định viên Lê Quốc Bảo (Checker)',
      milestones,
      active_milestone_id: milestones[0]?.id,
      episodes: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set({ project: newProject, activeProjectId: newProject.id });
  },

  setActiveMilestone: (milestoneId) => {
    set((state) => ({
      project: {
        ...state.project,
        active_milestone_id: milestoneId,
        updated_at: new Date().toISOString(),
      },
    }));
  },

  updateMilestoneStatus: (milestoneId, status) => {
    set((state) => ({
      project: {
        ...state.project,
        milestones: state.project.milestones?.map((m) =>
          m.id === milestoneId ? { ...m, status } : m
        ),
        updated_at: new Date().toISOString(),
      },
    }));
  },
});
