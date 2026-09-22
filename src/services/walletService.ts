/**
 * AI Cinema - Dual-Wallet & Reward Service (Connected to Database)
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { WalletState, CheckInStreak } from '@/types/wallet';
import { Transaction } from '@/types/transaction';
import { mockCheckInStreak, mockTransactions } from '@/mocks/mockData';

export interface UnlockEpisodeResult {
  success: boolean;
  message: string;
  deductedFrom: 'main' | 'bonus' | 'split';
  mainDeducted: number;
  bonusDeducted: number;
  newBalance: WalletState;
}

export const walletService = {
  async getBalance(): Promise<ApiResponse<WalletState>> {
    return apiClient.get<WalletState>(API_ROUTES.WALLET.BALANCE, {}, () => ({ mainCoin: 120, bonusCoin: 100 }));
  },

  async getCheckInStreak(): Promise<ApiResponse<CheckInStreak>> {
    return apiClient.get<CheckInStreak>(API_ROUTES.WALLET.STREAK, {}, () => mockCheckInStreak);
  },

  async claimDailyReward(_currentStreak?: CheckInStreak, _currentWallet?: WalletState): Promise<ApiResponse<{ streak: CheckInStreak; wallet: WalletState; reward: number }>> {
    return apiClient.post<{ streak: CheckInStreak; wallet: WalletState; reward: number }>(
      API_ROUTES.WALLET.CHECK_IN,
      {},
      {},
      () => {
        const streak = _currentStreak || mockCheckInStreak;
        const wallet = _currentWallet || { mainCoin: 120, bonusCoin: 100 };
        return {
          streak: { ...streak, currentStreak: streak.currentStreak + 1, todayClaimed: true },
          wallet: { ...wallet, bonusCoin: wallet.bonusCoin + 10 },
          reward: 10,
        };
      }
    );
  },

  async unlockEpisode(
    movieId: string,
    episodeId: string,
    price: number,
    _currentWallet?: WalletState
  ): Promise<ApiResponse<UnlockEpisodeResult>> {
    return apiClient.post<UnlockEpisodeResult>(
      API_ROUTES.WALLET.UNLOCK_EPISODE,
      { movieId, episodeId, price },
      {},
      () => {
        const wallet = _currentWallet || { mainCoin: 120, bonusCoin: 100 };
        const totalCoins = wallet.mainCoin + wallet.bonusCoin;
        if (totalCoins < price) {
          throw new Error('Số dư coin không đủ để mở khóa tập phim này.');
        }

        let mainDeducted = 0;
        let bonusDeducted = 0;
        let deductedFrom: 'main' | 'bonus' | 'split' = 'main';

        if (wallet.mainCoin >= price) {
          mainDeducted = price;
          deductedFrom = 'main';
        } else {
          mainDeducted = wallet.mainCoin;
          bonusDeducted = price - mainDeducted;
          deductedFrom = mainDeducted > 0 ? 'split' : 'bonus';
        }

        return {
          success: true,
          message: 'Mở khóa tập phim thành công!',
          deductedFrom,
          mainDeducted,
          bonusDeducted,
          newBalance: {
            mainCoin: wallet.mainCoin - mainDeducted,
            bonusCoin: wallet.bonusCoin - bonusDeducted,
          },
        };
      }
    );
  },

  async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    return apiClient.get<Transaction[]>(API_ROUTES.WALLET.TRANSACTIONS, {}, () => mockTransactions);
  },
};
