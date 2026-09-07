/**
 * AI Cinema - Coin & Subscription Pricing Constants
 */

export const COIN_CONFIG = {
  DEFAULT_EPISODE_UNLOCK_PRICE: 20, // 20 coins/tập
  DAILY_CHECK_IN_BASE_REWARD: 10,   // 10 coins/ngày
  STREAK_BONUS_DAY_7: 50,          // 50 coins ngày 7
} as const;

export const SUBSCRIPTION_TIERS = {
  STANDARD: {
    id: 'plan_standard',
    name: 'Gói Tiêu Chuẩn (Standard)',
    price: 99000, // 99,000 VND / tháng
    resolution: '1080p Full HD',
    simultaneousStreams: 2,
    bonusCoinMonthly: 50,
    hasVipBadge: false,
  },
  VIP_PREMIUM: {
    id: 'plan_vip_premium',
    name: 'Gói VIP Cinema 4K',
    price: 199000, // 199,000 VND / tháng
    resolution: '4K UHD + HDR10+ + Dolby Atmos',
    simultaneousStreams: 4,
    bonusCoinMonthly: 200,
    hasVipBadge: true,
  },
} as const;
