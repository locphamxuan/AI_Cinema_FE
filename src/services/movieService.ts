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
  episodeCount: number;
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

export const movieService = {
  /** Released movies, newest first, each with its released episode count. */
  async getMovies(): Promise<ApiResponse<CatalogMovie[]>> {
    const res = await apiClient.get<Page<ApiCatalogMovie>>(`${API_ROUTES.MOVIES.LIST}?limit=${CATALOG_PAGE_SIZE}`);
    if (!res.success || !res.data) return { ...res, data: [] };
    return {
      ...res,
      data: res.data.data.map(({ id, title, genres, episodeCount }) => ({ id, title, genres: genres.map((g) => g.name), episodeCount })),
    };
  },
};
