import { apiClient, ApiResponse } from './apiClient';

export interface MovieEngagement {
  likeCount: number;
  viewCount: number;
  /** Null for a Guest, true/false for a signed-in Member. */
  likedByMe: boolean | null;
}

export const engagementService = {
  /** GET /movies/:movieId/engagement - hearts and plays of a movie; likedByMe when signed in. */
  summary(movieId: string): Promise<ApiResponse<MovieEngagement>> {
    return apiClient.get<MovieEngagement>(`/movies/${movieId}/engagement`);
  },

  /** POST /movies/:movieId/like - give the movie a heart. */
  like(movieId: string): Promise<ApiResponse<MovieEngagement>> {
    return apiClient.post<MovieEngagement>(`/movies/${movieId}/like`, {});
  },

  /** DELETE /movies/:movieId/like - take the heart back. */
  unlike(movieId: string): Promise<ApiResponse<MovieEngagement>> {
    return apiClient.delete<MovieEngagement>(`/movies/${movieId}/like`);
  },
};
