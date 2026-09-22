/**
 * AI Cinema - Production Workflow API Service
 * Encapsulates all 42 endpoints connecting directly to Backend Database API
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import {
  // Lookups
  ApiUser,
  ApiGenre,
  ApiPolicy,
  // Projects & Milestones
  CreateProductionProjectDto,
  UpdateProductionProjectDto,
  CancelProductionProjectDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  ApiProductionProject,
  ApiMilestone,
  // Plans & Scenes
  SubmitProductionPlanDto,
  UpdateProductionPlanDto,
  CreateProductionPlanRevisionDto,
  CreateSceneDto,
  UpdateSceneDto,
  SubmitSceneDto,
  ApiProductionPlan,
  ApiScene,
  // Plan Reviews
  CreatePlanReviewDto,
  DecidePlanReviewDto,
  ApiPlanReview,
  // Quota
  CreateQuotaAllocationDto,
  ApiQuotaAllocation,
  // Jobs & Assets
  CreateGenerationJobDto,
  CreateGeneratedAssetDto,
  CompleteGenerationJobDto,
  ApiGenerationJob,
  ApiGeneratedAsset,
  // Packages & Final Reviews
  CreateEpisodePackageDto,
  CreateEpisodeSubmissionDto,
  CreateReviewDto,
  DecideReviewDto,
  ApiEpisodePackage,
  ApiReview,
  // Compliance & AI Labels
  CreateAiContentLabelDto,
  CreateComplianceCheckDto,
  DecideComplianceCheckDto,
  ApiAiContentLabel,
  ApiComplianceCheck,
  // Catalog & Publications
  CreateCatalogDto,
  CreatePublicationDto,
  ApiPublication,
} from '@/types/workflow-api';

const ROUTES = API_ROUTES.WORKFLOW;

class WorkflowService {
  // ==========================================
  // BƯỚC 0: LOOKUPS (Users, Genres, Policies)
  // ==========================================

  async listUsers(role?: string): Promise<ApiResponse<{ data: ApiUser[] }>> {
    const endpoint = role ? `${ROUTES.USERS}?filter[role]=${role}` : ROUTES.USERS;
    return apiClient.get<{ data: ApiUser[] }>(endpoint);
  }

  async listGenres(): Promise<ApiResponse<{ data: ApiGenre[] }>> {
    return apiClient.get<{ data: ApiGenre[] }>(ROUTES.GENRES);
  }

  async listPolicies(): Promise<ApiResponse<{ data: ApiPolicy[] }>> {
    return apiClient.get<{ data: ApiPolicy[] }>(ROUTES.POLICIES);
  }

  // ==========================================
  // BƯỚC 1: KHỞI TẠO DỰ ÁN & MILESTONES (Reviewer)
  // ==========================================

  async listProjects(params?: { status?: string; contentType?: string }): Promise<ApiResponse<{ data: ApiProductionProject[] }>> {
    let query = '';
    if (params) {
      const q = new URLSearchParams();
      if (params.status) q.append('filter[status]', params.status);
      if (params.contentType) q.append('filter[contentType]', params.contentType);
      query = `?${q.toString()}`;
    }
    return apiClient.get<{ data: ApiProductionProject[] }>(`${ROUTES.PROJECTS}${query}`);
  }

  async getProject(projectId: string): Promise<ApiResponse<ApiProductionProject>> {
    return apiClient.get<ApiProductionProject>(ROUTES.PROJECT_DETAIL(projectId));
  }

  async createProject(dto: CreateProductionProjectDto): Promise<ApiResponse<ApiProductionProject>> {
    return apiClient.post<ApiProductionProject>(ROUTES.PROJECTS, dto);
  }

  async updateProject(projectId: string, dto: UpdateProductionProjectDto): Promise<ApiResponse<ApiProductionProject>> {
    return apiClient.patch<ApiProductionProject>(ROUTES.PROJECT_DETAIL(projectId), dto);
  }

  async cancelProject(projectId: string, dto?: CancelProductionProjectDto): Promise<ApiResponse<ApiProductionProject>> {
    return apiClient.post<ApiProductionProject>(ROUTES.PROJECT_CANCEL(projectId), dto);
  }

  async listMilestones(projectId: string): Promise<ApiResponse<ApiMilestone[]>> {
    return apiClient.get<ApiMilestone[]>(ROUTES.PROJECT_MILESTONES(projectId));
  }

  async createMilestone(projectId: string, dto: CreateMilestoneDto): Promise<ApiResponse<ApiMilestone>> {
    return apiClient.post<ApiMilestone>(ROUTES.PROJECT_MILESTONES(projectId), dto);
  }

  async updateMilestone(milestoneId: string, dto: UpdateMilestoneDto): Promise<ApiResponse<ApiMilestone>> {
    return apiClient.patch<ApiMilestone>(ROUTES.MILESTONE_DETAIL(milestoneId), dto);
  }

  // ==========================================
  // BƯỚC 2: PRODUCTION PLANS & SCENES (Creator)
  // ==========================================

  async listPlans(projectId: string): Promise<ApiResponse<{ data: ApiProductionPlan[] }>> {
    return apiClient.get<{ data: ApiProductionPlan[] }>(ROUTES.PROJECT_PLANS(projectId));
  }

  async getPlan(planId: string): Promise<ApiResponse<ApiProductionPlan>> {
    return apiClient.get<ApiProductionPlan>(ROUTES.PLAN_DETAIL(planId));
  }

  async submitPlan(projectId: string, dto: SubmitProductionPlanDto): Promise<ApiResponse<ApiProductionPlan>> {
    return apiClient.post<ApiProductionPlan>(ROUTES.PROJECT_PLANS(projectId), dto);
  }

  async updatePlan(planId: string, dto: UpdateProductionPlanDto): Promise<ApiResponse<ApiProductionPlan>> {
    return apiClient.patch<ApiProductionPlan>(ROUTES.PLAN_DETAIL(planId), dto);
  }

  async createPlanRevision(projectId: string, planId: string, dto: CreateProductionPlanRevisionDto): Promise<ApiResponse<ApiProductionPlan>> {
    return apiClient.post<ApiProductionPlan>(ROUTES.PLAN_REVISIONS(projectId, planId), dto);
  }

  async listScenes(planId: string): Promise<ApiResponse<ApiScene[]>> {
    return apiClient.get<ApiScene[]>(ROUTES.PLAN_SCENES(planId));
  }

  async createScene(planId: string, dto: CreateSceneDto): Promise<ApiResponse<ApiScene>> {
    return apiClient.post<ApiScene>(ROUTES.PLAN_SCENES(planId), dto);
  }

  async updateScene(sceneId: string, dto: UpdateSceneDto): Promise<ApiResponse<ApiScene>> {
    return apiClient.patch<ApiScene>(ROUTES.SCENE_DETAIL(sceneId), dto);
  }

  async submitScene(sceneId: string, dto?: SubmitSceneDto): Promise<ApiResponse<ApiScene>> {
    return apiClient.post<ApiScene>(ROUTES.SCENE_SUBMIT(sceneId), dto);
  }

  // ==========================================
  // BƯỚC 3: PLAN REVIEWS (Reviewer)
  // ==========================================

  async createPlanReview(planId: string, dto: CreatePlanReviewDto): Promise<ApiResponse<ApiPlanReview>> {
    return apiClient.post<ApiPlanReview>(ROUTES.PLAN_REVIEWS(planId), dto);
  }

  async decidePlanReview(planReviewId: string, dto: DecidePlanReviewDto): Promise<ApiResponse<ApiPlanReview>> {
    return apiClient.patch<ApiPlanReview>(ROUTES.PLAN_REVIEW_DETAIL(planReviewId), dto);
  }

  async listPlanReviews(planId: string): Promise<ApiResponse<ApiPlanReview[]>> {
    return apiClient.get<ApiPlanReview[]>(ROUTES.PLAN_REVIEWS(planId));
  }

  // ==========================================
  // BƯỚC 4: QUOTA ALLOCATION (Reviewer)
  // ==========================================

  async allocateQuota(planId: string, dto: CreateQuotaAllocationDto): Promise<ApiResponse<ApiQuotaAllocation>> {
    return apiClient.post<ApiQuotaAllocation>(ROUTES.QUOTA_ALLOCATIONS(planId), dto);
  }

  async createQuotaAllocation(planId: string, dto: CreateQuotaAllocationDto): Promise<ApiResponse<ApiQuotaAllocation>> {
    return this.allocateQuota(planId, dto);
  }

  async getQuotaByPlan(planId: string): Promise<ApiResponse<ApiQuotaAllocation[]>> {
    return apiClient.get<ApiQuotaAllocation[]>(ROUTES.QUOTA_ALLOCATIONS(planId));
  }

  // ==========================================
  // BƯỚC 5: GENERATION JOBS & ASSETS (Studio)
  // ==========================================

  async listJobs(planId: string): Promise<ApiResponse<{ data: ApiGenerationJob[] }>> {
    return apiClient.get<{ data: ApiGenerationJob[] }>(ROUTES.GENERATION_JOBS(planId));
  }

  async createJob(planId: string, dto: CreateGenerationJobDto): Promise<ApiResponse<ApiGenerationJob>> {
    return apiClient.post<ApiGenerationJob>(ROUTES.GENERATION_JOBS(planId), dto);
  }

  async completeJob(jobId: string, dto?: CompleteGenerationJobDto): Promise<ApiResponse<ApiGenerationJob>> {
    return apiClient.post<ApiGenerationJob>(ROUTES.JOB_COMPLETE(jobId), dto);
  }

  async createAsset(jobId: string, dto: CreateGeneratedAssetDto): Promise<ApiResponse<ApiGeneratedAsset>> {
    return apiClient.post<ApiGeneratedAsset>(ROUTES.JOB_ASSETS(jobId), dto);
  }

  // ==========================================
  // BƯỚC 6: EPISODE PACKAGES & SUBMISSION
  // ==========================================

  async createEpisodePackage(planId: string, dto?: CreateEpisodePackageDto): Promise<ApiResponse<ApiEpisodePackage>> {
    return apiClient.post<ApiEpisodePackage>(ROUTES.PACKAGES(planId), dto);
  }

  async submitEpisodePackage(packageId: string, dto: CreateEpisodeSubmissionDto): Promise<ApiResponse<unknown>> {
    return apiClient.post<unknown>(ROUTES.PACKAGE_SUBMISSIONS(packageId), dto);
  }

  // ==========================================
  // BƯỚC 7: REVIEWS / AUDIT (Reviewer)
  // ==========================================

  async createReview(packageId: string, dto: CreateReviewDto): Promise<ApiResponse<ApiReview>> {
    return apiClient.post<ApiReview>(ROUTES.PACKAGE_REVIEWS(packageId), dto);
  }

  async decideReview(reviewId: string, dto: DecideReviewDto): Promise<ApiResponse<ApiReview>> {
    return apiClient.patch<ApiReview>(ROUTES.REVIEW_DETAIL(reviewId), dto);
  }

  // ==========================================
  // BƯỚC 8: AI CONTENT LABEL (ĐIỀU 44 & NĐ 142)
  // ==========================================

  async createAiContentLabel(packageId: string, dto: CreateAiContentLabelDto): Promise<ApiResponse<ApiAiContentLabel>> {
    return apiClient.post<ApiAiContentLabel>(ROUTES.PACKAGE_AI_LABELS(packageId), dto);
  }

  // ==========================================
  // BƯỚC 9: COMPLIANCE CHECK
  // ==========================================

  async createComplianceCheck(packageId: string, dto: CreateComplianceCheckDto): Promise<ApiResponse<ApiComplianceCheck>> {
    return apiClient.post<ApiComplianceCheck>(ROUTES.PACKAGE_COMPLIANCE_CHECKS(packageId), dto);
  }

  async decideComplianceCheck(checkId: string, dto: DecideComplianceCheckDto): Promise<ApiResponse<ApiComplianceCheck>> {
    return apiClient.patch<ApiComplianceCheck>(ROUTES.COMPLIANCE_CHECK_DETAIL(checkId), dto);
  }

  // ==========================================
  // BƯỚC 10: CATALOG & PUBLICATIONS
  // ==========================================

  async createCatalog(packageId: string, _dto?: CreateCatalogDto): Promise<ApiResponse<unknown>> {
    return apiClient.post<unknown>(ROUTES.CATALOG_FROM_PACKAGE(packageId));
  }

  async createPublication(episodeId: string, dto: CreatePublicationDto): Promise<ApiResponse<ApiPublication>> {
    return apiClient.post<ApiPublication>(ROUTES.EPISODE_PUBLICATIONS(episodeId), dto);
  }

  async publishEpisode(publicationId: string): Promise<ApiResponse<ApiPublication>> {
    return apiClient.post<ApiPublication>(ROUTES.PUBLICATION_PUBLISH(publicationId));
  }

  async publishNow(publicationId: string): Promise<ApiResponse<ApiPublication>> {
    return this.publishEpisode(publicationId);
  }
}

export const workflowService = new WorkflowService();
export default workflowService;
