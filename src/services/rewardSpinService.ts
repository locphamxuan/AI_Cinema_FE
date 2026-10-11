import { apiClient, ApiResponse } from './apiClient';
import { randomId } from '@/lib/random';
import type { RewardPrize, RewardWheelStatus, SpinResult } from '@/types/episodeAccess';

export interface CreateRewardPrizeDto {
  code: string;
  name: string;
  type: 'BONUS_COIN' | 'PLAN_DAYS';
  bonusCoins?: number;
  planDays?: number;
  weight: number;
}

export interface UpdateRewardPrizeDto {
  name?: string;
  weight?: number;
  isActive?: boolean;
  bonusCoins?: number;
  planDays?: number;
}

export const rewardSpinService = {
  /** GET /rewards/spins — available spins, wheel prizes, and recent spin history */
  getWheelStatus(): Promise<ApiResponse<RewardWheelStatus>> {
    return apiClient.get<RewardWheelStatus>('/rewards/spins');
  },

  /** POST /rewards/spins — use oldest available spin with CSPRNG draw */
  spin(key = randomId('spin-')): Promise<ApiResponse<SpinResult>> {
    return apiClient.post<SpinResult>('/rewards/spins', {}, { headers: { 'Idempotency-Key': key } });
  },

  /** GET /admin/reward-prizes — admin lists all prizes and weights */
  getAdminPrizes(): Promise<ApiResponse<RewardPrize[]>> {
    return apiClient.get<RewardPrize[]>('/admin/reward-prizes');
  },

  /** POST /admin/reward-prizes — put a new prize on the wheel */
  createPrize(dto: CreateRewardPrizeDto): Promise<ApiResponse<RewardPrize>> {
    return apiClient.post<RewardPrize>('/admin/reward-prizes', dto);
  },

  /** PATCH /admin/reward-prizes/:id — update prize name, weight, or active status */
  updatePrize(id: string, dto: UpdateRewardPrizeDto): Promise<ApiResponse<RewardPrize>> {
    return apiClient.patch<RewardPrize>(`/admin/reward-prizes/${id}`, dto);
  },
};
