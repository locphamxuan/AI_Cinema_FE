import type { Movie } from '@/types/movie';

export type MovieFormat = 'all' | 'series' | 'single';
export type MovieSort = 'latest' | 'rating' | 'popular';

export interface MovieFilters {
  search: string;
  /** The nav tab: 'phim-bo' / 'phim-le' force a format, 'anime-ai' keeps animation. */
  navTab: string;
  genre: string;
  format: MovieFormat;
  sortBy: MovieSort;
}

const ANIMATION = ['hoạt hình', 'anime', '3d', 'giả tưởng'];

/**
 * What the home page lists for the chosen search, tab, genre and format. The catalog has no ratings or
 * view counts yet, so every order but "latest" keeps the catalog's own (newest released first).
 */
export function filterMovies(movies: Movie[], f: MovieFilters): Movie[] {
  let result = [...movies];
  const q = f.search.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (m) => m.title.toLowerCase().includes(q) || m.genre.some((g) => g.toLowerCase().includes(q)) || m.description.toLowerCase().includes(q),
    );
  }
  if (f.genre !== 'Tất cả') {
    const genre = f.genre.toLowerCase();
    result = result.filter((m) => m.genre.some((g) => g.toLowerCase().includes(genre)));
  }
  const format = f.navTab === 'phim-bo' ? 'series' : f.navTab === 'phim-le' ? 'single' : f.format;
  if (format === 'series') result = result.filter((m) => m.isSeries || m.totalEpisodes > 1);
  if (format === 'single') result = result.filter((m) => !m.isSeries && m.totalEpisodes <= 1);
  if (f.navTab === 'anime-ai') {
    result = result.filter((m) => m.genre.some((g) => ANIMATION.some((a) => g.toLowerCase().includes(a))));
  }
  if (f.sortBy === 'latest' && f.navTab !== 'bang-xep-hang') result.sort((a, b) => b.year - a.year);
  return result;
}
