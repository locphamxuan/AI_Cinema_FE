/**
 * AI Cinema - Dual-Wallet & Reward Service
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
    return apiClient.get<WalletState>(
      API_ROUTES.WALLET.BALANCE,
      { useMockFallback: true },
      () => ({ mainCoin: 120, bonusCoin: 100 })
    );
  },

  async getCheckInStreak(): Promise<ApiResponse<CheckInStreak>> {
    return apiClient.get<CheckInStreak>(
      API_ROUTES.WALLET.STREAK,
      { useMockFallback: true },
      () => mockCheckInStreak
    );
  },

  async claimDailyReward(currentStreak: CheckInStreak, currentWallet: WalletState): Promise<ApiResponse<{ streak: CheckInStreak; wallet: WalletState; reward: number }>> {
    return apiClient.post<{ streak: CheckInStreak; wallet: WalletState; reward: number }>(
      API_ROUTES.WALLET.CHECK_IN,
      {},
      { useMockFallback: true },
      () => {
        const todayIndex = currentStreak.days.findIndex((d) => d.isToday);
        const reward = todayIndex !== -1 ? currentStreak.days[todayIndex].reward : 10;

        const updatedDays = currentStreak.days.map((day) =>
          day.isToday ? { ...day, claimed: true } : day
        );

        const updatedStreak: CheckInStreak = {
          ...currentStreak,
          days: updatedDays,
          currentStreak: currentStreak.currentStreak + 1,
          lastCheckInDate: new Date().toISOString(),
          todayClaimed: true,
        };

        const updatedWallet: WalletState = {
          ...currentWallet,
          bonusCoin: currentWallet.bonusCoin + reward,
        };

        return {
          streak: updatedStreak,
          wallet: updatedWallet,
          reward,
        };
      }
    );
  },

  async unlockEpisode(
    movieId: string,
    episodeId: string,
    price: number,
    currentWallet: WalletState
  ): Promise<ApiResponse<UnlockEpisodeResult>> {
    return apiClient.post<UnlockEpisodeResult>(
      API_ROUTES.WALLET.UNLOCK_EPISODE,
      { movieId, episodeId, price },
      { useMockFallback: true },
      () => {
        const totalCoins = currentWallet.mainCoin + currentWallet.bonusCoin;
        if (totalCoins < price) {
          throw new Error('Số dư coin không đủ để mở khóa tập phim này.');
        }

        let mainDeducted = 0;
        let bonusDeducted = 0;
        let deductedFrom: 'main' | 'bonus' | 'split' = 'main';

        if (currentWallet.mainCoin >= price) {
          mainDeducted = price;
          deductedFrom = 'main';
        } else {
          mainDeducted = currentWallet.mainCoin;
          bonusDeducted = price - mainDeducted;
          deductedFrom = mainDeducted > 0 ? 'split' : 'bonus';
        }

        const newBalance: WalletState = {
          mainCoin: currentWallet.mainCoin - mainDeducted,
          bonusCoin: currentWallet.bonusCoin - bonusDeducted,
        };

        return {
          success: true,
          message: 'Mở khóa tập phim thành công!',
          deductedFrom,
          mainDeducted,
          bonusDeducted,
          newBalance,
        };
      }
    );
  },

  async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    return apiClient.get<Transaction[]>(
      API_ROUTES.WALLET.TRANSACTIONS,
      { useMockFallback: true },
      () => mockTransactions
    );
  },
};
