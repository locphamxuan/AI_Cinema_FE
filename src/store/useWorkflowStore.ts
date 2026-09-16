import { create } from 'zustand';
import {
  Role,
  ProductionProject,
  EpisodePackage,
  ContentBrief,
  GenerationJob,
  GeneratedAsset,
  ReviewLog,
  ComplianceCheck,
  AIContentLabel,
  Publication,
} from '@/types/workflow';
import {
  initialProject,
  initialReviews,
  initialComplianceChecks,
  initialLabels,
  initialPublications,
} from '@/features/workflow/mocks/workflowMock';

// ==========================================
// WORKFLOW STORE INTERFACE
// ==========================================

interface WorkflowStoreState {
  // Global View State
  currentRole: Role;
  setRole: (role: Role) => void;
  activeProjectId: string;
  activePackageId: string;
  setActiveProject: (id: string) => void;
  setActivePackage: (id: string) => void;

  // Domain State
  project: ProductionProject;
  reviews: ReviewLog[];
  complianceChecks: Record<string, ComplianceCheck>;
  labels: Record<string, AIContentLabel>;
  publications: Record<string, Publication>;

  // Getters
  getPackage: (packageId?: string) => EpisodePackage | undefined;
  getBrief: (packageId?: string) => ContentBrief | undefined;
  getJobs: (packageId?: string) => GenerationJob[];

  // Maker (Creator) Actions
  updateContentBrief: (packageId: string, briefData: Partial<ContentBrief>) => void;
  submitProductionPlan: (packageId: string) => void;
  reviseProductionPlan: (packageId: string, updatedBrief: Partial<ContentBrief>) => void;
  triggerGenerationJob: (packageId: string, jobId: string) => Promise<boolean>;
  addSceneJob: (packageId: string, sceneData: Omit<GenerationJob, 'id' | 'status' | 'progress' | 'created_at' | 'updated_at'>) => void;
  removeSceneJob: (packageId: string, jobId: string) => void;
  submitEpisodePackage: (packageId: string) => boolean;

  // Checker (Reviewer) Actions
  createProject: (data: { title: string; genre: string[]; synopsis: string; total_episodes: number; total_budget_tokens: number; deadline: string; planned_release_date: string }) => void;
  requestPlanChanges: (packageId: string, feedbackNotes: string) => void;
  allocateQuota: (packageId: string, tokenQuota: number, notes?: string) => void;
  requestContentChanges: (packageId: string, feedbackNotes: string) => void;
  approveContent: (packageId: string) => void;
  saveComplianceCheck: (packageId: string, data: Partial<ComplianceCheck>, labelData?: Partial<AIContentLabel>) => void;
  scheduleAndPublish: (packageId: string, data: { scheduled_at: string; visibility: 'public' | 'vip_only' | 'unlisted'; channels: string[] }) => void;

  // Reset Demo State
  resetDemoData: () => void;
}

