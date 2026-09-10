'use client';

import { useAppStore } from '@/store/useAppStore';
import LandingHero from '@/components/landing/LandingHero';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryPills from '@/components/home/CategoryPills';
import MovieRow from '@/components/home/MovieRow';
import TopTenRow from '@/components/home/TopTenRow';
import { trendingMovies, recommendedMovies, top10Movies, allMockMovies } from '@/mocks/mockData';

export default function HomePage() {
  const { isAuthenticated, isVIPMode, currentMovie } = useAppStore();

  // If not logged in -> Show Netflix-style Landing Page
  if (!isAuthenticated) {
    return <LandingHero />;
  }

  // If logged in -> Show Full Premium OTT Streaming Dashboard
  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* 1. Cinematic Hero Banner with Ambient Glow */}
      <HeroBanner movie={currentMovie} isVIPMode={isVIPMode} />

      {/* 2. Category Filter Pills */}
      <CategoryPills />

      {/* 3. Netflix-Style Top 10 Ranked Row */}
      <TopTenRow movies={top10Movies} />

      {/* 4. Trending AI Movies Horizontal Row */}
      <MovieRow
        title="Phim AI Đang Thịnh Hành"
        subtitle="Các tác phẩm được cộng đồng xem nhiều nhất trong tuần"
        movies={trendingMovies}
        exploreHref="/watch/ep-001"
      />

      {/* 5. Personalized Recommendation Row */}
      <MovieRow
        title="Gợi Ý Dành Riêng Cho Bạn"
        subtitle="Dựa trên thể loại AI & Cyberpunk bạn vừa xem"
        movies={recommendedMovies}
        exploreHref="/watch/ep-002"
      />

      {/* 6. AI Cinema Studio Originals */}
      <MovieRow
        title="Tác Phẩm Độc Quyền AI Cinema"
        subtitle="Sản xuất bằng mô hình Sora Vision Pro & CinemaGen v3.2"
        movies={allMockMovies}
        exploreHref="/watch/ep-001"
      />
    </div>
  );
}
