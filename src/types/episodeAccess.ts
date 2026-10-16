/**
 * Main Flow 2 - Episode Access & Monetization. Mirrors the BE responses of
 * src/modules/episode-access one-to-one; field names are the BE ones.
 */

export type AccessSourceName =
  | 'NONE'
  | 'FREE_STARTER'
  | 'FREE'
  | 'PLAN'
  | 'EPISODE_PURCHASE'
  | 'ADMIN_GRANT';

export type ActorType = 'GUEST' | 'MEMBER';

export type AccessMethod =
  | 'REGISTER_OR_LOGIN'
  | 'MONTHLY_PLAN'
  | 'UNLOCK_EPISODE'
  | 'OBTAIN_COIN';

export type NextAction =
  | 'REGISTER_OR_LOGIN'
  | 'OBTAIN_COIN'
  | 'UNLOCK_EPISODE'
  | 'MONTHLY_PLAN'
  | 'HANDOFF_TO_PLAYBACK';

export interface AccessRequired {
  coinPrice: number;
  isFreeStarter?: boolean;
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
  /** What the player loads (HLS or MP4); only present when access is granted. */
  streamUrl?: string;
  nextAction: NextAction;
}

export interface CoinSplit {
  mainCoins: number;
  bonusCoins: number;
}

/** POST /episodes/:episodeId/purchase */
export interface PurchaseResult {
  episodeId?: string;
  paidCoins: number;
  charged: CoinSplit;
  mainBalance: number;
  bonusBalance: number;
  access?: { source: AccessSourceName; grantedAt: string };
  accessGranted: boolean;
  idempotent?: boolean;
}

/** GET /membership-plans - `features` is free-form JSON the Admin sets. */
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

/** POST /subscriptions - a quote; no Coin has moved yet. */
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

/** POST /subscriptions/:id/activate - the first cycle is paid. */
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

/** GET /subscriptions/me - the open plan (PENDING = quoted, not paid), or null. */
export interface MySubscription {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'PAST_DUE';
  autoRenew: boolean;
  priceCoins: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextRenewalAt: string | null;
  cancelDeadline: string | null;
  plan: { id: string; code: string; name: string; durationDays: number };
}

/** POST /subscriptions/:id/cancel-auto-renew | resume-auto-renew */
export interface AutoRenewState {
  id: string;
  autoRenew: boolean;
  nextRenewalAt: string | null;
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

export interface RewardLadderStep {
  streakDay: number;
  bonusCoins: number;
  grantsSpin: boolean;
}

/** GET /daily-rewards/status */
export interface DailyRewardStatus {
  checkInDate: string;
  checkedInToday: boolean;
  streakDay: number;
  streakContinued: boolean;
  reward: { bonusCoins: number; grantsSpin: boolean };
  ladder: RewardLadderStep[];
  availableSpins: number;
  mainBalance: number;
  bonusBalance: number;
  expiringBonus: ExpiringBonus[];
}

/** POST /daily-rewards/check-in */
export interface CheckInResult {
  checkInDate: string;
  streakDay: number;
  streakContinued: boolean;
  bonusGranted: number;
  spinGranted: boolean;
  mainBalance: number;
  bonusBalance: number;
}

export type RewardPrizeType = 'BONUS_COIN' | 'PLAN_DAYS';

export interface RewardPrize {
  id: string;
  code: string;
  name: string;
  type: RewardPrizeType;
  bonusCoins: number | null;
  planDays: number | null;
  weight?: number;
  chancePercent?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface RewardSpinHistoryItem {
  id: string;
  status: 'AVAILABLE' | 'USED' | 'EXPIRED';
  grantedAt: string;
  spunAt: string | null;
  prize: RewardPrize | null;
  bonusCoins: number | null;
  planDays: number | null;
}

/** GET /rewards/spins */
export interface RewardWheelStatus {
  availableSpins: number;
  prizes: RewardPrize[];
  history: RewardSpinHistoryItem[];
}

/** POST /rewards/spins */
export interface SpinResult {
  id: string;
  status: string;
  grantedAt: string;
  spunAt: string;
  prize: RewardPrize;
  bonusCoins: number | null;
  planDays: number | null;
  planActiveUntil: string | null;
  mainBalance: number;
  bonusBalance: number;
  availableSpins: number;
}

/** GET /wallet */
export interface WalletBalance {
  mainBalance: number;
  bonusBalance: number;
  version: number;
  expiringBonus: ExpiringBonus[];
}
