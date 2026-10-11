import { apiClient, ApiResponse } from './apiClient';
import type { CoinTopUp, PaymentProvider, TopUpOptions } from '@/types/episodeAccess';

export const coinTopUpService = {
  /** GET /wallet/top-ups/options — the Admin's VND-per-Coin rate and accepted range. */
  getOptions(): Promise<ApiResponse<TopUpOptions>> {
    return apiClient.get<TopUpOptions>('/wallet/top-ups/options');
  },

  /** POST /wallet/top-ups — opens an order and the gateway payment; `redirectUrl` is where to send the member. */
  createTopUp(provider: PaymentProvider, amountVnd: number): Promise<ApiResponse<CoinTopUp>> {
    return apiClient.post<CoinTopUp>('/wallet/top-ups', { provider, amountVnd });
  },

  /** GET /wallet/top-ups/:topUpId — the order as the gateway left it; the IPN settles it in the background. */
  getOrder(topUpId: string): Promise<ApiResponse<CoinTopUp>> {
    return apiClient.get<CoinTopUp>(`/wallet/top-ups/${topUpId}`);
  },
};
