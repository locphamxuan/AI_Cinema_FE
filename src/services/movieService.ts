/**
 * AI Cinema - public catalog (movies & genres) served by the NestJS backend.
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Movie } from '@/types/movie';
import { adaptApiMovie, adaptApiMovies, type ApiCatalogEpisode, type ApiCatalogMovie, type ApiGenre } from './movieAdapter';

const CATALOG_PAGE_SIZE = 100;

/** The paginated shape of list endpoints (nestjs pagination). */
interface Page<T> {
  data: T[];
  meta: { totalItems: number; currentPage: number; totalPages: number };
}

async function episodesOf(movieId: string): Promise<ApiCatalogEpisode[]> {
  const res = await apiClient.get<ApiCatalogEpisode[]>(API_ROUTES.MOVIES.EPISODES(movieId));
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export const movieService = {
  /** Released movies with their released episodes. */
  async getMovies(): Promise<ApiResponse<Movie[]>> {
    const res = await apiClient.get<Page<ApiCatalogMovie>>(`${API_ROUTES.MOVIES.LIST}?limit=${CATALOG_PAGE_SIZE}`);
    if (!res.success || !res.data) return { ...res, data: [] };
    const withEpisodes = await Promise.all(res.data.data.map(async (movie) => ({ movie, episodes: await episodesOf(movie.id) })));
    return { ...res, data: adaptApiMovies(withEpisodes) };
  },

  async getMovieById(id: string): Promise<ApiResponse<Movie>> {
    const [res, episodes] = await Promise.all([apiClient.get<ApiCatalogMovie>(API_ROUTES.MOVIES.DETAIL(id)), episodesOf(id)]);
    return res.success && res.data ? { ...res, data: adaptApiMovie(res.data, episodes) } : { ...res, data: null as unknown as Movie };
  },

  async getGenres(): Promise<ApiResponse<ApiGenre[]>> {
    const res = await apiClient.get<Page<ApiGenre>>(`${API_ROUTES.GENRES.LIST}?limit=${CATALOG_PAGE_SIZE}`);
    return res.success && res.data ? { ...res, data: res.data.data } : { ...res, data: [] };
  },
};
