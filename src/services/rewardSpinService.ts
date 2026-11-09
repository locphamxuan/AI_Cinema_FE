import { apiClient, ApiResponse } from './apiClient';
import type { RewardPrize } from '@/types/billing';

export interface UpdateRewardPrizeDto {
  name?: string;
  bonusCoins?: number;
}

export const rewardSpinService = {
  /** GET /admin/reward-prizes - admin lists all prizes and weights */
  getAdminPrizes(): Promise<ApiResponse<RewardPrize[]>> {
    return apiClient.get<RewardPrize[]>('/admin/reward-prizes');
  },

  /** PATCH /admin/reward-prizes/:id - update a display name or Coin amount */
  updatePrize(id: string, dto: UpdateRewardPrizeDto): Promise<ApiResponse<RewardPrize>> {
    return apiClient.patch<RewardPrize>(`/admin/reward-prizes/${id}`, dto);
  },
};
