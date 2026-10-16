import { apiClient, ApiResponse } from './apiClient';
import { randomId } from '@/lib/random';
import type { CheckInResult, DailyRewardStatus } from '@/types/episodeAccess';

export const dailyRewardService = {
  /** GET /daily-rewards/status - today's state, the streak, the Admin's reward ladder. */
  getStatus(): Promise<ApiResponse<DailyRewardStatus>> {
    return apiClient.get<DailyRewardStatus>('/daily-rewards/status');
  },

  /** POST /daily-rewards/check-in - once per Vietnam business day. */
  checkIn(): Promise<ApiResponse<CheckInResult>> {
    return apiClient.post<CheckInResult>('/daily-rewards/check-in', {}, { headers: { 'Idempotency-Key': randomId('checkin-') } });
  },
};
