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
  ApiPlatformSetting,
  ApiGenerationJob,
  ApiPlanReview,
  ApiPolicy,
  ApiProductionPlan,
  ApiProductionProject,
  ApiPublication,
  ApiQuotaAllocation,
  ApiQuotaRequest,
  ApproveQuotaRequestDto,
  ApiReview,
  ApiRoute,
  ApiRoutingRow,
  ApiScene,
  ApiSceneAdvice,
  ApiPlanContinuity,
  ApiUser,
  CreateAiContentLabelDto,
  CreateEpisodePackageDto,
  CreateEpisodeSubmissionDto,
  CreateGenerationJobDto,
  CreatePlanReviewDto,
  CreateProductionProjectDto,
  CreatePublicationDto,
  CreateQuotaAllocationDto,
  CreateQuotaRequestDto,
  RejectQuotaRequestDto,
  CreateReviewDto,
  GenerationJobType,
  DecideReviewDto,
  Paginated,
  RecordComplianceReviewDto,
  SubmitProductionPlanDto,
  SavePlanDraftDto,
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

  getPlatformSettings(): Promise<ApiResponse<ApiPlatformSetting>> {
    return apiClient.get<ApiPlatformSetting>(ROUTES.PLATFORM_SETTINGS);
  }

  /** Admin only. */
  updatePlatformSettings(dto: { maxEpisodeDurationSeconds: number | null }): Promise<ApiResponse<ApiPlatformSetting>> {
    return apiClient.patch<ApiPlatformSetting>(ROUTES.PLATFORM_SETTINGS, dto);
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

  // Plans & scenes (Creator)

  /** Saves the whole plan in one request; returns its scenes with their ids. */
  savePlanDraft(planId: string, dto: SavePlanDraftDto): Promise<ApiResponse<ApiScene[]>> {
    return apiClient.put<ApiScene[]>(ROUTES.PLAN_DRAFT(planId), dto);
  }

  submitPlan(planId: string, dto: SubmitProductionPlanDto): Promise<ApiResponse<ApiProductionPlan>> {
    return apiClient.post<ApiProductionPlan>(ROUTES.PLAN_SUBMIT(planId), dto);
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

  /** Creator asks for more tokens once the plan's quota runs low. */
  requestQuota(planId: string, dto: CreateQuotaRequestDto): Promise<ApiResponse<ApiQuotaRequest>> {
    return apiClient.post<ApiQuotaRequest>(ROUTES.QUOTA_REQUESTS(planId), dto);
  }

  approveQuotaRequest(requestId: string, dto: ApproveQuotaRequestDto): Promise<ApiResponse<ApiQuotaRequest>> {
    return apiClient.post<ApiQuotaRequest>(ROUTES.QUOTA_REQUEST_APPROVE(requestId), dto);
  }

  rejectQuotaRequest(requestId: string, dto: RejectQuotaRequestDto): Promise<ApiResponse<ApiQuotaRequest>> {
    return apiClient.post<ApiQuotaRequest>(ROUTES.QUOTA_REQUEST_REJECT(requestId), dto);
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

  /** Removes a step from its scene; the job stays for audit and its tokens are not refunded. */
  discardJob(jobId: string): Promise<ApiResponse<ApiGenerationJob>> {
    return apiClient.delete<ApiGenerationJob>(ROUTES.JOB_DETAIL(jobId));
  }

  /** Retitles a scene or refines its description during production (script and duration stay approved). */
  updateSceneDirection(sceneId: string, dto: { title?: string; description?: string }): Promise<ApiResponse<ApiScene>> {
    return apiClient.patch<ApiScene>(ROUTES.SCENE_DIRECTION(sceneId), dto);
  }

  /** Starts a scene over: its generations are removed (tokens are not refunded). */
  resetScene(sceneId: string): Promise<ApiResponse<ApiScene>> {
    return apiClient.post<ApiScene>(ROUTES.SCENE_RESET(sceneId), {});
  }

  /** What the scene still lacks and suggested prompts that follow the film and the previous scene. */
  getSceneAdvice(sceneId: string): Promise<ApiResponse<ApiSceneAdvice>> {
    return apiClient.get<ApiSceneAdvice>(ROUTES.SCENE_SUGGESTIONS(sceneId));
  }

  /** Where neighbouring scenes of the episode do not cut together, scene by scene. */
  getPlanContinuity(planId: string): Promise<ApiResponse<ApiPlanContinuity>> {
    return apiClient.get<ApiPlanContinuity>(ROUTES.PLAN_CONTINUITY(planId));
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
