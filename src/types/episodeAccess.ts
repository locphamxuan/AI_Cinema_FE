/**
 * Main Flow 2 — Episode Access & Monetization. Mirrors the BE responses of
 * src/modules/episode-access one-to-one; field names are the BE ones.
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

/** GET /episodes/:episodeId/access */
export interface AccessDecision {
  episodeId: string;
  movieId: string;
  accessGranted: boolean;
  source: AccessSourceName;
  actorType: ActorType;
  planCode?: string;
  accessMethods: AccessMethod[];
  required: AccessRequired;
  nextAction: NextAction;
}

export interface CoinSplit {
  mainCoins: number;
  bonusCoins: number;
}

/** POST /episodes/:episodeId/purchase and POST /movies/:movieId/series-purchase */
export interface PurchaseResult {
  episodeId?: string;
  movieId?: string;
  paidCoins: number;
  charged: CoinSplit;
  mainBalance: number;
  bonusBalance: number;
  access?: { source: AccessSourceName; grantedAt: string };
  accessGranted: boolean;
  unlockedEpisodes?: number;
  idempotent?: boolean;
}

/** GET /membership-plans — `features` is free-form JSON the Admin sets. */
export interface MembershipPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  period: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  durationDays: number;
  isFree: boolean;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  features: unknown;
  priceCoins: number | null;
}

/** POST /subscriptions — a quote; no Coin has moved yet. */
export interface SubscriptionIntent {
  id: string;
  planId: string;
  planCode: string;
  status: string;
  priceCoins: number;
  mainBalance: number;
  bonusBalance: number;
  enoughCoins: boolean;
  missingCoins: number;
  currentPeriodEnd: string;
}

/** POST /subscriptions/:id/activate — the first cycle is paid. */
export interface SubscriptionActivation {
  id: string;
  status: string;
  priceCoins: number;
  charged: CoinSplit;
  mainBalance: number;
  bonusBalance: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextRenewalAt: string | null;
  cycleNumber: number;
  episodeAccessGranted: boolean;
}

export type TopUpStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
export type PaymentProvider = 'VNPAY' | 'MOMO';

/** POST /wallet/top-ups, GET /wallet/top-ups/:topUpId */
export interface CoinTopUp {
  topUpId: string;
  provider: PaymentProvider | null;
  providerTxnId: string | null;
  amountVnd: number;
  coinsGranted: number;
  rateVnd: number;
  status: TopUpStatus;
  redirectUrl: string | null;
  failureReason: string | null;
  paidAt: string | null;
  expiresAt: string | null;
}

/** GET /wallet/top-ups/options */
export interface TopUpOptions {
  rateVnd: number;
  minVnd: number;
  maxVnd: number;
}

export interface ExpiringBonus {
  lotId: string;
  amount: number;
  expiresAt: string;
}

/** GET /daily-rewards/status */
export interface DailyRewardStatus {
  checkInDate: string;
  checkedInToday: boolean;
  streakDay: number;
  streakContinued: boolean;
  reward: { coins: number; bonusCoins: number };
  ladder: { streakDay: number; coins: number; bonusCoins: number }[];
  mainBalance: number;
  bonusBalance: number;
  expiringBonus: ExpiringBonus[];
}

/** POST /daily-rewards/check-in */
export interface CheckInResult {
  checkInDate: string;
  streakDay: number;
  streakContinued: boolean;
  coinsGranted: number;
  bonusGranted: number;
  mainBalance: number;
  bonusBalance: number;
}

/** GET /wallet */
export interface WalletBalance {
  mainBalance: number;
  bonusBalance: number;
  version: number;
  expiringBonus: ExpiringBonus[];
}
