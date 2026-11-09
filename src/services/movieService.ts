/**
 * AI Cinema - the public catalog of released movies (GET /movies), as the Staff overview lists it.
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';

const CATALOG_PAGE_SIZE = 100;

/** A movie of the public catalog - never the studio, fee or people in charge. */
interface ApiCatalogMovie {
  id: string;
  title: string;
  genres: { id: string; name: string }[];
}

/** The paginated shape of list endpoints (nestjs pagination). */
interface Page<T> {
  data: T[];
  meta: { totalItems: number; currentPage: number; totalPages: number };
}

/** A released movie with the number of its released episodes. */
export interface CatalogMovie {
  id: string;
  title: string;
  genres: string[];
  episodeCount: number;
}

/** Released episodes of a movie; the list endpoint does not count them. */
async function episodeCountOf(movieId: string): Promise<number> {
  const res = await apiClient.get<unknown[]>(API_ROUTES.MOVIES.EPISODES(movieId));
  return res.success && Array.isArray(res.data) ? res.data.length : 0;
}

export const movieService = {
  /** Released movies, newest first, each with its released episode count. */
  async getMovies(): Promise<ApiResponse<CatalogMovie[]>> {
    const res = await apiClient.get<Page<ApiCatalogMovie>>(`${API_ROUTES.MOVIES.LIST}?limit=${CATALOG_PAGE_SIZE}`);
    if (!res.success || !res.data) return { ...res, data: [] };
    const movies = await Promise.all(
      res.data.data.map(async (movie) => ({
        id: movie.id,
        title: movie.title,
        genres: movie.genres.map((g) => g.name),
        episodeCount: await episodeCountOf(movie.id),
      })),
    );
    return { ...res, data: movies };
  },
};