export const useWorkflowStore = create<WorkflowStoreState>((set, get) => ({
  currentRole: 'creator',
  setRole: (role) => set({ currentRole: role }),

  activeProjectId: 'proj-cyber-01',
  activePackageId: 'pkg-ep-03',
  setActiveProject: (id) => set({ activeProjectId: id }),
  setActivePackage: (id) => set({ activePackageId: id }),

  project: initialProject,
  reviews: initialReviews,
  complianceChecks: initialComplianceChecks,
  labels: initialLabels,
  publications: initialPublications,

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

  // ----------------------------------------------------
  // MAKER (CREATOR) ACTIONS
  // ----------------------------------------------------

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

  triggerGenerationJob: async (packageId, jobId) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return false;

    const job = pkg.jobs.find((j) => j.id === jobId);
    if (!job) return false;

    // Check token quota
    const currentTokens = pkg.actual_tokens_used;
    const quota = pkg.quota_allocated;
    const cost = job.token_cost;

    if (quota > 0 && currentTokens + cost > quota) {
      alert(`Vượt quá hạn mức Token Quota đã cấp (${currentTokens}/${quota} Tokens, Cần: ${cost})!`);
      return false;
    }

    // Step 1: Set to processing
    set((state) => ({
      project: {
        ...state.project,
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'IN_PRODUCTION',
            jobs: ep.jobs.map((j) =>
              j.id === jobId ? { ...j, status: 'processing', progress: 25, updated_at: new Date().toISOString() } : j
            ),
          };
        }),
      },
    }));

    // Step 2: Animated progression simulation
    await new Promise((resolve) => setTimeout(resolve, 600));

    set((state) => ({
      project: {
        ...state.project,
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            jobs: ep.jobs.map((j) => (j.id === jobId ? { ...j, progress: 70 } : j)),
          };
        }),
      },
    }));

    await new Promise((resolve) => setTimeout(resolve, 600));

    // Step 3: Complete job and create output asset
    const newAssetId = `asset-${Date.now()}`;
    const newAsset: GeneratedAsset = {
      id: newAssetId,
      job_id: jobId,
      scene_id: job.scene_id,
      asset_type: 'video',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      duration_seconds: 20,
      resolution: '3840x2160 (4K)',
      file_size_mb: 78.5,
      metadata: {
        fps: 60,
        codec: 'H.265 / HEVC',
        model: job.ai_model,
        seed: Math.floor(Math.random() * 1000000),
        prompt: job.prompt_video,
      },
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      project: {
        ...state.project,
        consumed_tokens: state.project.consumed_tokens + cost,
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'IN_PRODUCTION',
            actual_tokens_used: ep.actual_tokens_used + cost,
            jobs: ep.jobs.map((j) =>
              j.id === jobId
                ? {
                    ...j,
                    status: 'completed',
                    progress: 100,
                    output_asset_id: newAssetId,
                    updated_at: new Date().toISOString(),
                  }
                : j
            ),
            assets: [...ep.assets.filter((a) => a.job_id !== jobId), newAsset],
          };
        }),
      },
    }));

    return true;
  },

  addSceneJob: (packageId, sceneData) => {
    const newJobId = `job-${Date.now()}`;
    const newJob: GenerationJob = {
      ...sceneData,
      id: newJobId,
      status: 'pending',
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
      alert(`Còn ${uncompleted.length} phân cảnh chưa render hoàn tất. Vui lòng sinh xong clip trước khi submit!`);
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

  // ----------------------------------------------------
  // CHECKER (REVIEWER) ACTIONS
  // ----------------------------------------------------

  createProject: (data) => {
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
      episodes: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set({ project: newProject, activeProjectId: newProject.id });
  },

  requestPlanChanges: (packageId, feedbackNotes) => {
    const newReview: ReviewLog = {
      id: `rev-${Date.now()}`,
      episode_package_id: packageId,
      reviewer_id: 'rev-user-01',
      reviewer_name: 'Lê Quốc Bảo (Checker)',
      review_type: 'plan',
      decision: 'changes_requested',
      feedback_notes: feedbackNotes,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      reviews: [newReview, ...state.reviews],
      project: {
        ...state.project,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'CHANGES_REQUESTED',
            brief: {
              ...ep.brief,
              status: 'CHANGES_REQUESTED',
              updated_at: new Date().toISOString(),
            },
          };
        }),
      },
    }));
  },

  allocateQuota: (packageId, tokenQuota, notes) => {
    const newReview: ReviewLog = {
      id: `rev-${Date.now()}`,
      episode_package_id: packageId,
      reviewer_id: 'rev-user-01',
      reviewer_name: 'Lê Quốc Bảo (Checker)',
      review_type: 'plan',
      decision: 'approved',
      feedback_notes: `Kế hoạch được phê duyệt. Đã cấp ${tokenQuota} AI Tokens. ${notes || ''}`,
      quota_granted: tokenQuota,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      reviews: [newReview, ...state.reviews],
      project: {
        ...state.project,
        allocated_tokens: state.project.allocated_tokens + tokenQuota,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'QUOTA_ALLOCATED',
            quota_allocated: tokenQuota,
            brief: {
              ...ep.brief,
              status: 'QUOTA_ALLOCATED',
              updated_at: new Date().toISOString(),
            },
          };
        }),
      },
    }));
  },

  requestContentChanges: (packageId, feedbackNotes) => {
    const newReview: ReviewLog = {
      id: `rev-${Date.now()}`,
      episode_package_id: packageId,
      reviewer_id: 'rev-user-01',
      reviewer_name: 'Lê Quốc Bảo (Checker)',
      review_type: 'content',
      decision: 'changes_requested',
      feedback_notes: feedbackNotes,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      reviews: [newReview, ...state.reviews],
      project: {
        ...state.project,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'CHANGES_REQUESTED',
            updated_at: new Date().toISOString(),
          };
        }),
      },
    }));
  },

  approveContent: (packageId) => {
    set((state) => ({
      project: {
        ...state.project,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'COMPLIANCE_PASSED',
            updated_at: new Date().toISOString(),
          };
        }),
      },
    }));
  },

  saveComplianceCheck: (packageId, data, labelData) => {
    const compliance: ComplianceCheck = {
      id: `comp-${Date.now()}`,
      episode_package_id: packageId,
      checker_id: 'rev-user-01',
      checker_name: 'Lê Quốc Bảo (Checker)',
      article_44_passed: data.article_44_passed ?? true,
      decree142_passed: data.decree142_passed ?? true,
      watermark_verified: data.watermark_verified ?? true,
      moderation_score: data.moderation_score ?? 99.4,
      ai_content_percentage: data.ai_content_percentage ?? 100,
      status: 'passed',
      notes: data.notes || 'Đã kiểm định đầy đủ tiêu chuẩn nhãn dán định danh AI.',
      checked_at: new Date().toISOString(),
    };

    const label: AIContentLabel = {
      id: `lbl-${Date.now()}`,
      episode_package_id: packageId,
      label_type: labelData?.label_type || 'AI_GENERATED_FULL',
      label_text: labelData?.label_text || 'Nội dung tạo 100% bằng Trí tuệ Nhân tạo - Tuân thủ Điều 44 Luật AI & Nghị định 142/2024/NĐ-CP.',
      display_location: labelData?.display_location || 'INTRO_OUTRO',
      ruleset_version: labelData?.ruleset_version || 'DECREE_142_2024_V1',
      certification_id: labelData?.certification_id || `AI-VN-2026-CINEMA-${Math.floor(1000 + Math.random() * 9000)}`,
      is_active: true,
    };

    set((state) => ({
      complianceChecks: {
        ...state.complianceChecks,
        [packageId]: compliance,
      },
      labels: {
        ...state.labels,
        [packageId]: label,
      },
      project: {
        ...state.project,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'COMPLIANCE_PASSED',
            updated_at: new Date().toISOString(),
          };
        }),
      },
    }));
  },

  scheduleAndPublish: (packageId, data) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return;

    const publication: Publication = {
      id: `pub-${Date.now()}`,
      episode_package_id: packageId,
      movie_catalog_id: 'movie-001',
      title: pkg.title,
      scheduled_at: data.scheduled_at,
      published_at: new Date().toISOString(),
      visibility: data.visibility,
      platform_channels: data.channels,
      streaming_url: pkg.video_draft_url || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      quality: '4K Ultra HD',
    };

    set((state) => ({
      publications: {
        ...state.publications,
        [packageId]: publication,
      },
      project: {
        ...state.project,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'PUBLISHED',
            updated_at: new Date().toISOString(),
          };
        }),
      },
    }));
  },

  resetDemoData: () => {
    set({
      currentRole: 'creator',
      activeProjectId: 'proj-cyber-01',
      activePackageId: 'pkg-ep-03',
      project: initialProject,
      reviews: initialReviews,
      complianceChecks: initialComplianceChecks,
      labels: initialLabels,
      publications: initialPublications,
    });
  },
}));
