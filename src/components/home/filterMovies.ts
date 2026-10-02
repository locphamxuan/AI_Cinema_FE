import type { Movie } from '@/types/movie';

export type MovieFormat = 'all' | 'series' | 'single';
export type MovieSort = 'newest' | 'year' | 'title';
export type AgeFilter = 'all' | 'T16' | 'T18' | 'everyone';

export interface MovieFilters {
  search: string;
  /** A genre name of the catalog, or '' for every genre. */
  genre: string;
  format: MovieFormat;
  age: AgeFilter;
  sortBy: MovieSort;
}

export const NO_FILTERS: MovieFilters = { search: '', genre: '', format: 'all', age: 'all', sortBy: 'newest' };

/**
 * The movies matching the filters of the browse page. The catalog lists the newest releases first, so
 * "newest" keeps its order; there are no ratings or view counts to sort by.
 */
export function filterMovies(movies: Movie[], f: MovieFilters): Movie[] {
  const q = f.search.trim().toLowerCase();
  const result = movies.filter((m) => {
    if (q && !m.title.toLowerCase().includes(q) && !m.description.toLowerCase().includes(q)) return false;
    if (f.genre && !m.genre.includes(f.genre)) return false;
    if (f.format === 'series' && !m.isSeries) return false;
    if (f.format === 'single' && m.isSeries) return false;
    if (f.age === 'everyone' && (m.ageRating === 'T16' || m.ageRating === 'T18')) return false;
    if ((f.age === 'T16' || f.age === 'T18') && m.ageRating !== f.age) return false;
    return true;
  });
  if (f.sortBy === 'year') result.sort((a, b) => b.year - a.year);
  if (f.sortBy === 'title') result.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
  return result;
}

/** Filters read from the URL (?q=&the-loai=&loai=bo|le&tuoi=), so a link can open the page pre-filtered. */
export function filtersFromParams(params: URLSearchParams): MovieFilters {
  const loai = params.get('loai');
  const tuoi = params.get('tuoi');
  return {
    ...NO_FILTERS,
    search: params.get('q') ?? '',
    genre: params.get('the-loai') ?? '',
    format: loai === 'bo' ? 'series' : loai === 'le' ? 'single' : 'all',
    age: tuoi === 'T16' || tuoi === 'T18' || tuoi === 'everyone' ? tuoi : 'all',
  };
}
