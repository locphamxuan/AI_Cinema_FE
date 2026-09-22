/**
 * AI Cinema - Movie & Streaming Service (Connected to Database)
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { Movie, EpisodeVersion, AIComplianceInfo } from '@/types/movie';
import { allMockMovies, mockMovie } from '@/mocks/mockData';

export const movieService = {
  async getMovies(genre?: string): Promise<ApiResponse<Movie[]>> {
    const query = genre && genre !== 'all' ? `?genre=${encodeURIComponent(genre)}` : '';
    return apiClient.get<Movie[]>(`${API_ROUTES.MOVIES.LIST}${query}`, {}, () => {
      if (!genre || genre === 'all') return allMockMovies;
      return allMockMovies.filter((m) => m.genre.includes(genre));
    });
  },

  async getMovieById(id: string): Promise<ApiResponse<Movie | null>> {
    return apiClient.get<Movie | null>(API_ROUTES.MOVIES.DETAIL(id), {}, () => {
      const found = allMockMovies.find((m) => m.id === id);
      return found || mockMovie || null;
    });
  },

  async getFeaturedMovies(): Promise<ApiResponse<Movie[]>> {
    return apiClient.get<Movie[]>(API_ROUTES.MOVIES.FEATURED, {}, () => allMockMovies.slice(0, 5));
  },

  async getEpisodeVersions(movieId: string, episodeId: string): Promise<ApiResponse<EpisodeVersion[]>> {
    return apiClient.get<EpisodeVersion[]>(API_ROUTES.MOVIES.VERSIONS(movieId, episodeId), {}, () => {
      const movie = allMockMovies.find((m) => m.id === movieId) || mockMovie;
      const episode = movie.episodes.find((ep) => ep.id === episodeId) || movie.episodes[0];
      return episode?.versions || [];
    });
  },

  async getComplianceInfo(movieId: string): Promise<ApiResponse<AIComplianceInfo>> {
    return apiClient.get<AIComplianceInfo>(API_ROUTES.MOVIES.COMPLIANCE(movieId), {}, () => {
      const movie = allMockMovies.find((m) => m.id === movieId) || mockMovie;
      return movie.aiCompliance;
    });
  },
};
