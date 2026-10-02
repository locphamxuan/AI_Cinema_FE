import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowseMoviesPage } from '@/components/browse/BrowseMoviesPage';
import { filterMovies, filtersFromParams, NO_FILTERS } from '@/components/home/filterMovies';
import { useAppStore } from '@/store/useAppStore';
import type { Movie } from '@/types/movie';

const nav = vi.hoisted(() => ({ search: '' }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/phim',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(nav.search),
}));

function movie(id: string, title: string, genre: string[], episodes: number, year: number, ageRating = 'Mọi lứa tuổi'): Movie {
  return {
    id,
    title,
    genre,
    year,
    ageRating,
    posterUrl: '',
    bannerUrl: '',
    description: '',
    contentBrief: '',
    totalEpisodes: episodes,
    isSeries: episodes > 1,
    episodes: [],
    quality: 'HD',
    badge: episodes > 1 ? 'Series AI' : 'Phim AI',
    aiCompliance: { complianceArticle: '', reviewStatus: 'approved', contentRating: ageRating, disclaimer: '' },
  };
}

const catalog = [
  movie('m1', 'EXECUTE', ['Khoa học viễn tưởng', 'Giật gân'], 1, 2023, 'T16'),
  movie('m2', 'Âm Nhạc AI', ['Nhạc kịch', 'Giả tưởng'], 3, 2024),
  movie('m3', 'Tuyển Tập Phim Ngắn AI', ['Hoạt hình', 'Hài'], 3, 2025),
];

describe('filterMovies', () => {
  it('filters by name, genre, format and age', () => {
    expect(filterMovies(catalog, { ...NO_FILTERS, search: 'execute' }).map((m) => m.id)).toEqual(['m1']);
    expect(filterMovies(catalog, { ...NO_FILTERS, genre: 'Hoạt hình' }).map((m) => m.id)).toEqual(['m3']);
    expect(filterMovies(catalog, { ...NO_FILTERS, format: 'series' }).map((m) => m.id)).toEqual(['m2', 'm3']);
    expect(filterMovies(catalog, { ...NO_FILTERS, format: 'single' }).map((m) => m.id)).toEqual(['m1']);
    expect(filterMovies(catalog, { ...NO_FILTERS, age: 'T16' }).map((m) => m.id)).toEqual(['m1']);
    expect(filterMovies(catalog, { ...NO_FILTERS, age: 'everyone' }).map((m) => m.id)).toEqual(['m2', 'm3']);
  });

  it('sorts by year or by title, otherwise keeps the catalog order', () => {
    expect(filterMovies(catalog, NO_FILTERS).map((m) => m.id)).toEqual(['m1', 'm2', 'm3']);
    expect(filterMovies(catalog, { ...NO_FILTERS, sortBy: 'year' }).map((m) => m.id)).toEqual(['m3', 'm2', 'm1']);
    expect(filterMovies(catalog, { ...NO_FILTERS, sortBy: 'title' }).map((m) => m.title)).toEqual(['Âm Nhạc AI', 'EXECUTE', 'Tuyển Tập Phim Ngắn AI']);
  });

  it('reads navbar shortcuts from the query string', () => {
    expect(filtersFromParams(new URLSearchParams('loai=bo'))).toMatchObject({ format: 'series' });
    expect(filtersFromParams(new URLSearchParams('the-loai=Ho%E1%BA%A1t%20h%C3%ACnh&q=abc'))).toMatchObject({ genre: 'Hoạt hình', search: 'abc' });
  });
});

describe('BrowseMoviesPage', () => {
  beforeEach(() => {
    useAppStore.setState({
      movies: catalog,
      genres: [
        { id: 'g1', name: 'Hoạt hình' },
        { id: 'g2', name: 'Khoa học viễn tưởng' },
      ],
      isCatalogLoading: false,
      loadCatalog: async () => {},
    });
  });

  it('opens with the filter of the navbar shortcut and can clear it', async () => {
    nav.search = 'loai=bo';
    render(<BrowseMoviesPage />);

    expect(screen.getByRole('heading', { name: /Lọc phim/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Phim bộ' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('2 phim phù hợp')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Xoá bộ lọc/ }));
    expect(screen.getByText('3 phim phù hợp')).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Thể loại' }), 'Hoạt hình');
    const results = screen.getByText('1 phim phù hợp');
    expect(results).toBeInTheDocument();
    expect(within(document.body).getByText('Tuyển Tập Phim Ngắn AI')).toBeInTheDocument();
  });
});
