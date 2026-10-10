import { apiClient, ApiResponse } from './apiClient';
import type { AccessDecision, PurchaseResult, MembershipPlan } from '@/types/episodeAccess';

function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'idemp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
}

export const episodeAccessService = {
  /**
   * Evaluates caller's access to an episode (Guest or Member).
   * Maps to GET /api/episodes/:episodeId/access
   */
  async checkAccess(episodeId: string): Promise<ApiResponse<AccessDecision>> {
    return apiClient.get<AccessDecision>(`/episodes/${episodeId}/access`);
  },

  /**
   * Unlocks a single episode using Coins (main coin deducted first, then bonus coin).
   * Maps to POST /api/episodes/:episodeId/purchase
   */
  async purchaseEpisode(
    episodeId: string,
    idempotencyKey: string = generateIdempotencyKey()
  ): Promise<ApiResponse<PurchaseResult>> {
    return apiClient.post<PurchaseResult>(
      `/episodes/${episodeId}/purchase`,
      {},
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      }
    );
  },

  /**
   * Purchases an entire series/season at a bundle discount.
   * Maps to POST /api/movies/:movieId/purchase
   */
  async purchaseSeries(
    movieId: string,
    idempotencyKey: string = generateIdempotencyKey()
  ): Promise<ApiResponse<any>> {
    return apiClient.post(
      `/movies/${movieId}/purchase`,
      {},
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      }
    );
  },

  /**
   * Fetches active Membership Plans (Monthly Plan, etc.).
   * Maps to GET /api/membership-plans
   */
  async getPlans(): Promise<ApiResponse<MembershipPlan[]>> {
    return apiClient.get<MembershipPlan[]>('/membership-plans');
  },

  /**
   * Quotes and activates a subscription plan using Coins.
   * Maps to POST /api/subscriptions
   */
  async subscribePlan(
    planId: string,
    idempotencyKey: string = generateIdempotencyKey()
  ): Promise<ApiResponse<any>> {
    return apiClient.post(
      '/subscriptions',
      { planId },
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      }
    );
  },
};
