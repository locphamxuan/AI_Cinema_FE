import { apiClient, ApiResponse } from './apiClient';
import { randomId } from '@/lib/random';
import type { RewardPrize, RewardWheelStatus, SpinResult } from '@/types/episodeAccess';

export interface UpdateRewardPrizeDto {
  name?: string;
  bonusCoins?: number;
}

export const newSpinIdempotencyKey = () => randomId('spin-');

export const rewardSpinService = {
  /** GET /rewards/spins — available spins, wheel prizes, and recent spin history */
  getWheelStatus(): Promise<ApiResponse<RewardWheelStatus>> {
    return apiClient.get<RewardWheelStatus>('/rewards/spins');
  },

  /** POST /rewards/spins — use oldest available spin with CSPRNG draw */
  spin(key = newSpinIdempotencyKey()): Promise<ApiResponse<SpinResult>> {
    return apiClient.post<SpinResult>('/rewards/spins', {}, { headers: { 'Idempotency-Key': key } });
  },

  /** GET /admin/reward-prizes — admin lists all prizes and weights */
  getAdminPrizes(): Promise<ApiResponse<RewardPrize[]>> {
    return apiClient.get<RewardPrize[]>('/admin/reward-prizes');
  },

  /** PATCH /admin/reward-prizes/:id — update a display name or Coin amount */
  updatePrize(id: string, dto: UpdateRewardPrizeDto): Promise<ApiResponse<RewardPrize>> {
    return apiClient.patch<RewardPrize>(`/admin/reward-prizes/${id}`, dto);
  },
};
