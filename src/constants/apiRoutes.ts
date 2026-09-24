/**
 * AI Cinema - API Endpoints Registry
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const API_ROUTES = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    PROFILE: '/auth/profile',
  },
  // Movies & Video
  MOVIES: {
    LIST: '/movies',
    DETAIL: (id: string) => `/movies/${id}`,
    FEATURED: '/movies/featured',
    CATEGORIES: '/movies/categories',
    VERSIONS: (movieId: string, episodeId: string) => `/movies/${movieId}/episodes/${episodeId}/versions`,
    COMPLIANCE: (movieId: string) => `/movies/${movieId}/compliance`,
  },
  // Wallet & Coin
  WALLET: {
    BALANCE: '/wallet/balance',
    CHECK_IN: '/wallet/check-in',
    STREAK: '/wallet/check-in-streak',
    UNLOCK_EPISODE: '/wallet/unlock-episode',
    TRANSACTIONS: '/wallet/transactions',
  },
  // Subscriptions
  SUBSCRIPTIONS: {
    PLANS: '/subscriptions/plans',
    CURRENT: '/subscriptions/current',
    UPGRADE: '/subscriptions/upgrade',
    CANCEL: '/subscriptions/cancel',
    AUTO_RENEW: '/subscriptions/auto-renew',
  },
  // Chat & Support
  CHAT: {
    SEND_MESSAGE: '/chat/message',
    CONVERSATION: '/chat/conversation',
    ESCALATE: '/chat/escalate',
  },
  // Production Workflow & Governance
  WORKFLOW: {
    // Lookups
    USERS: '/users',
    GENRES: '/genres',
    POLICIES: '/policies',

    // Production Projects
    PROJECTS: '/production-projects',
    PROJECT_DETAIL: (projectId: string) => `/production-projects/${projectId}`,
    PROJECT_CANCEL: (projectId: string) => `/production-projects/${projectId}/cancel`,
    PROJECT_MILESTONES: (projectId: string) => `/production-projects/${projectId}/milestones`,

    // Milestones
    MILESTONE_DETAIL: (milestoneId: string) => `/milestones/${milestoneId}`,

    // Production Plans
    PROJECT_PLANS: (projectId: string) => `/production-projects/${projectId}/plans`,
    PLAN_DETAIL: (planId: string) => `/production-plans/${planId}`,
    PLAN_SUBMIT: (planId: string) => `/production-plans/${planId}/submit`,
    PLAN_REVISIONS: (projectId: string, planId: string) => `/production-projects/${projectId}/plans/${planId}/revisions`,
    PLAN_SCENES: (planId: string) => `/production-plans/${planId}/scenes`,

    // Scenes
    SCENE_DETAIL: (sceneId: string) => `/scenes/${sceneId}`,
    SCENE_SUBMIT: (sceneId: string) => `/scenes/${sceneId}/submit`,

    // Plan Reviews (Per-scene pre-production review)
    PLAN_REVIEWS: (planId: string) => `/production-plans/${planId}/plan-reviews`,
    PLAN_REVIEW_DETAIL: (planReviewId: string) => `/plan-reviews/${planReviewId}`,

    // Quota Allocations
    QUOTA_ALLOCATIONS: (planId: string) => `/production-plans/${planId}/quota-allocations`,

    // Generation Jobs & Assets
    GENERATION_JOBS: (planId: string) => `/production-plans/${planId}/generation-jobs`,
    JOB_DETAIL: (jobId: string) => `/generation-jobs/${jobId}`,
    JOB_RETRY: (jobId: string) => `/generation-jobs/${jobId}/retry`,
    JOB_CANCEL: (jobId: string) => `/generation-jobs/${jobId}/cancel`,
    JOB_ASSETS: (jobId: string) => `/generation-jobs/${jobId}/generated-assets`,
    JOB_COMPLETE: (jobId: string) => `/generation-jobs/${jobId}/complete`,

    // Episode Packages & Assembly
    PACKAGES: (planId: string) => `/production-plans/${planId}/episode-packages`,
    PACKAGE_DETAIL: (packageId: string) => `/episode-packages/${packageId}`,
    PACKAGE_SUBMISSIONS: (packageId: string) => `/episode-packages/${packageId}/submissions`,
    PACKAGE_REVIEWS: (packageId: string) => `/episode-packages/${packageId}/reviews`,
    PACKAGE_AI_LABELS: (packageId: string) => `/episode-packages/${packageId}/ai-content-labels`,
    PACKAGE_COMPLIANCE_CHECKS: (packageId: string) => `/episode-packages/${packageId}/compliance-checks`,

    // Review & Compliance Decisions
    REVIEW_DETAIL: (reviewId: string) => `/reviews/${reviewId}`,
    COMPLIANCE_CHECK_DETAIL: (checkId: string) => `/compliance-checks/${checkId}`,

    // Catalog & Final Movie Conversion
    CATALOG_FROM_PACKAGE: (packageId: string) => `/episode-packages/${packageId}/catalog`,
    MOVIES: '/movies',
    MOVIE_DETAIL: (movieId: string) => `/movies/${movieId}`,
    CATALOG_EPISODE_DETAIL: (episodeId: string) => `/catalog/episodes/${episodeId}`,

    // Publications
    EPISODE_PUBLICATIONS: (episodeId: string) => `/episodes/${episodeId}/publications`,
    PUBLICATION_PUBLISH: (publicationId: string) => `/publications/${publicationId}/publish`,
    PUBLICATION_UNPUBLISH: (publicationId: string) => `/publications/${publicationId}/unpublish`,
  },
} as const;

