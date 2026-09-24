/**
 * AI Cinema - public catalog (movies & genres) served by the NestJS backend.
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Movie } from '@/types/movie';
import { adaptApiMovie, type ApiCatalogMovie, type ApiGenre } from './movieAdapter';

const CATALOG_PAGE_SIZE = 100;

function mapResponse<T, U>(res: ApiResponse<T>, map: (data: T) => U): ApiResponse<U> {
  return res.success && res.data ? { ...res, data: map(res.data) } : { ...res, data: null as unknown as U };
}

export const movieService = {
  async getMovies(): Promise<ApiResponse<Movie[]>> {
    const res = await apiClient.get<{ items: ApiCatalogMovie[] }>(
      `${API_ROUTES.MOVIES.LIST}?limit=${CATALOG_PAGE_SIZE}`
    );
    return mapResponse(res, (data) => data.items.map(adaptApiMovie));
  },

  async getMovieById(id: string): Promise<ApiResponse<Movie>> {
    const res = await apiClient.get<ApiCatalogMovie>(API_ROUTES.MOVIES.DETAIL(id));
    return mapResponse(res, adaptApiMovie);
  },

  async getGenres(): Promise<ApiResponse<ApiGenre[]>> {
    const res = await apiClient.get<{ data: ApiGenre[] }>(`${API_ROUTES.GENRES.LIST}?limit=${CATALOG_PAGE_SIZE}`);
    return mapResponse(res, (data) => data.data);
  },
};
