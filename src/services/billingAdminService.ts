import { apiClient, type ApiResponse } from './apiClient';
import { queryString } from '@/lib/query';
import type {
  AdminPlan,
  AdminSubscription,
  AdminWallet,
  ChurnReport,
  LedgerLine,
  PlanInput,
  ReportRange,
  RevenueReport,
  RewardRule,
  RewardRuleInput,
  StatementQuery,
  SubscriptionDetail,
  SubscriptionQuery,
  WalletAdjustment,
  WalletAdjustmentResult,
} from '@/types/billing';
import type { Page } from '@/types/production';

const PAGE_SIZE = 20;

/** MF-2 back office: plans and prices, members' subscriptions, the Coin ledger, rewards and reports. */
export const billingAdminService = {
  listPlans: (): Promise<ApiResponse<AdminPlan[]>> => apiClient.get<AdminPlan[]>('/admin/membership-plans'),
  createPlan: (input: PlanInput) => apiClient.post<AdminPlan>('/admin/membership-plans', input),
  updatePlan: (id: string, input: PlanInput) => apiClient.patch<AdminPlan>(`/admin/membership-plans/${id}`, input),
  /** Closes the price in force and opens a new one, from now unless `effectiveFrom` says later. */
  setPlanPrice: (id: string, priceCoins: number, effectiveFrom?: string) =>
    apiClient.post<unknown>(`/admin/membership-plans/${id}/prices`, { priceCoins, ...(effectiveFrom ? { effectiveFrom } : {}) }),

  listSubscriptions: ({ page = 1, status, planId }: SubscriptionQuery = {}): Promise<ApiResponse<Page<AdminSubscription>>> =>
    apiClient.get<Page<AdminSubscription>>(`/admin/subscriptions${queryString({ page, limit: PAGE_SIZE, status, planId })}`),
  subscription: (id: string) => apiClient.get<SubscriptionDetail>(`/admin/subscriptions/${id}`),
  cancelSubscription: (id: string, reason?: string) =>
    apiClient.post<unknown>(`/admin/subscriptions/${id}/cancel`, reason ? { reason } : {}),

  ledger: ({ page = 1, kind, entryType, walletId, from, to }: StatementQuery = {}): Promise<ApiResponse<Page<LedgerLine>>> =>
    apiClient.get<Page<LedgerLine>>(
      `/admin/coin-transactions${queryString({ page, limit: PAGE_SIZE, kind, entryType, walletId, from, to })}`,
    ),
  wallet: (userId: string) => apiClient.get<AdminWallet>(`/admin/wallets/${userId}`),
  adjustWallet: (input: WalletAdjustment) => apiClient.post<WalletAdjustmentResult>('/admin/wallet-adjustments', input),

  listRewardRules: (): Promise<ApiResponse<RewardRule[]>> => apiClient.get<RewardRule[]>('/admin/reward-rules'),
  createRewardRule: (input: RewardRuleInput) => apiClient.post<RewardRule>('/admin/reward-rules', input),
  updateRewardRule: (id: string, input: RewardRuleInput) => apiClient.patch<RewardRule>(`/admin/reward-rules/${id}`, input),

  revenue: ({ from, to }: ReportRange = {}) =>
    apiClient.get<RevenueReport>(`/admin/reports/revenue${queryString({ from, to })}`),
  churn: ({ from, to }: ReportRange = {}) => apiClient.get<ChurnReport>(`/admin/reports/churn${queryString({ from, to })}`),
};
