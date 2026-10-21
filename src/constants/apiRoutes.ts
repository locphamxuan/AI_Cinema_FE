/**
 * AI Cinema - API Endpoints Registry
 */

// Same-origin by default so the Next.js rewrite or route handlers proxy to the backend
// and the browser never makes a cross-origin call or fails if port 3001 is offline.
// A relative value ("api") is rooted, or pages like /watch/:id would call /watch/api/...
export function resolveApiBaseUrl(configured: string | undefined): string {
  if (!configured || configured.includes('3001')) return '/api';
  return /^https?:\/\//.test(configured) || configured.startsWith('/') ? configured : `/${configured}`;
}

export const API_BASE_URL = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

export const API_ROUTES = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    PROFILE: '/auth/me',
    CHANGE_PASSWORD: '/auth/me/password',
  },
  // Movies & Video
  MOVIES: {
    LIST: '/movies',
    DETAIL: (id: string) => `/movies/${id}`,
    EPISODES: (id: string) => `/movies/${id}/episodes`,
  },
  GENRES: {
    LIST: '/genres',
  },
  // Wallet & Coin (MF-2)
  WALLET: {
    BALANCE: '/wallet',
    CHECK_IN: '/daily-rewards/check-in',
    STREAK: '/daily-rewards/status',
    AFFORDABILITY: '/wallet/affordability',
    TOP_UPS: '/wallet/top-ups',
    STATEMENTS: '/wallet/statements',
    TRANSACTIONS: '/wallet/statements',
    UNLOCK_EPISODE: (episodeId: string) => `/episodes/${episodeId}/purchase`,
    ACCESS: (episodeId: string) => `/episodes/${episodeId}/access`,
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
  STUDIOS: {
    LIST: '/studios',
    DETAIL: (studioId: string) => `/studios/${studioId}`,
  },
  PLATFORM_SETTINGS: '/platform-settings',
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    READ_ALL: '/notifications/read-all',
    READ: (id: string) => `/notifications/${id}/read`,
  },
  // MF-1: movie projects ordered from outside studios, steps 1–16
  PRODUCTION: {
    PROJECTS: '/projects',
    PROJECT: (movieId: string) => `/projects/${movieId}`,
    ASSIGN: (movieId: string) => `/projects/${movieId}/assign`,
    CANCEL: (movieId: string) => `/projects/${movieId}/cancel`,
    EVENTS: (movieId: string) => `/projects/${movieId}/events`,
    SEASONS: (movieId: string) => `/projects/${movieId}/seasons`,
    SEASON: (seasonId: string) => `/seasons/${seasonId}`,
    SEASON_EPISODES: (seasonId: string) => `/seasons/${seasonId}/episodes`,
    POSTER: (movieId: string) => `/projects/${movieId}/poster`,
    EPISODE_THUMBNAIL: (episodeId: string) => `/episodes/${episodeId}/thumbnail`,
    EPISODE_ASSIGNEE: (episodeId: string) => `/episodes/${episodeId}/assignee`,
    CREATOR_DIRECTORY: '/creators',
    CREATORS: (movieId: string) => `/projects/${movieId}/creators`,
    CREATOR: (movieId: string, creatorId: string) => `/projects/${movieId}/creators/${creatorId}`,
    DELEGATIONS: (movieId: string) => `/projects/${movieId}/delegations`,
    EPISODE: (episodeId: string) => `/episodes/${episodeId}`,
    IDEA_FILES: (movieId: string) => `/projects/${movieId}/idea-files`,
    IDEA_FILE: (movieId: string, fileId: string) => `/projects/${movieId}/idea-files/${fileId}`,
    IDEA_FILE_CONTENT: (movieId: string, fileId: string) => `/projects/${movieId}/idea-files/${fileId}/content`,
    FEE: (movieId: string) => `/projects/${movieId}/fee`,
    FEE_ENTRIES: (movieId: string) => `/projects/${movieId}/fee/entries`,
    CHANGE_REQUESTS: (movieId: string) => `/projects/${movieId}/change-requests`,
    CHANGE_REQUEST_INBOX: '/change-requests',
    CHANGE_REQUEST_PROOF: (id: string) => `/change-requests/${id}/proof`,
    CHANGE_REQUEST_APPROVE: (id: string) => `/change-requests/${id}/approve`,
    CHANGE_REQUEST_REJECT: (id: string) => `/change-requests/${id}/reject`,
    TOKEN_REQUESTS: (movieId: string) => `/projects/${movieId}/token-requests`,
    TOKEN_REQUEST_INBOX: '/token-requests',
    TOKEN_REQUEST_APPROVE: (id: string) => `/token-requests/${id}/approve`,
    TOKEN_REQUEST_REJECT: (id: string) => `/token-requests/${id}/reject`,
    HANDOFF: (movieId: string) => `/projects/${movieId}/handoff`,
    STUDIO_CHANGE: (movieId: string) => `/projects/${movieId}/studio-change`,
    HANDOFFS: (movieId: string) => `/projects/${movieId}/handoffs`,
    BRIEF: (movieId: string, handoffId: string) => `/projects/${movieId}/handoffs/${handoffId}/brief`,
    MILESTONE: (movieId: string, handoffId: string) => `/projects/${movieId}/handoffs/${handoffId}/milestone`,
    MATERIAL: (movieId: string, handoffId: string, materialId: string) =>
      `/projects/${movieId}/handoffs/${handoffId}/materials/${materialId}/content`,
    EPISODE_MEDIA: (episodeId: string) => `/episodes/${episodeId}/media`,
    EPISODE_MEDIA_UPLOAD: (episodeId: string) => `/episodes/${episodeId}/media/upload`,
    MEDIA_ASSET: (id: string) => `/media-assets/${id}`,
    MEDIA_RETRY: (id: string) => `/media-assets/${id}/retry`,
    REVIEW_SHEET: (id: string) => `/media-assets/${id}/review-sheet`,
    REVIEWS: (id: string) => `/media-assets/${id}/reviews`,
    AI_LABELS: (id: string) => `/media-assets/${id}/ai-content-labels`,
    COMPLIANCE: (id: string) => `/media-assets/${id}/compliance-checks`,
    COIN_PRICE: (episodeId: string) => `/episodes/${episodeId}/coin-price`,
    PUBLICATIONS: (episodeId: string) => `/episodes/${episodeId}/publications`,
    UNPUBLISH: (publicationId: string) => `/publications/${publicationId}/unpublish`,
    PRICE_ALERTS: '/admin/price-alerts',
    PRICE_ALERT_REQUEST_CHANGE: (id: string) => `/admin/price-alerts/${id}/request-change`,
    PRICE_ALERT_RESOLVE: (id: string) => `/admin/price-alerts/${id}/resolve`,
  },
  // Token budget: the Reviewer's own wallet, and the Admin's grants
  REVIEWER_TOKENS: {
    ME: '/reviewer-tokens/me',
    ADMIN_LIST: '/admin/reviewer-tokens',
    ADMIN_WALLET: (reviewerId: string) => `/admin/reviewer-tokens/${reviewerId}`,
    ADMIN_ENTRIES: (reviewerId: string) => `/admin/reviewer-tokens/${reviewerId}/entries`,
  },
} as const;

