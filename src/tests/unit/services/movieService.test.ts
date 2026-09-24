import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { movieService } from '@/services/movieService';
import type { ApiCatalogMovie } from '@/services/movieAdapter';

const apiMovie: ApiCatalogMovie = {
  id: '7b3f1019-4149-47cc-85e0-005e9449bff1',
  title: 'Robot & Tri Kỷ',
  synopsis: 'Một robot quản gia thế hệ thứ 7...',
  description: null,
  posterUrl: 'https://picsum.photos/seed/robotLove9/400/600',
  bannerUrl: null,
  releaseYear: 2026,
  ageRating: 'P',
  createdAt: '2026-09-24T08:00:00.000Z',
  genres: [{ genre: { id: 'g1', name: 'Lãng mạn' } }],
  episodes: [
    {
      id: 'ep-1',
      episodeNumber: 1,
      title: 'Khởi Nguồn',
      synopsis: null,
      thumbnailUrl: null,
      durationSeconds: 1530,
      coinPrice: 0,
      streamUrl: 'https://example.com/ep1.m3u8',
      qualities: ['360p', '720p', '1080p'],
      currentPackage: { subtitles: [{ language: 'vi' }, { language: 'en' }] },
    },
    {
      id: 'ep-2',
      episodeNumber: 2,
      title: 'Tín Hiệu Ẩn',
      synopsis: 'AI bắt đầu gửi tín hiệu.',
      thumbnailUrl: 'https://example.com/ep2.jpg',
      durationSeconds: 1335,
      coinPrice: 50,
      streamUrl: null,
      qualities: [],
      currentPackage: null,
    },
  ],
};

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

describe('Movie Service (src/services/movieService.ts)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adapts the public catalog list to UI movies', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [apiMovie], total: 1, page: 1, limit: 100 }));

    const res = await movieService.getMovies();

    expect(fetchMock.mock.calls[0][0]).toContain('/movies?limit=100');
    expect(res.success).toBe(true);
    const [movie] = res.data;
    expect(movie).toMatchObject({
      id: apiMovie.id,
      genre: ['Lãng mạn'],
      description: apiMovie.synopsis,
      bannerUrl: apiMovie.posterUrl,
      year: 2026,
      totalEpisodes: 2,
      ageRating: 'P',
      quality: '1080p',
    });
    expect(movie.aiCompliance.contentRating).toContain('mọi lứa tuổi');
    expect(movie.aiCompliance.moderationScore).toBeUndefined();
  });

  it('marks only free episodes as unlocked and formats their duration', async () => {
    fetchMock.mockResolvedValue(jsonResponse(apiMovie));

    const res = await movieService.getMovieById(apiMovie.id);

    const [free, paid] = res.data.episodes;
    expect(free).toMatchObject({ duration: '25:30', price: 0, isFree: true, isUnlocked: true, isPreview: true });
    expect(free.thumbnailUrl).toBe(apiMovie.posterUrl);
    expect(paid).toMatchObject({ duration: '22:15', price: 50, isFree: false, isUnlocked: false, hlsUrl: '' });
  });

  it('exposes the renditions and a subtitle track per language of each episode', async () => {
    fetchMock.mockResolvedValue(jsonResponse(apiMovie));

    const res = await movieService.getMovieById(apiMovie.id);

    const [first, second] = res.data.episodes;
    expect(first.qualities).toEqual(['360p', '720p', '1080p']);
    expect(first.subtitles).toEqual([
      { language: 'vi', label: 'Tiếng Việt', src: '/api/catalog/episodes/ep-1/subtitles/vi' },
      { language: 'en', label: 'English', src: '/api/catalog/episodes/ep-1/subtitles/en' },
    ]);
    expect(second.subtitles).toEqual([]);
  });

  it('returns genres from the paginated genre endpoint', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [{ id: 'g1', name: 'Lãng mạn', description: null }], meta: {} }));

    const res = await movieService.getGenres();

    expect(res.data).toEqual([{ id: 'g1', name: 'Lãng mạn', description: null }]);
  });

  it('reports a failed request without inventing data', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: 'boom' }), { status: 500 }));

    const res = await movieService.getMovies();

    expect(res.success).toBe(false);
    expect(res.data).toBeNull();
  });
});
