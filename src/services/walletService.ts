/**
 * AI Cinema - Dual-Wallet & Reward Service (Connected to Database)
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { WalletState, CheckInStreak } from '@/types/wallet';
import { Transaction } from '@/types/transaction';
import { mockTransactions, getInitialCheckInStreak } from '@/mocks/mockData';
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
    const res = await apiClient.get<any>(API_ROUTES.WALLET.BALANCE, {}, () => ({ mainBalance: 0, bonusBalance: 0 }));
    if (res.success && res.data) {
      return {
        ...res,
        data: {
          mainCoin: res.data.mainBalance ?? res.data.mainCoin ?? 0,
          bonusCoin: res.data.bonusBalance ?? res.data.bonusCoin ?? 0,
        },
      };
    }
    return {
      success: false,
      data: { mainCoin: 0, bonusCoin: 0 },
      message: res.message,
      statusCode: res.statusCode,
    };
  },

  async getCheckInStreak(): Promise<ApiResponse<CheckInStreak>> {
    const res = await apiClient.get<any>(API_ROUTES.WALLET.STREAK, {}, () => null);
    if (res.success && res.data) {
      const { streakDay = 0, checkedInToday = false, ladder = [] } = res.data;
      const todayIdx = getTodayDayIndex();
      const todayStr = getTodayDateString();
      
      const days = [0, 1, 2, 3, 4, 5, 6].map((idx) => {
        const ladderItem = ladder.find((l: any) => l.streakDay === idx + 1);
        const reward = (ladderItem?.coins ?? 0) + (ladderItem?.bonusCoins ?? 10) || 10;
        return {
          dayIndex: idx,
          dayLabel: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][idx],
          reward,
          claimed: idx < streakDay,
          isToday: idx === todayIdx,
        };
      });

      return {
        ...res,
        data: {
          days,
          currentStreak: streakDay,
          lastCheckInDate: checkedInToday ? todayStr : null,
          todayClaimed: checkedInToday,
        },
      };
    }
    return apiClient.get<CheckInStreak>(API_ROUTES.WALLET.STREAK, {}, () => getInitialCheckInStreak());
  },

  async claimDailyReward(_currentStreak?: CheckInStreak, _currentWallet?: WalletState): Promise<ApiResponse<{ streak: CheckInStreak; wallet: WalletState; reward: number }>> {
    const key = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'reward-' + Date.now();
    const res = await apiClient.post<any>(
      API_ROUTES.WALLET.CHECK_IN,
      {},
      { headers: { 'Idempotency-Key': key } },
      () => null
    );

    if (res.success && res.data) {
      const rewardAmount = (res.data.reward?.coins ?? 0) + (res.data.reward?.bonusCoins ?? 0) || res.data.rewardCoins || 10;
      const main = res.data.mainBalance ?? _currentWallet?.mainCoin ?? 0;
      const bonus = res.data.bonusBalance ?? ((_currentWallet?.bonusCoin ?? 0) + rewardAmount);
      const newStreakDay = res.data.streakDay ?? ((_currentStreak?.currentStreak ?? 0) + 1);
      const todayIdx = getTodayDayIndex();
      const todayStr = getTodayDateString();

      const days = [0, 1, 2, 3, 4, 5, 6].map((idx) => ({
        dayIndex: idx,
        dayLabel: ['T2', 'T3', 'T4', 'T5', 'T6', 'CN'][idx] || 'CN',
        reward: 10,
        claimed: idx < newStreakDay,
        isToday: idx === todayIdx,
      }));

      return {
        success: true,
        data: {
          reward: rewardAmount,
          wallet: { mainCoin: main, bonusCoin: bonus },
          streak: {
            days,
            currentStreak: newStreakDay,
            lastCheckInDate: todayStr,
            todayClaimed: true,
          },
        },
      };
    }

    // Fallback if needed
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
    const key = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'purchase-' + Date.now();
    const res = await apiClient.post<any>(
      `/episodes/${episodeId}/purchase`,
      {},
      { headers: { 'Idempotency-Key': key } },
      () => null
    );

    if (res.success && res.data) {
      const charged = res.data.charged || {};
      const mainDeducted = charged.mainCoins ?? 0;
      const bonusDeducted = charged.bonusCoins ?? 0;
      return {
        success: true,
        data: {
          success: true,
          message: 'Mở khóa tập phim thành công!',
          deductedFrom: mainDeducted > 0 && bonusDeducted > 0 ? 'split' : bonusDeducted > 0 ? 'bonus' : 'main',
          mainDeducted,
          bonusDeducted,
          newBalance: {
            mainCoin: res.data.mainBalance ?? 0,
            bonusCoin: res.data.bonusBalance ?? 0,
          },
        },
      };
    }

    return apiClient.post<UnlockEpisodeResult>(
      API_ROUTES.WALLET.UNLOCK_EPISODE(episodeId),
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
    const res = await apiClient.get<any>(API_ROUTES.WALLET.STATEMENTS, {}, () => mockTransactions);
    if (res.success && res.data?.data && Array.isArray(res.data.data)) {
      const list = res.data.data.map((item: any) => ({
        id: item.id,
        type: item.entryType === 'CREDIT' ? 'deposit' : 'spend',
        typeLabel: item.entryType === 'CREDIT' ? 'Cộng Coin' : 'Trừ Coin',
        description: item.description || (item.referenceType === 'TOPUP' ? 'Nạp Coin' : 'Mua nội dung'),
        mainCoinDelta: item.amountMain || 0,
        bonusCoinDelta: item.amountBonus || 0,
        totalAmount: (item.amountMain || 0) + (item.amountBonus || 0),
        status: 'success',
        statusLabel: 'Thành công',
        createdAt: item.createdAt || new Date().toISOString(),
      }));
      return { ...res, data: list };
    }
    return apiClient.get<Transaction[]>(API_ROUTES.WALLET.TRANSACTIONS, {}, () => mockTransactions);
  },
};
