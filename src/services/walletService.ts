/**
 * AI Cinema - Dual-Wallet & Reward Service (Connected to Database)
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { WalletState, CheckInStreak } from '@/types/wallet';
import { Transaction } from '@/types/transaction';
import { mockCheckInStreak, mockTransactions, getInitialCheckInStreak } from '@/mocks/mockData';
import { getTodayDayIndex, getTodayDateString } from '@/lib/dateUtils';

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
    return apiClient.get<CheckInStreak>(API_ROUTES.WALLET.STREAK, {}, () => getInitialCheckInStreak());
  },

  async claimDailyReward(_currentStreak?: CheckInStreak, _currentWallet?: WalletState): Promise<ApiResponse<{ streak: CheckInStreak; wallet: WalletState; reward: number }>> {
    return apiClient.post<{ streak: CheckInStreak; wallet: WalletState; reward: number }>(
      API_ROUTES.WALLET.CHECK_IN,
      {},
      {},
      () => {
        const todayIdx = getTodayDayIndex();
        const todayStr = getTodayDateString();
        const baseStreak = _currentStreak || getInitialCheckInStreak();
        const reward = baseStreak.days[todayIdx]?.reward ?? 10;
        const wallet = _currentWallet || { mainCoin: 120, bonusCoin: 100 };
        return {
          streak: {
            ...baseStreak,
            currentStreak: todayIdx + 1,
            todayClaimed: true,
            lastCheckInDate: todayStr,
            days: baseStreak.days.map((d, idx) => ({
              ...d,
              claimed: idx <= todayIdx,
              isToday: idx === todayIdx,
            })),
          },
          wallet: { ...wallet, bonusCoin: wallet.bonusCoin + reward },
          reward,
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
