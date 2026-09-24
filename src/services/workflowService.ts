/**
 * AI Cinema - MF-1 Production Workflow API Service
 * One method per backend endpoint the workspace uses. The acting user is
 * always taken from the JWT by the backend, never sent in the body.
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type {
  ApiAiContentLabel,
  ApiCatalogEntry,
  ApiComplianceVerdict,
  ApiEpisodePackage,
  ApiGenre,
  ApiGenerationJob,
  ApiPlanReview,
  ApiPolicy,
  ApiProductionPlan,
  ApiProductionProject,
  ApiPublication,
  ApiQuotaAllocation,
  ApiReview,
  ApiRoute,
  ApiRoutingRow,
  ApiScene,
  ApiUser,
  CreateAiContentLabelDto,
  CreateEpisodePackageDto,
  CreateEpisodeSubmissionDto,
  CreateGenerationJobDto,
  CreatePlanReviewDto,
  CreateProductionProjectDto,
  CreatePublicationDto,
  CreateQuotaAllocationDto,
  CreateReviewDto,
  CreateSceneDto,
  GenerationJobType,
  DecideReviewDto,
  Paginated,
  RecordComplianceReviewDto,
  SubmitProductionPlanDto,
  UpdateMilestoneDto,
  UpdateSceneDto,
  ApiMilestone,
} from '@/types/workflow-api';

const ROUTES = API_ROUTES.WORKFLOW;

class WorkflowService {
  // Lookups
  listUsers(role?: string): Promise<ApiResponse<Paginated<ApiUser>>> {
    const query = role ? `?filter.role=$eq:${role}` : '';
    return apiClient.get<Paginated<ApiUser>>(`${ROUTES.USERS}${query}`);
  }

  /** Adds a genre; a name that exists (ignoring case) returns that genre instead. */
  createGenre(name: string): Promise<ApiResponse<ApiGenre>> {
    return apiClient.post<ApiGenre>(ROUTES.GENRES, { name });
  }

  listGenres(): Promise<ApiResponse<Paginated<ApiGenre>>> {
    return apiClient.get<Paginated<ApiGenre>>(`${ROUTES.GENRES}?limit=100`);
  }

  listPolicies(): Promise<ApiResponse<Paginated<ApiPolicy>>> {
    return apiClient.get<Paginated<ApiPolicy>>(ROUTES.POLICIES);
  }

  getRouting(): Promise<ApiResponse<ApiRoutingRow[]>> {
    return apiClient.get<ApiRoutingRow[]>(ROUTES.AI_MODEL_ROUTING);
  }

  /** Model one job would be routed to — resolves a described CUSTOM function (BR-40). */
  resolveRoute(jobType: GenerationJobType, customFunction?: string): Promise<ApiResponse<ApiRoute>> {
    const query = new URLSearchParams({ jobType, ...(customFunction ? { customFunction } : {}) });
    return apiClient.get<ApiRoute>(`${ROUTES.AI_MODEL_ROUTE}?${query}`);
  }

  // Projects & milestones (Reviewer)
  listProjects(): Promise<ApiResponse<Paginated<ApiProductionProject>>> {
    return apiClient.get<Paginated<ApiProductionProject>>(ROUTES.PROJECTS);
  }

  getProject(projectId: string): Promise<ApiResponse<ApiProductionProject>> {
    return apiClient.get<ApiProductionProject>(ROUTES.PROJECT_DETAIL(projectId));
  }

  createProject(dto: CreateProductionProjectDto): Promise<ApiResponse<ApiProductionProject>> {
    return apiClient.post<ApiProductionProject>(ROUTES.PROJECTS, dto);
  }

  updateMilestone(milestoneId: string, dto: UpdateMilestoneDto): Promise<ApiResponse<ApiMilestone>> {
    return apiClient.patch<ApiMilestone>(ROUTES.MILESTONE_DETAIL(milestoneId), dto);
  }

  // Plans & scenes (Creator)

  submitPlan(planId: string, dto: SubmitProductionPlanDto): Promise<ApiResponse<ApiProductionPlan>> {
    return apiClient.post<ApiProductionPlan>(ROUTES.PLAN_SUBMIT(planId), dto);
  }


  createScene(planId: string, dto: CreateSceneDto): Promise<ApiResponse<ApiScene>> {
    return apiClient.post<ApiScene>(ROUTES.PLAN_SCENES(planId), dto);
  }

  updateScene(sceneId: string, dto: UpdateSceneDto): Promise<ApiResponse<ApiScene>> {
    return apiClient.patch<ApiScene>(ROUTES.SCENE_DETAIL(sceneId), dto);
  }

  deleteScene(sceneId: string): Promise<ApiResponse<unknown>> {
    return apiClient.delete<unknown>(ROUTES.SCENE_DETAIL(sceneId));
  }

  // Plan reviews & quota (Reviewer)
  createPlanReview(planId: string, dto: CreatePlanReviewDto = {}): Promise<ApiResponse<ApiPlanReview[]>> {
    return apiClient.post<ApiPlanReview[]>(ROUTES.PLAN_REVIEWS(planId), dto);
  }

  decidePlanReview(planReviewId: string, dto: DecideReviewDto): Promise<ApiResponse<ApiPlanReview>> {
    return apiClient.patch<ApiPlanReview>(ROUTES.PLAN_REVIEW_DETAIL(planReviewId), dto);
  }

  allocateQuota(planId: string, dto: CreateQuotaAllocationDto): Promise<ApiResponse<ApiQuotaAllocation>> {
    return apiClient.post<ApiQuotaAllocation>(ROUTES.QUOTA_ALLOCATIONS(planId), dto);
  }

  // Generation jobs (Studio)
  listJobs(planId: string): Promise<ApiResponse<ApiGenerationJob[]>> {
    return apiClient.get<ApiGenerationJob[]>(ROUTES.GENERATION_JOBS(planId));
  }

  createJob(planId: string, dto: CreateGenerationJobDto): Promise<ApiResponse<ApiGenerationJob>> {
    return apiClient.post<ApiGenerationJob>(ROUTES.GENERATION_JOBS(planId), dto);
  }

  runJob(jobId: string): Promise<ApiResponse<ApiGenerationJob>> {
    return apiClient.post<ApiGenerationJob>(ROUTES.JOB_RUN(jobId));
  }

  /** New attempt of a finished job — charged again (BR-41). */
  retryJob(jobId: string, prompt?: string): Promise<ApiResponse<ApiGenerationJob>> {
    return apiClient.post<ApiGenerationJob>(ROUTES.JOB_RETRY(jobId), prompt ? { prompt } : {});
  }

  /** Marks a generated scene COMPLETED; every scene must be before the episode is assembled. */
  submitScene(sceneId: string): Promise<ApiResponse<unknown>> {
    return apiClient.post<unknown>(ROUTES.SCENE_SUBMIT(sceneId), {});
  }

  // Episode packages, submission & content review
  createEpisodePackage(planId: string, dto: CreateEpisodePackageDto = {}): Promise<ApiResponse<ApiEpisodePackage>> {
    return apiClient.post<ApiEpisodePackage>(ROUTES.PACKAGES(planId), dto);
  }

  submitEpisodePackage(packageId: string, dto: CreateEpisodeSubmissionDto = {}): Promise<ApiResponse<unknown>> {
    return apiClient.post<unknown>(ROUTES.PACKAGE_SUBMISSIONS(packageId), dto);
  }

  createReview(packageId: string, dto: CreateReviewDto = {}): Promise<ApiResponse<ApiReview>> {
    return apiClient.post<ApiReview>(ROUTES.PACKAGE_REVIEWS(packageId), dto);
  }

  decideReview(reviewId: string, dto: DecideReviewDto): Promise<ApiResponse<ApiReview>> {
    return apiClient.patch<ApiReview>(ROUTES.REVIEW_DETAIL(reviewId), dto);
  }

  // Compliance (Điều 44 Luật AI & NĐ 142)
  createAiContentLabel(packageId: string, dto: CreateAiContentLabelDto): Promise<ApiResponse<ApiAiContentLabel>> {
    return apiClient.post<ApiAiContentLabel>(ROUTES.PACKAGE_AI_LABELS(packageId), dto);
  }

  recordComplianceReview(packageId: string, dto: RecordComplianceReviewDto): Promise<ApiResponse<ApiComplianceVerdict>> {
    return apiClient.post<ApiComplianceVerdict>(ROUTES.PACKAGE_COMPLIANCE_REVIEWS(packageId), dto);
  }

  // Catalog & publication
  createCatalog(packageId: string): Promise<ApiResponse<ApiCatalogEntry>> {
    return apiClient.post<ApiCatalogEntry>(ROUTES.CATALOG_FROM_PACKAGE(packageId));
  }

  createPublication(episodeId: string, dto: CreatePublicationDto): Promise<ApiResponse<ApiPublication>> {
    return apiClient.post<ApiPublication>(ROUTES.EPISODE_PUBLICATIONS(episodeId), dto);
  }

  publish(publicationId: string): Promise<ApiResponse<ApiPublication>> {
    return apiClient.post<ApiPublication>(ROUTES.PUBLICATION_PUBLISH(publicationId));
  }
}

export const workflowService = new WorkflowService();
export default workflowService;
