/**
 * AI Cinema - Main Flow 2: Episode Access, Monetization & Payment Types
 * Aligns 1-to-1 with Backend src/modules/episode-access
 */

export type AccessSourceName =
  | 'NONE'
  | 'FREE_STARTER'
  | 'FREE'
  | 'PLAN'
  | 'EPISODE_PURCHASE'
  | 'SERIES_PURCHASE'
  | 'ADMIN_GRANT';

export type ActorType = 'GUEST' | 'MEMBER';

export type AccessMethod =
  | 'REGISTER_OR_LOGIN'
  | 'MONTHLY_PLAN'
  | 'UNLOCK_EPISODE'
  | 'UNLOCK_SERIES'
  | 'OBTAIN_COIN';

export type NextAction =
  | 'REGISTER_OR_LOGIN'
  | 'OBTAIN_COIN'
  | 'UNLOCK_EPISODE'
  | 'UNLOCK_SERIES'
  | 'MONTHLY_PLAN'
  | 'HANDOFF_TO_PLAYBACK';

export interface AccessRequired {
  coinPrice: number;
  isFreeStarter?: boolean;
  seriesCoinPrice?: number | null;
  seriesOwned?: boolean;
  monthlyPlanCoinPrice?: number | null;
  mainBalance?: number;
  bonusBalance?: number;
  enoughCoins?: boolean;
  missingCoins?: number;
  enoughForPlan?: boolean;
}

export interface AccessDecision {
  episodeId: string;
  movieId?: string;
  accessGranted: boolean;
  source: AccessSourceName;
  actorType: ActorType;
  planCode?: string;
  accessMethods: AccessMethod[];
  required: AccessRequired;
  nextAction: NextAction;
}

export interface PurchaseResult {
  episodeId?: string;
  movieId?: string;
  paidCoins: number;
  charged: { mainCoins: number; bonusCoins: number };
  mainBalance: number;
  bonusBalance: number;
  access?: { source: AccessSourceName; grantedAt: string | Date };
  accessGranted: boolean;
  unlockedEpisodes?: number;
  idempotent?: boolean;
  message?: string;
}

export interface MembershipPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  priceCoins: number;
  durationDays: number;
  badge?: string;
  features?: string[];
  isPopular?: boolean;
}

export interface CoinTopUpOrder {
  id: string;
  orderCode: string;
  provider: 'vnpay' | 'momo';
  amountVnd: number;
  coinsExpected: number;
  bonusCoinsExpected: number;
  status: 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'FAILED';
  paymentUrl?: string;
  createdAt: string;
  expiresAt: string;
}

export interface DailyRewardStatus {
  hasCheckedInToday: boolean;
  currentStreak: number;
  maxStreak: number;
  todayRewardCoins: number;
  ladder: {
    dayIndex: number;
    coins: number;
    isToday: boolean;
    isClaimed: boolean;
  }[];
}
