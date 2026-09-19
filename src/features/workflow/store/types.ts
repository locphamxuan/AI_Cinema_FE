import {
  Role,
  ProductionProject,
  ProjectMilestone,
  EpisodePackage,
  ContentBrief,
  GenerationJob,
  GenerationStep,
  ReviewLog,
  SceneReviewStatus,
  ComplianceCheck,
  AIContentLabel,
  Publication,
} from '@/types/workflow';

export interface ViewSlice {
  currentRole: Role;
  setRole: (role: Role) => void;
  activeProjectId: string;
  activePackageId: string;
  setActiveProject: (id: string) => void;
  setActivePackage: (id: string) => void;
}

export interface EpisodeSlice {
  project: ProductionProject;
  /** Roster of every project assigned to the current user (both roles read this for the sidebar's assigned/completed lists). */
  projects: ProductionProject[];

  getPackage: (packageId?: string) => EpisodePackage | undefined;
  getBrief: (packageId?: string) => ContentBrief | undefined;
  getJobs: (packageId?: string) => GenerationJob[];

  updateContentBrief: (packageId: string, briefData: Partial<ContentBrief>) => void;
  submitProductionPlan: (packageId: string) => void;
  reviseProductionPlan: (packageId: string, updatedBrief: Partial<ContentBrief>) => void;
  reviewScene: (packageId: string, sceneNumber: number, status: SceneReviewStatus, comment?: string) => void;
  addSceneJob: (packageId: string, sceneData: Omit<GenerationJob, 'id' | 'status' | 'progress' | 'created_at' | 'updated_at'>) => void;
  removeSceneJob: (packageId: string, jobId: string) => void;
  addGenerationStep: (packageId: string, jobId: string, step: Omit<GenerationStep, 'id'>) => void;
  updateGenerationStep: (packageId: string, jobId: string, stepId: string, data: Partial<GenerationStep>) => void;
  removeGenerationStep: (packageId: string, jobId: string, stepId: string) => void;
  submitEpisodePackage: (packageId: string) => boolean;
  createProject: (data: {
    title: string;
    genre: string[];
    synopsis: string;
    season_count: number;
    episodes_per_season: number;
    /** One target duration (minutes) per episode, in creation order. */
    episode_target_durations: number[];
    total_budget_tokens: number;
    deadline: string;
    planned_release_date: string;
    milestones?: ProjectMilestone[];
  }) => void;
  setActiveMilestone: (milestoneId: string) => void;
  updateMilestoneStatus: (milestoneId: string, status: 'pending' | 'in_progress' | 'completed') => void;
}

export interface ProductionSlice {
  triggerGenerationJob: (packageId: string, jobId: string) => Promise<boolean>;
}

export interface ReviewSlice {
  reviews: ReviewLog[];
  requestPlanChanges: (packageId: string, feedbackNotes: string) => void;
  allocateQuota: (packageId: string, tokenQuota: number, notes?: string) => void;
  requestContentChanges: (packageId: string, feedbackNotes: string) => void;
  approveContent: (packageId: string) => void;
}

export interface ComplianceSlice {
  complianceChecks: Record<string, ComplianceCheck>;
  labels: Record<string, AIContentLabel>;
  publications: Record<string, Publication>;
  saveComplianceCheck: (packageId: string, data: Partial<ComplianceCheck>, labelData?: Partial<AIContentLabel>) => void;
  scheduleAndPublish: (packageId: string, data: { scheduled_at: string; visibility: 'public' | 'vip_only' | 'unlisted'; channels: string[] }) => void;
}

export type WorkflowStoreState = ViewSlice &
  EpisodeSlice &
  ProductionSlice &
  ReviewSlice &
  ComplianceSlice & {
    resetDemoData: () => void;
  };
