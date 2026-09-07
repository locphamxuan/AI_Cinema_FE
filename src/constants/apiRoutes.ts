/**
 * AI Cinema - API Endpoints Registry
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

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
} as const;
