/**
 * AI Cinema - Production Workflow API Service
 * Encapsulates all 42 endpoints across 10 lifecycle steps with Mock fallback
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
import {
  initialProject,
  mockAssignedProjects,
  initialComplianceChecks,
  initialLabels,
  initialPublications,
  initialReviews,
} from '@/features/workflow/mocks/workflowMock';

const ROUTES = API_ROUTES.WORKFLOW;

class WorkflowService {
  // ==========================================
  // BƯỚC 0: LOOKUPS (Users, Genres, Policies)
  // ==========================================

  async listUsers(role?: string): Promise<ApiResponse<{ data: ApiUser[] }>> {
    const endpoint = role ? `${ROUTES.USERS}?filter[role]=${role}` : ROUTES.USERS;
    return apiClient.get<{ data: ApiUser[] }>(endpoint, {}, () => ({
      data: [
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          email: 'creator@gmail.com',
          fullName: 'Trần Minh Huy',
          role: 'CONTENT_CREATOR',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '1deebe95-e8ca-49aa-bd4d-c44489f9964f',
          email: 'reviewer@gmail.com',
          fullName: 'Lê Quốc Bảo',
          role: 'CONTENT_REVIEWER',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }));
  }

  async listGenres(): Promise<ApiResponse<{ data: ApiGenre[] }>> {
    return apiClient.get<{ data: ApiGenre[] }>(ROUTES.GENRES, {}, () => ({
      data: [
        { id: 'g-scifi', name: 'Khoa học viễn tưởng', slug: 'khoa-hoc-vien-tuong' },
        { id: 'g-cyber', name: 'Cyberpunk', slug: 'cyberpunk' },
        { id: 'g-action', name: 'Hành động AI', slug: 'hanh-dong-ai' },
        { id: 'g-fantasy', name: 'Kỳ ảo', slug: 'ky-ao' },
      ],
    }));
  }

  async listPolicies(): Promise<ApiResponse<{ data: ApiPolicy[] }>> {
    return apiClient.get<{ data: ApiPolicy[] }>(ROUTES.POLICIES, {}, () => ({
      data: [
        {
          id: 'pol-d44-2025',
          name: 'Gắn nhãn nội dung AI theo Luật 134/2025 Điều 44',
          type: 'AI_LABELING',
          version: '1.0',
          documentReference: 'Điều 44 Luật 134/2025/QH15',
          content: {},
          effectiveFrom: '2025-01-01',
          isActive: true,
        },
        {
          id: 'pol-nd142-2026',
          name: 'Quy chuẩn Watermark AI theo Nghị định 142/2026',
          type: 'WATERMARK_COMPLIANCE',
          version: '1.0',
          documentReference: 'Điều 18 NĐ 142/2026/NĐ-CP',
          content: {},
          effectiveFrom: '2026-01-01',
          isActive: true,
        },
      ],
    }));
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
    return apiClient.get<{ data: ApiProductionProject[] }>(`${ROUTES.PROJECTS}${query}`, {}, () => ({
      data: mockAssignedProjects as unknown as ApiProductionProject[],
    }));
  }

  async getProject(projectId: string): Promise<ApiResponse<ApiProductionProject>> {
    return apiClient.get<ApiProductionProject>(ROUTES.PROJECT_DETAIL(projectId), {}, () => {
      const found = mockAssignedProjects.find((p) => p.id === projectId) || initialProject;
      return found as unknown as ApiProductionProject;
    });
  }

  async createProject(dto: CreateProductionProjectDto): Promise<ApiResponse<ApiProductionProject>> {
    return apiClient.post<ApiProductionProject>(ROUTES.PROJECTS, dto, {}, () => {
      return {
        id: `proj-${Date.now()}`,
        title: dto.title,
        description: dto.description,
        contentType: dto.contentType,
        status: 'DRAFT',
        createdById: '1deebe95-e8ca-49aa-bd4d-c44489f9964f',
        assignedCreatorId: dto.assignedCreatorId,
        episodeCount: dto.episodeCount || 1,
        productionStartDate: dto.productionStartDate,
        deadline: dto.deadline,
        plannedReleaseDate: dto.plannedReleaseDate,
        defaultEpisodeDurationSeconds: dto.defaultEpisodeDurationSeconds || 1800,
        totalAiQuotaBudget: dto.totalAiQuotaBudget,
        remainingAiQuotaBudget: dto.totalAiQuotaBudget,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ApiProductionProject;
    });
  }

  async updateProject(projectId: string, dto: UpdateProductionProjectDto): Promise<ApiResponse<ApiProductionProject>> {
    return apiClient.patch<ApiProductionProject>(ROUTES.PROJECT_DETAIL(projectId), dto, {}, () => ({
      ...initialProject,
      ...dto,
    } as unknown as ApiProductionProject));
  }

  async cancelProject(projectId: string, dto?: CancelProductionProjectDto): Promise<ApiResponse<ApiProductionProject>> {
    return apiClient.post<ApiProductionProject>(ROUTES.PROJECT_CANCEL(projectId), dto, {}, () => ({
      ...initialProject,
      status: 'CANCELLED',
      cancelledReason: dto?.cancelledReason,
    } as unknown as ApiProductionProject));
  }

  async listMilestones(projectId: string): Promise<ApiResponse<ApiMilestone[]>> {
    return apiClient.get<ApiMilestone[]>(ROUTES.PROJECT_MILESTONES(projectId), {}, () => (
      initialProject.milestones as unknown as ApiMilestone[]
    ));
  }

  async createMilestone(projectId: string, dto: CreateMilestoneDto): Promise<ApiResponse<ApiMilestone>> {
    return apiClient.post<ApiMilestone>(ROUTES.PROJECT_MILESTONES(projectId), dto, {}, () => ({
      id: `ms-${Date.now()}`,
      productionProjectId: projectId,
      title: dto.title,
      description: dto.description,
      startDate: dto.startDate,
      targetDate: dto.targetDate,
      status: 'PLANNED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  async updateMilestone(milestoneId: string, dto: UpdateMilestoneDto): Promise<ApiResponse<ApiMilestone>> {
    return apiClient.patch<ApiMilestone>(ROUTES.MILESTONE_DETAIL(milestoneId), dto, {}, () => ({
      id: milestoneId,
      productionProjectId: initialProject.id,
      title: dto.title || 'Milestone',
      status: dto.status || 'IN_PROGRESS',
      resultText: dto.resultText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  // ==========================================
  // BƯỚC 2: PRODUCTION PLANS & SCENES (Creator)
  // ==========================================

  async listPlans(projectId: string): Promise<ApiResponse<{ data: ApiProductionPlan[] }>> {
    return apiClient.get<{ data: ApiProductionPlan[] }>(ROUTES.PROJECT_PLANS(projectId), {}, () => ({
      data: initialProject.episodes.map((ep, idx) => ({
        id: ep.id,
        productionProjectId: projectId,
        episodeNumber: ep.episode_number,
        planVersion: 1,
        scriptText: ep.brief?.storyboard_summary,
        productionApproach: ep.brief?.production_approach,
        targetDurationSeconds: (ep.target_duration_minutes || 30) * 60,
        targetLanguages: ['vi'],
        status: ep.status === 'PLAN_PENDING' ? 'SUBMITTED' : 'APPROVED',
        totalSceneCount: ep.brief?.scene_count || 3,
        completedSceneCount: ep.jobs?.filter((j) => j.status === 'completed').length || 0,
        createdById: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        createdAt: ep.created_at,
        updatedAt: ep.updated_at,
      })) as ApiProductionPlan[],
    }));
  }

  async getPlan(planId: string): Promise<ApiResponse<ApiProductionPlan>> {
    return apiClient.get<ApiProductionPlan>(ROUTES.PLAN_DETAIL(planId), {}, () => {
      const ep = initialProject.episodes.find((e) => e.id === planId) || initialProject.episodes[0];
      return {
        id: ep.id,
        productionProjectId: initialProject.id,
        episodeNumber: ep.episode_number,
        planVersion: 1,
        scriptText: ep.brief?.storyboard_summary,
        productionApproach: ep.brief?.production_approach,
        targetDurationSeconds: (ep.target_duration_minutes || 30) * 60,
        targetLanguages: ['vi'],
        status: ep.status === 'PLAN_PENDING' ? 'SUBMITTED' : 'APPROVED',
        totalSceneCount: ep.brief?.scene_breakdown?.length || 3,
        completedSceneCount: ep.jobs?.filter((j) => j.status === 'completed').length || 0,
        createdById: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        createdAt: ep.created_at,
        updatedAt: ep.updated_at,
        scenes: ep.brief?.scene_breakdown?.map((sc) => ({
          id: `sc-${sc.scene_number}`,
          productionPlanId: ep.id,
          sceneNumber: sc.scene_number,
          title: sc.title,
          scriptText: sc.description,
          targetDurationSeconds: sc.target_duration_sec,
          status: 'APPROVED',
          createdAt: ep.created_at,
          updatedAt: ep.updated_at,
        })) as ApiScene[],
      } as ApiProductionPlan;
    });
  }

  async updatePlan(planId: string, dto: UpdateProductionPlanDto): Promise<ApiResponse<ApiProductionPlan>> {
    return apiClient.patch<ApiProductionPlan>(ROUTES.PLAN_DETAIL(planId), dto);
  }

  async submitPlan(planId: string, dto: SubmitProductionPlanDto): Promise<ApiResponse<ApiProductionPlan>> {
    return apiClient.post<ApiProductionPlan>(ROUTES.PLAN_SUBMIT(planId), dto, {}, () => {
      return {
        id: planId,
        productionProjectId: initialProject.id,
        episodeNumber: 1,
        planVersion: 1,
        scriptText: dto.scriptText,
        productionApproach: dto.productionApproach,
        targetDurationSeconds: dto.targetDurationSeconds,
        targetLanguages: ['vi'],
        estimatedAiResourceUsage: dto.estimatedAiResourceUsage,
        status: 'SUBMITTED',
        totalSceneCount: dto.scenes.length,
        completedSceneCount: 0,
        createdById: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ApiProductionPlan;
    });
  }

  async createRevision(
    projectId: string,
    planId: string,
    dto: CreateProductionPlanRevisionDto
  ): Promise<ApiResponse<ApiProductionPlan>> {
    return apiClient.post<ApiProductionPlan>(ROUTES.PLAN_REVISIONS(projectId, planId), dto);
  }

  async addScene(planId: string, dto: CreateSceneDto): Promise<ApiResponse<ApiScene>> {
    return apiClient.post<ApiScene>(ROUTES.PLAN_SCENES(planId), dto, {}, () => ({
      id: `sc-${Date.now()}`,
      productionPlanId: planId,
      sceneNumber: dto.sceneNumber,
      title: dto.title,
      scriptText: dto.scriptText,
      targetDurationSeconds: dto.targetDurationSeconds,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  async updateScene(sceneId: string, dto: UpdateSceneDto): Promise<ApiResponse<ApiScene>> {
    return apiClient.patch<ApiScene>(ROUTES.SCENE_DETAIL(sceneId), dto);
  }

  async deleteScene(sceneId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(ROUTES.SCENE_DETAIL(sceneId), {}, () => ({ success: true }));
  }

  async submitScene(sceneId: string, dto: SubmitSceneDto): Promise<ApiResponse<ApiScene>> {
    return apiClient.post<ApiScene>(ROUTES.SCENE_SUBMIT(sceneId), dto, {}, () => ({
      id: sceneId,
      productionPlanId: 'plan-1',
      sceneNumber: 1,
      title: 'Scene Completed',
      targetDurationSeconds: 120,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  // ==========================================
  // BƯỚC 3: DUYỆT KẾ HOẠCH THEO PHÂN CẢNH (Reviewer)
  // ==========================================

  async createPlanReview(planId: string, dto: CreatePlanReviewDto): Promise<ApiResponse<ApiPlanReview[]>> {
    return apiClient.post<ApiPlanReview[]>(ROUTES.PLAN_REVIEWS(planId), dto, {}, () => [
      {
        id: `prev-${Date.now()}`,
        productionPlanId: planId,
        reviewerId: dto.reviewerId,
        status: 'PENDING',
        comments: dto.comments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }

  async getPlanReview(planReviewId: string): Promise<ApiResponse<ApiPlanReview>> {
    return apiClient.get<ApiPlanReview>(ROUTES.PLAN_REVIEW_DETAIL(planReviewId));
  }

  async decidePlanReview(planReviewId: string, dto: DecidePlanReviewDto): Promise<ApiResponse<ApiPlanReview>> {
    return apiClient.patch<ApiPlanReview>(ROUTES.PLAN_REVIEW_DETAIL(planReviewId), dto, {}, () => ({
      id: planReviewId,
      productionPlanId: 'plan-1',
      reviewerId: '1deebe95-e8ca-49aa-bd4d-c44489f9964f',
      status: dto.decision === 'APPROVED' ? 'APPROVED' : 'CHANGES_REQUESTED',
      comments: dto.comments,
      rejectionReason: dto.rejectionReason,
      decidedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  // ==========================================
  // BƯỚC 4: CẤP AI QUOTA (Reviewer / System)
  // ==========================================

  async createQuotaAllocation(
    planId: string,
    dto: CreateQuotaAllocationDto
  ): Promise<ApiResponse<ApiQuotaAllocation>> {
    return apiClient.post<ApiQuotaAllocation>(ROUTES.QUOTA_ALLOCATIONS(planId), dto, {}, () => ({
      id: `qa-${Date.now()}`,
      productionPlanId: planId,
      productionProjectId: initialProject.id,
      allocationType: dto.allocationType,
      allocatedAmount: dto.allocatedAmount,
      remainingAmount: dto.allocatedAmount,
      status: 'ACTIVE',
      allocatedById: dto.allocatedById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  async listQuotaAllocations(planId: string): Promise<ApiResponse<ApiQuotaAllocation[]>> {
    return apiClient.get<ApiQuotaAllocation[]>(ROUTES.QUOTA_ALLOCATIONS(planId));
  }

  // ==========================================
  // BƯỚC 5: GENERATION JOBS & ASSETS (Creator / AI)
  // ==========================================

  async createGenerationJob(planId: string, dto: CreateGenerationJobDto): Promise<ApiResponse<ApiGenerationJob>> {
    return apiClient.post<ApiGenerationJob>(ROUTES.GENERATION_JOBS(planId), dto, {}, () => ({
      id: `job-${Date.now()}`,
      productionPlanId: planId,
      sceneId: dto.sceneId,
      aiModelId: dto.aiModelId,
      jobType: dto.jobType,
      attemptNumber: 1,
      status: 'RUNNING',
      createdById: dto.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  async listGenerationJobs(planId: string): Promise<ApiResponse<ApiGenerationJob[]>> {
    return apiClient.get<ApiGenerationJob[]>(ROUTES.GENERATION_JOBS(planId));
  }

  async getGenerationJob(jobId: string): Promise<ApiResponse<ApiGenerationJob>> {
    return apiClient.get<ApiGenerationJob>(ROUTES.JOB_DETAIL(jobId));
  }

  async retryGenerationJob(jobId: string): Promise<ApiResponse<ApiGenerationJob>> {
    return apiClient.post<ApiGenerationJob>(ROUTES.JOB_RETRY(jobId));
  }

  async cancelGenerationJob(jobId: string): Promise<ApiResponse<ApiGenerationJob>> {
    return apiClient.post<ApiGenerationJob>(ROUTES.JOB_CANCEL(jobId));
  }

  async createGeneratedAsset(jobId: string, dto: CreateGeneratedAssetDto): Promise<ApiResponse<ApiGeneratedAsset>> {
    return apiClient.post<ApiGeneratedAsset>(ROUTES.JOB_ASSETS(jobId), dto);
  }

  async completeGenerationJob(jobId: string, dto: CompleteGenerationJobDto): Promise<ApiResponse<ApiGenerationJob>> {
    return apiClient.post<ApiGenerationJob>(ROUTES.JOB_COMPLETE(jobId), dto);
  }

  // ==========================================
  // BƯỚC 6: ASSEMBLE EPISODE PACKAGES (Creator)
  // ==========================================

  async assemblePackage(planId: string, dto?: CreateEpisodePackageDto): Promise<ApiResponse<ApiEpisodePackage>> {
    return apiClient.post<ApiEpisodePackage>(ROUTES.PACKAGES(planId), dto, {}, () => ({
      id: `pkg-${Date.now()}`,
      productionPlanId: planId,
      packageVersion: 1,
      status: 'ASSEMBLED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  async listPackages(planId: string): Promise<ApiResponse<ApiEpisodePackage[]>> {
    return apiClient.get<ApiEpisodePackage[]>(ROUTES.PACKAGES(planId));
  }

  async getPackage(packageId: string): Promise<ApiResponse<ApiEpisodePackage>> {
    return apiClient.get<ApiEpisodePackage>(ROUTES.PACKAGE_DETAIL(packageId));
  }

  // ==========================================
  // BƯỚC 7 & 8: AI LABELS, COMPLIANCE & REVIEW (Reviewer)
  // ==========================================

  async createAiContentLabel(
    packageId: string,
    dto: CreateAiContentLabelDto
  ): Promise<ApiResponse<ApiAiContentLabel>> {
    return apiClient.post<ApiAiContentLabel>(ROUTES.PACKAGE_AI_LABELS(packageId), dto, {}, () => ({
      id: `lbl-${Date.now()}`,
      episodePackageId: packageId,
      labelType: dto.labelType,
      labelText: dto.labelText,
      displayLocation: dto.displayLocation,
      appliedById: dto.appliedById,
      policyId: dto.policyId,
      createdAt: new Date().toISOString(),
    }));
  }

  async listAiContentLabels(packageId: string): Promise<ApiResponse<ApiAiContentLabel[]>> {
    return apiClient.get<ApiAiContentLabel[]>(ROUTES.PACKAGE_AI_LABELS(packageId), {}, () => (
      Object.values(initialLabels).filter((l) => l.episode_package_id === packageId) as unknown as ApiAiContentLabel[]
    ));
  }

  async createComplianceCheck(
    packageId: string,
    dto: CreateComplianceCheckDto
  ): Promise<ApiResponse<ApiComplianceCheck>> {
    return apiClient.post<ApiComplianceCheck>(ROUTES.PACKAGE_COMPLIANCE_CHECKS(packageId), dto, {}, () => ({
      id: `chk-${Date.now()}`,
      episodePackageId: packageId,
      checkType: dto.checkType,
      policyId: dto.policyId,
      result: dto.result || 'PASS',
      checkedBySystem: dto.checkedBySystem,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  async listComplianceChecks(packageId: string): Promise<ApiResponse<ApiComplianceCheck[]>> {
    return apiClient.get<ApiComplianceCheck[]>(ROUTES.PACKAGE_COMPLIANCE_CHECKS(packageId), {}, () => (
      Object.values(initialComplianceChecks).filter((c) => c.episode_package_id === packageId) as unknown as ApiComplianceCheck[]
    ));
  }

  async decideComplianceCheck(
    checkId: string,
    dto: DecideComplianceCheckDto
  ): Promise<ApiResponse<ApiComplianceCheck>> {
    return apiClient.patch<ApiComplianceCheck>(ROUTES.COMPLIANCE_CHECK_DETAIL(checkId), dto);
  }

  async submitEpisode(packageId: string, dto: CreateEpisodeSubmissionDto): Promise<ApiResponse<unknown>> {
    return apiClient.post(ROUTES.PACKAGE_SUBMISSIONS(packageId), dto, {}, () => ({ success: true }));
  }

  async createEpisodeReview(packageId: string, dto: CreateReviewDto): Promise<ApiResponse<ApiReview>> {
    return apiClient.post<ApiReview>(ROUTES.PACKAGE_REVIEWS(packageId), dto, {}, () => ({
      id: `rev-${Date.now()}`,
      episodePackageId: packageId,
      reviewerId: dto.reviewerId,
      status: 'IN_REVIEW',
      comments: dto.comments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  async decideEpisodeReview(reviewId: string, dto: DecideReviewDto): Promise<ApiResponse<ApiReview>> {
    return apiClient.patch<ApiReview>(ROUTES.REVIEW_DETAIL(reviewId), dto, {}, () => ({
      id: reviewId,
      episodePackageId: 'pkg-ep-02',
      reviewerId: '1deebe95-e8ca-49aa-bd4d-c44489f9964f',
      status: dto.decision === 'APPROVED' ? 'APPROVED' : 'CHANGES_REQUESTED',
      comments: dto.comments,
      rejectionReason: dto.rejectionReason,
      decidedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  // ==========================================
  // BƯỚC 9: CATALOG CONVERSION (Content Manager)
  // ==========================================

  async createCatalogEntry(packageId: string, dto: CreateCatalogDto): Promise<ApiResponse<unknown>> {
    return apiClient.post(ROUTES.CATALOG_FROM_PACKAGE(packageId), dto);
  }

  // ==========================================
  // BƯỚC 10: SCHEDULE & PUBLISH (Reviewer / System)
  // ==========================================

  async createPublication(episodeId: string, dto: CreatePublicationDto): Promise<ApiResponse<ApiPublication>> {
    return apiClient.post<ApiPublication>(ROUTES.EPISODE_PUBLICATIONS(episodeId), dto, {}, () => ({
      id: `pub-${Date.now()}`,
      episodeId,
      episodePackageId: dto.packageId,
      scheduledAt: dto.scheduledAt,
      publishedById: dto.publishedById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  async publishEpisode(publicationId: string): Promise<ApiResponse<ApiPublication>> {
    return apiClient.post<ApiPublication>(ROUTES.PUBLICATION_PUBLISH(publicationId), {}, {}, () => ({
      id: publicationId,
      episodeId: 'ep-01',
      episodePackageId: 'pkg-ep-01',
      publishedAt: new Date().toISOString(),
      publishedById: '1deebe95-e8ca-49aa-bd4d-c44489f9964f',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  async unpublishEpisode(publicationId: string): Promise<ApiResponse<ApiPublication>> {
    return apiClient.post<ApiPublication>(ROUTES.PUBLICATION_UNPUBLISH(publicationId), {}, {}, () => ({
      id: publicationId,
      episodeId: 'ep-01',
      episodePackageId: 'pkg-ep-01',
      unpublishedAt: new Date().toISOString(),
      publishedById: '1deebe95-e8ca-49aa-bd4d-c44489f9964f',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}

export const workflowService = new WorkflowService();
