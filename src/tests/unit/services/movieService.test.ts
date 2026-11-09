import { describe, it, expect, vi, afterEach } from 'vitest';
import { movieService } from '@/services/movieService';

const apiMovie = {
  id: 'm1',
  title: 'EXECUTE',
  synopsis: 'Phim ngắn khoa học viễn tưởng u tối.',
  posterUrl: 'https://thumb.example/execute.jpg',
  genres: [{ id: 'g1', name: 'Khoa học viễn tưởng' }],
};

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
  afterEach(() => vi.unstubAllGlobals());

  it('reads the paginated catalog and counts the released episodes of each movie', async () => {
    const fetchMock = routeFetch({
      '/movies': { data: [apiMovie], meta: { totalItems: 1, currentPage: 1, totalPages: 1 } },
      '/movies/m1/episodes': [{ id: 'ep-1' }, { id: 'ep-2' }, { id: 'ep-3' }],
    });

    const res = await movieService.getMovies();

    expect(fetchMock.mock.calls[0][0]).toContain('/movies?limit=100');
    expect(res.data).toEqual([{ id: 'm1', title: 'EXECUTE', genres: ['Khoa học viễn tưởng'], episodeCount: 3 }]);
  });

  it('counts no episode when the episode list cannot be read', async () => {
    routeFetch({ '/movies': { data: [apiMovie], meta: { totalItems: 1, currentPage: 1, totalPages: 1 } } });
    const res = await movieService.getMovies();
    expect(res.data[0].episodeCount).toBe(0);
  });

  it('reports a failed request without inventing movies', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ message: 'boom' }, 500)));
    const res = await movieService.getMovies();
    expect(res.success).toBe(false);
    expect(res.data).toEqual([]);
  });
});
