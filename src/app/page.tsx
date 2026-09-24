'use client';

import { useAppStore } from '@/store/useAppStore';
import LandingHero from '@/components/landing/LandingHero';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryPills from '@/components/home/CategoryPills';
import MovieRow from '@/components/home/MovieRow';
import TopTenRow from '@/components/home/TopTenRow';

export default function HomePage() {
  const { isAuthenticated, isVIPMode, movies, selectedGenre, isCatalogLoading, catalogError } = useAppStore();

  // If not logged in -> Show Netflix-style Landing Page
  if (!isAuthenticated) {
    return <LandingHero />;
  }

  // The catalog comes back newest first; the hero and top rows take the head of it.
  const hotMovies = movies.slice(0, 5);
  const visibleMovies = selectedGenre === 'Tất cả' ? movies : movies.filter((m) => m.genre.includes(selectedGenre));
  const freeFirstEpisode = visibleMovies.filter((m) => m.episodes[0]?.isFree);

  if (movies.length === 0) {
    return (
      <div className="py-24 text-center text-sm text-muted-light">
        {isCatalogLoading ? 'Đang tải danh sách phim...' : catalogError || 'Chưa có phim nào được phát hành.'}
      </div>
    );
  }

  // If logged in -> Show Full Premium OTT Streaming Dashboard
  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* 1. Cinematic Full-Width Hero Carousel (5 Hot Movies) */}
      <HeroBanner movies={hotMovies} isVIPMode={isVIPMode} />

      {/* 2. Category Filter Pills */}
      <CategoryPills />

      {/* 3. Netflix-Style Top 10 Ranked Row */}
      <TopTenRow movies={movies.slice(0, 10)} />

      {/* 4. Latest releases, filtered by the selected genre pill */}
      {visibleMovies.length > 0 ? (
        <MovieRow
          title="Phim AI Mới Phát Hành"
          subtitle={selectedGenre === 'Tất cả' ? 'Các tác phẩm vừa được phát hành' : `Thể loại ${selectedGenre}`}
          movies={visibleMovies}
        />
      ) : (
        <p className="px-1 text-sm text-muted-light">Chưa có phim thuộc thể loại {selectedGenre}.</p>
      )}

      {/* 5. Movies whose first episode is free to watch */}
      {freeFirstEpisode.length > 0 && (
        <MovieRow
          title="Xem Miễn Phí Tập Đầu"
          subtitle="Tập 1 không tốn Coin"
          movies={freeFirstEpisode}
        />
      )}
    </div>
  );
}
