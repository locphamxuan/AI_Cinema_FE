import {
  Role,
  ProductionProject,
  ProjectMilestone,
  EpisodePackage,
  ContentBrief,
  GenerationJob,
  ReviewLog,
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

  getPackage: (packageId?: string) => EpisodePackage | undefined;
  getBrief: (packageId?: string) => ContentBrief | undefined;
  getJobs: (packageId?: string) => GenerationJob[];

  updateContentBrief: (packageId: string, briefData: Partial<ContentBrief>) => void;
  submitProductionPlan: (packageId: string) => void;
  reviseProductionPlan: (packageId: string, updatedBrief: Partial<ContentBrief>) => void;
  addSceneJob: (packageId: string, sceneData: Omit<GenerationJob, 'id' | 'status' | 'progress' | 'created_at' | 'updated_at'>) => void;
  removeSceneJob: (packageId: string, jobId: string) => void;
  submitEpisodePackage: (packageId: string) => boolean;
  createProject: (data: {
    title: string;
    genre: string[];
    synopsis: string;
    total_episodes: number;
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
