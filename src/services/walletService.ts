import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { WalletState } from '@/types/wallet';
import type { WalletBalance } from '@/types/episodeAccess';
import type { StatementLine, StatementQuery } from '@/types/billing';
import type { Page } from '@/types/production';
import { queryString } from '@/lib/query';

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

  /** GET /wallet/statements — the member's own Coin ledger, newest first, with running balances. */
  getStatements(query: StatementQuery = {}): Promise<ApiResponse<Page<StatementLine>>> {
    const { page = 1, kind, entryType, from, to } = query;
    return apiClient.get<Page<StatementLine>>(
      `${API_ROUTES.WALLET.STATEMENTS}${queryString({ page, limit: 20, kind, entryType, from, to })}`,
    );
  },
};
