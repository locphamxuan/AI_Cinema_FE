import { describe, it, expect, vi, afterEach } from 'vitest';
import { movieService } from '@/services/movieService';

const apiMovie = {
  id: 'm1',
  title: 'EXECUTE',
  synopsis: 'Phim ngắn khoa học viễn tưởng u tối.',
  posterUrl: 'https://thumb.example/execute.jpg',
  genres: [{ id: 'g1', name: 'Khoa học viễn tưởng' }],
  episodeCount: 3,
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Answers by path. */
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

  it('reads the paginated catalog in one request, with the episode count it carries', async () => {
    const fetchMock = routeFetch({ '/movies': { data: [apiMovie], meta: { totalItems: 1, currentPage: 1, totalPages: 1 } } });

    const res = await movieService.getMovies();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/movies?limit=100');
    expect(res.data).toEqual([{ id: 'm1', title: 'EXECUTE', genres: ['Khoa học viễn tưởng'], episodeCount: 3 }]);
  });

  it('reports a failed request without inventing movies', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ message: 'boom' }, 500)));
    const res = await movieService.getMovies();
    expect(res.success).toBe(false);
    expect(res.data).toEqual([]);
  });
});
