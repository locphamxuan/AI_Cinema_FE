import { apiClient, ApiResponse } from './apiClient';
import { adaptApiMovie, type ApiCatalogMovie } from './movieAdapter';
import type { Movie } from '@/types/movie';

export interface SavedMovieItem extends Movie {
  savedAt?: string;
}

/** "Danh sách của tôi": movies the member saved to watch later (GET /saved-movies). */
export const savedMovieService = {
  async list(): Promise<ApiResponse<SavedMovieItem[]>> {
    const res = await apiClient.get<(ApiCatalogMovie & { savedAt?: string })[]>('/saved-movies');
    if (!res.success || !Array.isArray(res.data)) {
      return { ...res, data: [] };
    }
    const adapted = res.data.map((item) => ({
      ...adaptApiMovie(item),
      savedAt: item.savedAt,
    }));
    return { ...res, data: adapted };
  },

  isSaved(movieId: string): Promise<ApiResponse<{ saved: boolean }>> {
    return apiClient.get<{ saved: boolean }>(`/saved-movies/${movieId}`);
  },

  save(movieId: string): Promise<ApiResponse<{ saved: boolean }>> {
    return apiClient.put<{ saved: boolean }>(`/saved-movies/${movieId}`, {});
  },

  unsave(movieId: string): Promise<ApiResponse<{ saved: boolean }>> {
    return apiClient.delete<{ saved: boolean }>(`/saved-movies/${movieId}`);
  },
};
