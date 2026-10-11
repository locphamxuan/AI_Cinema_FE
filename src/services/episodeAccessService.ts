import { apiClient, ApiResponse } from './apiClient';
import { randomId } from '@/lib/random';
import type {
  AccessDecision,
  AutoRenewState,
  MembershipPlan,
  MySubscription,
  PurchaseResult,
  SubscriptionActivation,
  SubscriptionIntent,
} from '@/types/episodeAccess';

/** Sending the same key twice charges once; one key per user action. */
const idempotent = (key: string) => ({ headers: { 'Idempotency-Key': key } });

export const episodeAccessService = {
  /** GET /episodes/:episodeId/access — may this caller (Guest or Member) watch it, and if not, how. */
  checkAccess(episodeId: string): Promise<ApiResponse<AccessDecision>> {
    return apiClient.get<AccessDecision>(`/episodes/${episodeId}/access`);
  },

  /** POST /episodes/:episodeId/purchase — unlock one episode with Coins, main before bonus. */
  purchaseEpisode(episodeId: string, key = randomId('ep-')): Promise<ApiResponse<PurchaseResult>> {
    return apiClient.post<PurchaseResult>(`/episodes/${episodeId}/purchase`, {}, idempotent(key));
  },

  /** POST /movies/:movieId/series-purchase — unlock every episode of a movie at its series price. */
  purchaseSeries(movieId: string, key = randomId('series-')): Promise<ApiResponse<PurchaseResult>> {
    return apiClient.post<PurchaseResult>(`/movies/${movieId}/series-purchase`, {}, idempotent(key));
  },

  /** GET /membership-plans — the plans on sale, free tier included. */
  getPlans(): Promise<ApiResponse<MembershipPlan[]>> {
    return apiClient.get<MembershipPlan[]>('/membership-plans');
  },

  /**
   * Joining a plan is two calls on the BE: POST /subscriptions only quotes a PENDING intent,
   * POST /subscriptions/:id/activate takes the Coins and starts the period. A wallet short of
   * Coins answers 422 on the second call and the intent stays PENDING.
   */
  async joinPlan(planId: string, key = randomId('plan-')): Promise<ApiResponse<SubscriptionActivation>> {
    const intent = await apiClient.post<SubscriptionIntent>('/subscriptions', { planId }, idempotent(`${key}:quote`));
    if (!intent.success) return { ...intent, data: null as unknown as SubscriptionActivation };
    return apiClient.post<SubscriptionActivation>(
      `/subscriptions/${intent.data.id}/activate`,
      {},
      idempotent(`${key}:pay`),
    );
  },

  /** GET /subscriptions/me — null when the member has no open plan. */
  getMySubscription(): Promise<ApiResponse<MySubscription | null>> {
    return apiClient.get<MySubscription | null>('/subscriptions/me');
  },

  /** Stop auto-renew; the BE refuses it inside the last 24 h before renewal (BR-30). */
  cancelAutoRenew(subscriptionId: string): Promise<ApiResponse<AutoRenewState>> {
    return apiClient.post<AutoRenewState>(`/subscriptions/${subscriptionId}/cancel-auto-renew`);
  },

  resumeAutoRenew(subscriptionId: string): Promise<ApiResponse<AutoRenewState>> {
    return apiClient.post<AutoRenewState>(`/subscriptions/${subscriptionId}/resume-auto-renew`);
  },
};
