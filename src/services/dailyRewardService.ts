import { apiClient, ApiResponse } from './apiClient';

export interface DailyRewardStatusResponse {
  hasCheckedInToday?: boolean;
  currentStreak?: number;
  rewardLadder?: { day: number; coins: number }[];
  lastCheckInAt?: string;
  [key: string]: any;
}

export interface CheckInClaimResponse {
  rewardCoins: number;
  newStreak: number;
  mainBalance: number;
  bonusBalance: number;
  [key: string]: any;
}

export const dailyRewardService = {
  /**
   * Retrieves today's check-in status, current streak, and reward ladder.
   * Maps to GET /api/daily-rewards/status
   */
  async getStatus(): Promise<ApiResponse<DailyRewardStatusResponse>> {
    return apiClient.get<DailyRewardStatusResponse>('/daily-rewards/status');
  },

  /**
   * Claims today's daily reward bonus Coins.
   * Maps to POST /api/daily-rewards/check-in
   */
  async checkIn(): Promise<ApiResponse<CheckInClaimResponse>> {
    const key = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'reward-' + Date.now();
    return apiClient.post<CheckInClaimResponse>(
      '/daily-rewards/check-in',
      {},
      {
        headers: {
          'Idempotency-Key': key,
        },
      }
    );
  },
};
