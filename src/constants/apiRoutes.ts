/**
 * AI Cinema - API Endpoints Registry
 */

// Same-origin by default so the Next.js rewrite in next.config.ts proxies to the backend
// and the browser never makes a cross-origin call.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const API_ROUTES = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    PROFILE: '/auth/me',
  },
  // Movies & Video
  MOVIES: {
    LIST: '/movies',
    DETAIL: (id: string) => `/movies/${id}`,
    EPISODE_SUBTITLE: (episodeId: string, language: string) => `/catalog/episodes/${episodeId}/subtitles/${language}`,
  },
  GENRES: {
    LIST: '/genres',
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
  // Accounts & permissions (Admin), member list (Staff)
  ADMIN: {
    USERS: '/users',
    USER_DETAIL: (userId: string) => `/users/${userId}`,
    PERMISSIONS: '/permissions',
    ROLES: '/roles',
    ROLE_PERMISSIONS: (role: string) => `/roles/${role}/permissions`,
  },
  // Production Workflow & Governance
  WORKFLOW: {
    // Lookups
    USERS: '/users',
    GENRES: '/genres',
    POLICIES: '/policies',
    PLATFORM_SETTINGS: '/platform-settings',

    // Production Projects
    PROJECTS: '/production-projects',
    PROJECT_DETAIL: (projectId: string) => `/production-projects/${projectId}`,
    PROJECT_CANCEL: (projectId: string) => `/production-projects/${projectId}/cancel`,

    // Milestones

    // Production Plans
    PROJECT_PLANS: (projectId: string) => `/production-projects/${projectId}/plans`,
    PLAN_DETAIL: (planId: string) => `/production-plans/${planId}`,
    PLAN_SUBMIT: (planId: string) => `/production-plans/${planId}/submit`,
    PLAN_DRAFT: (planId: string) => `/production-plans/${planId}/draft`,
    PLAN_REVISIONS: (projectId: string, planId: string) => `/production-projects/${projectId}/plans/${planId}/revisions`,
    PLAN_CONTINUITY: (planId: string) => `/production-plans/${planId}/continuity`,

    // Scenes
    SCENE_SUBMIT: (sceneId: string) => `/scenes/${sceneId}/submit`,
    SCENE_DIRECTION: (sceneId: string) => `/scenes/${sceneId}/direction`,
    SCENE_RESET: (sceneId: string) => `/scenes/${sceneId}/reset`,
    SCENE_SUGGESTIONS: (sceneId: string) => `/scenes/${sceneId}/suggestions`,

    // Plan Reviews (Per-scene pre-production review)
    PLAN_REVIEWS: (planId: string) => `/production-plans/${planId}/plan-reviews`,
    PLAN_REVIEW_DETAIL: (planReviewId: string) => `/plan-reviews/${planReviewId}`,

    // Quota Allocations
    QUOTA_ALLOCATIONS: (planId: string) => `/production-plans/${planId}/quota-allocations`,
    QUOTA_REQUESTS: (planId: string) => `/production-plans/${planId}/quota-requests`,
    QUOTA_REQUEST_APPROVE: (requestId: string) => `/quota-requests/${requestId}/approve`,
    QUOTA_REQUEST_REJECT: (requestId: string) => `/quota-requests/${requestId}/reject`,

    // Generation Jobs & Assets
    GENERATION_JOBS: (planId: string) => `/production-plans/${planId}/generation-jobs`,
    JOB_DETAIL: (jobId: string) => `/generation-jobs/${jobId}`,
    JOB_RUN: (jobId: string) => `/generation-jobs/${jobId}/run`,
    JOB_RETRY: (jobId: string) => `/generation-jobs/${jobId}/retry`,
    JOB_CANCEL: (jobId: string) => `/generation-jobs/${jobId}/cancel`,
    JOB_ASSETS: (jobId: string) => `/generation-jobs/${jobId}/generated-assets`,
    JOB_COMPLETE: (jobId: string) => `/generation-jobs/${jobId}/complete`,

    // Episode Packages & Assembly
    PACKAGES: (planId: string) => `/production-plans/${planId}/episode-packages`,
    PACKAGE_DETAIL: (packageId: string) => `/episode-packages/${packageId}`,
    PACKAGE_SUBTITLE: (packageId: string, language: string) => `/episode-packages/${packageId}/subtitles/${language}`,
    PACKAGE_SUBMISSIONS: (packageId: string) => `/episode-packages/${packageId}/submissions`,
    PACKAGE_REVIEWS: (packageId: string) => `/episode-packages/${packageId}/reviews`,
    PACKAGE_AI_LABELS: (packageId: string) => `/episode-packages/${packageId}/ai-content-labels`,
    PACKAGE_COMPLIANCE_CHECKS: (packageId: string) => `/episode-packages/${packageId}/compliance-checks`,
    PACKAGE_COMPLIANCE_REVIEWS: (packageId: string) => `/episode-packages/${packageId}/compliance-reviews`,

    // AI model routing (BR-40)
    AI_MODEL_ROUTING: '/ai-models/routing',
    AI_MODEL_ROUTE: '/ai-models/route',

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

