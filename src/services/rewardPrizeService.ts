import { apiClient, ApiResponse } from './apiClient';
import type { RewardPrize, RewardPrizeType } from '@/types/billing';

export interface CreateRewardPrizeDto {
  code: string;
  name: string;
  type: RewardPrizeType;
  bonusCoins?: number;
  planDays?: number;
  weight: number;
}

export interface UpdateRewardPrizeDto {
  name?: string;
  bonusCoins?: number;
  planDays?: number;
  weight?: number;
  isActive?: boolean;
}

export const rewardPrizeService = {
  /** GET /admin/reward-prizes - admin lists all prizes and weights */
  getAdminPrizes(): Promise<ApiResponse<RewardPrize[]>> {
    return apiClient.get<RewardPrize[]>('/admin/reward-prizes');
  },

  /** POST /admin/reward-prizes - add a slot to the wheel */
  createPrize(dto: CreateRewardPrizeDto): Promise<ApiResponse<RewardPrize>> {
    return apiClient.post<RewardPrize>('/admin/reward-prizes', dto);
  },

  /** PATCH /admin/reward-prizes/:id - update a display name, Coin amount or weight */
  updatePrize(id: string, dto: UpdateRewardPrizeDto): Promise<ApiResponse<RewardPrize>> {
    return apiClient.patch<RewardPrize>(`/admin/reward-prizes/${id}`, dto);
  },

  /** DELETE /admin/reward-prizes/:id - take a prize off the wheel (keeps history) */
  deletePrize(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.delete<unknown>(`/admin/reward-prizes/${id}`);
  },
};
