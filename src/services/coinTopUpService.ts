import { apiClient, ApiResponse } from './apiClient';

export interface TopUpOrderResponse {
  id: string;
  amountVnd: number;
  coinsGranted: number;
  status: string;
  expiresAt: string;
  createdAt: string;
  payment?: {
    id: string;
    provider: 'vnpay' | 'momo';
    providerTxnId: string;
    amountVnd: number;
    redirectUrl?: string;
    status: string;
  };
}

export const coinTopUpService = {
  /**
   * Starts a Coin Top-up order and generates gateway payment redirect URL (VNPay/MoMo).
   * Maps to POST /api/wallet/top-ups
   */
  async createTopUp(
    provider: 'vnpay' | 'momo' | 'VNPAY' | 'MOMO',
    amountVnd: number
  ): Promise<ApiResponse<TopUpOrderResponse>> {
    return apiClient.post<TopUpOrderResponse>('/wallet/top-ups', {
      provider: provider.toUpperCase() as 'VNPAY' | 'MOMO',
      amountVnd,
    });
  },

  /**
   * Retrieves list of top-up orders for the authenticated member.
   * Maps to GET /api/wallet/top-ups
   */
  async getMyOrders(): Promise<ApiResponse<any>> {
    return apiClient.get('/wallet/top-ups');
  },

  /**
   * Looks up a specific top-up order status.
   * Maps to GET /api/wallet/top-ups/:topUpId
   */
  async getOrder(topUpId: string): Promise<ApiResponse<TopUpOrderResponse>> {
    return apiClient.get<TopUpOrderResponse>(`/wallet/top-ups/${topUpId}`);
  },
};
