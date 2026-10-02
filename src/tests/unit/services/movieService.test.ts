import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { movieService } from '@/services/movieService';
import type { ApiCatalogEpisode, ApiCatalogMovie } from '@/services/movieAdapter';

const apiMovie: ApiCatalogMovie = {
  id: 'm1',
  title: 'EXECUTE',
  synopsis: 'Phim ngắn khoa học viễn tưởng u tối.',
  ageRating: 'T16',
  releaseYear: 2023,
  defaultLanguage: 'vi',
  posterUrl: 'https://thumb.example/execute.jpg',
  bannerUrl: null,
  trailerUrl: null,
  aiGenerated: true,
  genres: [{ id: 'g1', name: 'Khoa học viễn tưởng' }],
};

const episode = (n: number, overrides: Partial<ApiCatalogEpisode> = {}): ApiCatalogEpisode => ({
  id: `ep-${n}`,
  movieId: 'm1',
  seasonNumber: 1,
  seasonTitle: 'Mùa 1',
  episodeNumber: n,
  title: `Tập ${n}`,
  synopsis: null,
  thumbnailUrl: null,
  availability: 'AVAILABLE',
  notice: null,
  isFreeStarter: n <= 2,
  coinPrice: 3,
  durationSeconds: 1530,
  qualities: ['1080p'],
  aiLabel: { labelType: 'AI_GENERATED', labelText: 'Phim được tạo bằng trí tuệ nhân tạo (AI)', displayLocation: 'TOP_RIGHT' },
  publishedAt: '2026-10-03T00:00:00.000Z',
  ...overrides,
});

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Answers by path: the list, then each movie's episodes. */
function routeFetch(routes: Record<string, unknown>) {
  const fetchMock = vi.fn(async (url: string) => {
    const path = new URL(url, 'http://x').pathname.replace(/^\/api/, '');
    return path in routes ? json(routes[path]) : json({ message: 'not found' }, 404);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('movieService', () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => vi.unstubAllGlobals());

  it('reads the paginated catalog and the released episodes of each movie', async () => {
    const fetchMock = routeFetch({
      '/movies': { data: [apiMovie], meta: { totalItems: 1, currentPage: 1, totalPages: 1 } },
      '/movies/m1/episodes': [episode(1), episode(2), episode(3, { qualities: ['720p'] })],
    });

    const res = await movieService.getMovies();

    expect(fetchMock.mock.calls[0][0]).toContain('/movies?limit=100');
    const [movie] = res.data;
    expect(movie).toMatchObject({
      id: 'm1',
      genre: ['Khoa học viễn tưởng'],
      description: apiMovie.synopsis,
      year: 2023,
      totalEpisodes: 3,
      isSeries: true,
      quality: '1080p',
      top10Rank: 1,
    });
    expect(movie.aiCompliance).toMatchObject({ disclaimer: 'Phim được tạo bằng trí tuệ nhân tạo (AI)', displayLocation: 'TOP_RIGHT' });
    // Nothing the catalog does not say: no invented studio, AI tools, scores or watch progress.
    expect(movie.partnerStudio).toBeUndefined();
    expect(movie.aiToolsUsed).toBeUndefined();
    expect(movie.rating).toBeUndefined();
    expect(movie.continueProgress).toBeUndefined();
  });

  it('frees the starter episodes (BR-03) and keeps the price of the others', async () => {
    routeFetch({ '/movies/m1': apiMovie, '/movies/m1/episodes': [episode(1), episode(3)] });

    const res = await movieService.getMovieById('m1');

    const [free, paid] = res.data.episodes;
    expect(free).toMatchObject({ duration: '25:30', isFree: true, isUnlocked: true, isPreview: true, hlsUrl: '' });
    expect(free.thumbnailUrl).toBe(apiMovie.posterUrl);
    expect(paid).toMatchObject({ price: 3, isFree: false, isUnlocked: false });
  });

  it('returns genres from the paginated genre endpoint', async () => {
    routeFetch({ '/genres': { data: [{ id: 'g1', name: 'Lãng mạn', description: null }], meta: {} } });
    const res = await movieService.getGenres();
    expect(res.data).toEqual([{ id: 'g1', name: 'Lãng mạn', description: null }]);
  });

  it('reports a failed request without inventing movies', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ message: 'boom' }, 500)));
    const res = await movieService.getMovies();
    expect(res.success).toBe(false);
    expect(res.data).toEqual([]);
  });
});
