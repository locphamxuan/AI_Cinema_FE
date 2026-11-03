'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { Movie } from '@/types/movie';
import NetflixNavbar from '@/components/home/NetflixNavbar';
import CinematicHeroBillboard from '@/components/home/CinematicHeroBillboard';
import NetflixTopTenRow from '@/components/home/NetflixTopTenRow';
import NetflixMovieRow from '@/components/home/NetflixMovieRow';
import ContinueWatchingRow from '@/components/home/ContinueWatchingRow';
import MovieDetailQuickModal from '@/components/home/MovieDetailQuickModal';
import CinemaEnterpriseFooter from '@/components/home/CinemaEnterpriseFooter';

/** Rows of the discovery page, each gathering catalog genres. */
const GENRE_ROWS: { title: string; subtitle: string; genres: string[]; aspectRatio: '16/9' | '2/3' }[] = [
  { title: 'Khoa Học Viễn Tưởng', subtitle: 'Thế giới tương lai qua lăng kính AI', genres: ['Khoa học viễn tưởng'], aspectRatio: '16/9' },
  { title: 'Hoạt Hình, Giả Tưởng & Âm Nhạc', subtitle: 'Thế giới kỳ ảo và những thước phim âm nhạc tạo bằng AI', genres: ['Hoạt hình', 'Giả tưởng', 'Thần thoại', 'Nhạc kịch'], aspectRatio: '2/3' },
  { title: 'Kinh Dị, Hành Động & Giật Gân', subtitle: 'Kịch tính, bí ẩn và nghẹt thở', genres: ['Kinh dị', 'Bí ẩn', 'Hành động', 'Giật gân', 'Tội phạm'], aspectRatio: '16/9' },
  { title: 'Tài Liệu & Lịch Sử', subtitle: 'Hiểu thêm về thế giới qua hình ảnh AI', genres: ['Tài liệu', 'Lịch sử'], aspectRatio: '16/9' },
];

/** Discovery (Khám Phá): the newest releases up front, then rows by genre; filtering lives on /phim. */
export default function HomePage() {
  const { movies, isCatalogLoading, loadCatalog } = useAppStore();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeHeroId, setActiveHeroId] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // The newest released movies lead the hero carousel.
  const featuredMovies = useMemo(() => movies.slice(0, 4), [movies]);
  const heroMovie = movies.find((m) => m.id === activeHeroId) ?? featuredMovies[0] ?? null;
  const rows = useMemo(
    () => GENRE_ROWS.map((row) => ({ ...row, movies: movies.filter((m) => m.genre.some((g) => row.genres.includes(g))) })).filter((row) => row.movies.length > 0),
    [movies],
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07090E] text-slate-900 dark:text-white selection:bg-[#E50914] selection:text-white flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* The navbar reads the query string to mark the current link. */}
        <Suspense>
          <NetflixNavbar />
        </Suspense>

        {heroMovie && (
          <CinematicHeroBillboard
            movie={heroMovie}
            featuredMovies={featuredMovies}
            onSelectMovie={(m) => setActiveHeroId(m.id)}
            onOpenDetailModal={setSelectedMovie}
          />
        )}

        {!heroMovie && isCatalogLoading && (
          <div className="relative w-full h-[75vh] min-h-[600px] bg-slate-200 dark:bg-[#0E1118] animate-pulse flex items-end px-4 sm:px-8 md:px-16 pb-24 select-none">
            <div className="space-y-4 max-w-xl">
              <div className="h-6 w-36 bg-slate-300 dark:bg-white/10 rounded-full" />
              <div className="h-10 sm:h-14 w-72 sm:w-96 bg-slate-300 dark:bg-white/15 rounded-xl" />
              <div className="h-16 w-full bg-slate-300 dark:bg-white/5 rounded-lg" />
            </div>
          </div>
        )}

        {!heroMovie && !isCatalogLoading && (
          <p className="pt-32 pb-16 text-center text-sm text-slate-500 dark:text-slate-400">Chưa có phim nào được phát hành.</p>
        )}

        {movies.length > 0 && (
          <div className="space-y-4 -mt-6 sm:-mt-10 md:-mt-14 relative z-30">
            <ContinueWatchingRow movies={movies} onOpenDetail={setSelectedMovie} />
            <NetflixTopTenRow movies={movies} onOpenDetail={setSelectedMovie} />
            {rows.map((row) => (
              <NetflixMovieRow
                key={row.title}
                title={row.title}
                subtitle={row.subtitle}
                movies={row.movies}
                onOpenDetail={setSelectedMovie}
                aspectRatio={row.aspectRatio}
              />
            ))}
          </div>
        )}

        <MovieDetailQuickModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      </div>

      <CinemaEnterpriseFooter />
    </div>
  );
}
