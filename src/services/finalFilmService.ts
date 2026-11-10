/**
 * MF-1 Step 5 & 6: Final Film Confirmation & Publishing Rejection Service
 */
import { apiClient, type ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';

const R = API_ROUTES.PRODUCTION;

export const finalFilmService = {
  // Reviewer confirms the checked, labeled (Điều 44) version as the Final Film
  confirmFinalFilm: (episodeId: string): Promise<ApiResponse<{ success: boolean; message?: string }>> =>
    apiClient.post<{ success: boolean; message?: string }>(R.FINAL_CONFIRMATION(episodeId), {}),

  // Admin rejects the Final Film back to Reviewer with a reason
  rejectFinalFilm: (episodeId: string, reason: string): Promise<ApiResponse<{ success: boolean; message?: string }>> =>
    apiClient.post<{ success: boolean; message?: string }>(R.FINAL_REJECTION(episodeId), { reason }),
};
