/** MF-2 billing as the BE answers it: Coin ledger, plans, subscriptions, reports, reward rules. */

export type CoinEntryType =
  | 'TOP_UP'
  | 'SIGNUP_BONUS'
  | 'DAILY_REWARD'
  | 'EPISODE_PURCHASE'
  | 'REWARD_SPIN'
  | 'PLAN_PAYMENT'
  | 'PLAN_RENEWAL'
  | 'REFUND'
  | 'BONUS_EXPIRY'
  | 'ADJUSTMENT';

export type StatementKind = 'ALL' | 'MAIN' | 'BONUS';

/** GET /wallet/statements - one ledger line with the balances right after it. */
export interface StatementLine {
  id: string;
  entryType: CoinEntryType;
  mainAmount: number;
  bonusAmount: number;
  rateVnd: number | null;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
  mainBalanceAfter: number;
  bonusBalanceAfter: number;
}

/** GET /admin/coin-transactions - a line of any wallet. */
export interface LedgerLine extends StatementLine {
  walletId: string;
  userId: string;
}

export interface StatementQuery {
  page?: number;
  kind?: StatementKind;
  entryType?: CoinEntryType;
  walletId?: string;
  from?: string;
  to?: string;
}

export interface CoinLot {
  id: string;
  source: string;
  originalAmount: number;
  remainingAmount: number;
  expiresAt: string;
}

/** GET /admin/wallets/:userId */
export interface AdminWallet {
  id: string;
  userId: string;
  mainBalance: number;
  bonusBalance: number;
  updatedAt: string;
  lots: CoinLot[];
}

/** POST /admin/wallet-adjustments */
export interface WalletAdjustment {
  userId: string;
  mainAmount?: number;
  bonusAmount?: number;
  reason: string;
}

export interface WalletAdjustmentResult extends Required<WalletAdjustment> {
  transactionId: string;
  mainBalance: number;
  bonusBalance: number;
}

export type PlanPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

/** GET /admin/membership-plans */
export interface AdminPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  period: PlanPeriod;
  durationDays: number;
  isFree: boolean;
  isActive: boolean;
  sortOrder: number;
  isFeatured: boolean;
  features: Record<string, unknown> | null;
  priceCoins: number | null;
}

export interface PlanInput {
  code?: string;
  name?: string;
  description?: string;
  period?: PlanPeriod;
  durationDays?: number;
  isFree?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
export type SubscriptionEndReason = 'CANCELLED_BY_MEMBER' | 'CANCELLED_BY_ADMIN' | 'PAYMENT_FAILED' | 'NOT_RENEWED';

/** GET /admin/subscriptions row. */
export interface AdminSubscription {
  id: string;
  status: SubscriptionStatus;
  source: 'PURCHASE' | 'REWARD';
  autoRenew: boolean;
  priceCoins: number;
  startedAt: string;
  currentPeriodEnd: string;
  nextRenewalAt: string | null;
  endedAt: string | null;
  endReason: SubscriptionEndReason | null;
  renewalsCompleted: number;
  createdAt: string;
  plan: { id: string; code: string; name: string };
  user: { id: string; fullName: string; email: string };
}

export interface SubscriptionCycle {
  id: string;
  cycleNumber: number;
  periodStart: string;
  periodEnd: string;
  priceCoins: number;
  status: 'PAID' | 'FAILED' | 'SKIPPED';
  mainCoinsCharged: number;
  bonusCoinsCharged: number;
  failureReason: string | null;
  attemptedAt: string;
}

/** GET /admin/subscriptions/:id */
export interface SubscriptionDetail extends AdminSubscription {
  cycles: SubscriptionCycle[];
}

export interface SubscriptionQuery {
  page?: number;
  status?: SubscriptionStatus;
  planId?: string;
}

/** GET /admin/reports/revenue */
export interface RevenueReport {
  from: string;
  to: string;
  totals: { paidCycles: number; coins: number; mainCoins: number; bonusCoins: number };
  byPlan: { plan: { id: string; code: string; name: string }; cycles: number; coins: number; mainCoins: number; bonusCoins: number }[];
}

/** GET /admin/reports/churn */
export interface ChurnReport {
  from: string;
  to: string;
  started: number;
  renewed: number;
  ended: number;
  cancelledByMember: number;
  cancelledByAdmin: number;
  expiredForPayment: number;
  expiredUnused: number;
  failedRenewals: number;
  running: number;
  churnRate: number;
}

export interface ReportRange {
  from?: string;
  to?: string;
}

/** GET /admin/reward-rules - one rung of the check-in streak ladder (BR-05). */
export interface RewardRule {
  id: string;
  code: string;
  name: string;
  streakDay: number;
  bonusCoins: number;
  grantsSpin: boolean;
  isActive: boolean;
}

export interface RewardRuleInput {
  code?: string;
  name?: string;
  streakDay?: number;
  bonusCoins?: number;
  grantsSpin?: boolean;
  isActive?: boolean;
}
