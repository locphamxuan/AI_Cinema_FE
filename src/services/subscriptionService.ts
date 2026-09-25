/**
 * AI Cinema - Subscription & VIP Plan Service (Connected to Database)
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { SubscriptionPlan, UserSubscription } from '@/types/subscription';

export const subscriptionService = {
  async getPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return apiClient.get<SubscriptionPlan[]>(API_ROUTES.SUBSCRIPTIONS.PLANS);
  },

  async getCurrentSubscription(): Promise<ApiResponse<UserSubscription>> {
    return apiClient.get<UserSubscription>(API_ROUTES.SUBSCRIPTIONS.CURRENT);
  },

  async toggleAutoRenew(currentSubscription: UserSubscription): Promise<ApiResponse<UserSubscription>> {
    return apiClient.post<UserSubscription>(
      API_ROUTES.SUBSCRIPTIONS.AUTO_RENEW,
      { autoRenew: !currentSubscription.autoRenew }
    );
  },

  async cancelSubscription(): Promise<ApiResponse<UserSubscription>> {
    return apiClient.post<UserSubscription>(
      API_ROUTES.SUBSCRIPTIONS.CANCEL,
      {}
    );
  },

  checkIsExpiringWithin24Hours(expiresAt: string): boolean {
    try {
      const expTime = new Date(expiresAt).getTime();
      const now = Date.now();
      const diffHours = (expTime - now) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 24;
    } catch {
      return false;
    }
  },
};
