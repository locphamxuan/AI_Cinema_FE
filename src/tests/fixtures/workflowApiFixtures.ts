import type {
  ApiEpisodePackage,
  ApiGenerationJob,
  ApiPlanReview,
  ApiProductionPlan,
  ApiProductionProject,
  ApiScene,
} from '@/types/workflow-api';

// Backend MF-1 responses for adapter and store tests.

const at = '2026-09-24T08:00:00.000Z';

export function apiScene(n: number, overrides: Partial<ApiScene> = {}): ApiScene {
  return {
    id: `scene-${n}`,
    sceneNumber: n,
    title: `Cảnh ${n}`,
    description: `Mô tả cảnh ${n}`,
    scriptText: null,
    targetDurationSeconds: 60,
    estimatedTokens: 100,
    status: 'SUBMITTED',
    ...overrides,
  };
}

export function apiPlanReview(field: ApiPlanReview['field'], overrides: Partial<ApiPlanReview> = {}): ApiPlanReview {
  return {
    id: `review-${field}-${overrides.sceneId ?? 'plan'}`,
    field,
    sceneId: null,
    status: 'PENDING',
    comments: null,
    rejectionReason: null,
    decidedAt: null,
    createdAt: at,
    ...overrides,
  };
}

export function apiPackage(overrides: Partial<ApiEpisodePackage> = {}): ApiEpisodePackage {
  return {
    id: 'package-1',
    packageVersion: 1,
    createdAt: at,
    submissions: [{ id: 'submission-1', status: 'SUBMITTED', createdAt: at }],
    reviews: [],
    complianceChecks: [],
    aiContentLabels: [],
    currentForEpisode: null,
    ...overrides,
  };
}

export function apiPlan(overrides: Partial<ApiProductionPlan> = {}): ApiProductionPlan {
  return {
    id: 'plan-1',
    episodeNumber: 1,
    seasonNumber: 1,
    seasonEpisodeNumber: overrides.episodeNumber ?? 1,
    allottedDurationSeconds: 900,
    planVersion: 1,
    status: 'DRAFT',
    scriptText: 'Kịch bản tổng thể',
    productionApproach: 'Cinematic',
    targetDurationSeconds: 600,
    estimatedAiResourceUsage: '200',
    createdAt: at,
    updatedAt: at,
    scenes: [apiScene(1), apiScene(2)],
    planReviews: [],
    quotaAllocations: [],
    _count: { generationJobs: 0 },
    episodePackages: [],
    ...overrides,
  };
}

export function apiProject(plans: ApiProductionPlan[], overrides: Partial<ApiProductionProject> = {}): ApiProductionProject {
  return {
    id: 'project-1',
    title: 'Saigon 2077',
    description: 'Phim AI',
    status: 'ACTIVE',
    episodeCount: plans.length,
    productionStartDate: '2026-10-01T00:00:00.000Z',
    deadline: '2026-12-31T00:00:00.000Z',
    plannedReleaseDate: '2027-01-15T00:00:00.000Z',
    defaultEpisodeDurationSeconds: 1800,
    totalAiQuotaBudget: '3000',
    remainingAiQuotaBudget: '2500',
    createdAt: at,
    updatedAt: at,
    assignedCreator: { id: 'creator-1', fullName: 'Creator Một' },
    createdBy: { id: 'reviewer-1', fullName: 'Reviewer Một' },
    milestones: [],
    productionProjectGenres: [{ genre: { id: 'genre-1', name: 'Khoa học viễn tưởng' } }],
    productionPlans: plans,
    ...overrides,
  };
}

export function apiJob(id: string, sceneId: string, overrides: Partial<ApiGenerationJob> = {}): ApiGenerationJob {
  return {
    id,
    jobType: 'SCENE_VIDEO',
    status: 'COMPLETED',
    sceneId,
    attemptNumber: 1,
    parentJobId: null,
    rawPrompt: `Mô tả ${id}`,
    customFunction: null,
    estimatedTokenCost: 40,
    resourceCost: '45',
    outputDurationSeconds: '8',
    errorMessage: null,
    createdAt: at,
    aiModel: { id: 'model-1', name: 'Veo 3' },
    generatedAssets: [{ id: `asset-${id}`, assetType: 'VIDEO', storageKey: 'https://cdn/clip.m3u8', durationSeconds: 8 }],
    ...overrides,
  };
}
