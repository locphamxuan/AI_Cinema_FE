import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { WalletState } from '@/types/wallet';
import type { WalletBalance } from '@/types/episodeAccess';

export const walletService = {
  /** GET /wallet — the dual balance (main Coins from top-ups, bonus Coins from rewards). */
  async getBalance(): Promise<ApiResponse<WalletState>> {
    const res = await apiClient.get<WalletBalance>(API_ROUTES.WALLET.BALANCE, {}, () => ({
      mainBalance: 0,
      bonusBalance: 0,
      version: 0,
      expiringBonus: [],
    }));
    if (!res.success || !res.data) {
      return { ...res, success: false, data: { mainCoin: 0, bonusCoin: 0 } };
    }
    return { ...res, data: { mainCoin: res.data.mainBalance, bonusCoin: res.data.bonusBalance } };
  },
};
