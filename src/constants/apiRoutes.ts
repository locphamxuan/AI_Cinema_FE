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
    SEASON_EPISODES: (seasonId: string) => `/seasons/${seasonId}/episodes`,
    EPISODE: (episodeId: string) => `/episodes/${episodeId}`,
    IDEA_FILES: (movieId: string) => `/projects/${movieId}/idea-files`,
    IDEA_FILE: (movieId: string, fileId: string) => `/projects/${movieId}/idea-files/${fileId}`,
    IDEA_FILE_CONTENT: (movieId: string, fileId: string) => `/projects/${movieId}/idea-files/${fileId}/content`,
    FEE: (movieId: string) => `/projects/${movieId}/fee`,
    FEE_ENTRIES: (movieId: string) => `/projects/${movieId}/fee/entries`,
    CHANGE_REQUESTS: (movieId: string) => `/projects/${movieId}/change-requests`,
    CHANGE_REQUEST_ACCEPT: (id: string) => `/change-requests/${id}/accept`,
    CHANGE_REQUEST_REJECT: (id: string) => `/change-requests/${id}/reject`,
    HANDOFF: (movieId: string) => `/projects/${movieId}/handoff`,
    STUDIO_CHANGE: (movieId: string) => `/projects/${movieId}/studio-change`,
    HANDOFFS: (movieId: string) => `/projects/${movieId}/handoffs`,
    BRIEF: (movieId: string, handoffId: string) => `/projects/${movieId}/handoffs/${handoffId}/brief`,
    PORTAL_LINK: (movieId: string) => `/projects/${movieId}/handoffs/portal-link`,
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
  // The outside studio's portal: no account, the emailed link token is the credential
  STUDIO_PORTAL: {
    OVERVIEW: (token: string) => `/studio-portal/${token}`,
    RESPOND: (token: string) => `/studio-portal/${token}/response`,
    BRIEF: (token: string) => `/studio-portal/${token}/brief`,
    IDEA_FILE: (token: string, fileId: string) => `/studio-portal/${token}/idea-files/${fileId}`,
    MEDIA: (token: string, episodeId: string) => `/studio-portal/${token}/episodes/${episodeId}/media`,
    MEDIA_UPLOAD: (token: string, episodeId: string) => `/studio-portal/${token}/episodes/${episodeId}/media/upload`,
  },
} as const;

