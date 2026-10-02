'use client';

import { useState, useMemo, useEffect } from 'react';
import { X,  Flame } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Movie } from '@/types/movie';
import NetflixNavbar from '@/components/home/NetflixNavbar';
import CinematicHeroBillboard from '@/components/home/CinematicHeroBillboard';
import NetflixTopTenRow from '@/components/home/NetflixTopTenRow';
import NetflixMovieRow from '@/components/home/NetflixMovieRow';
import ContinueWatchingRow from '@/components/home/ContinueWatchingRow';
import MovieDetailQuickModal from '@/components/home/MovieDetailQuickModal';
import ComplianceTrustBanner from '@/components/home/ComplianceTrustBanner';
import CinemaEnterpriseFooter from '@/components/home/CinemaEnterpriseFooter';
import MotchillFilterBar from '@/components/home/MotchillFilterBar';
import { filterMovies, type MovieFormat, type MovieSort } from '@/components/home/filterMovies';

export default function HomePage() {
  const { movies, isCatalogLoading, loadCatalog } = useAppStore();
  const [activeNavTab, setActiveNavTab] = useState('kham-pha');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovieModal, setSelectedMovieModal] = useState<Movie | null>(null);
  const [selectedGenrePill, setSelectedGenrePill] = useState('Tất cả');
  const [selectedFormat, setSelectedFormat] = useState<MovieFormat>('all');
  const [sortBy, setSortBy] = useState<MovieSort>('latest');
  const [activeHeroId, setActiveHeroId] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // The newest released movies lead the hero carousel.
  const featuredMovies = useMemo(() => movies.slice(0, 4), [movies]);

  // Active Hero Spotlight Movie
  const heroMovie = useMemo(() => {
    if (!movies || movies.length === 0) return null;
    if (activeHeroId) {
      const found = movies.find((m) => m.id === activeHeroId);
      if (found) return found;
    }
    return featuredMovies[0] || movies[0];
  }, [movies, activeHeroId, featuredMovies]);

  const filteredMovies = useMemo(
    () => filterMovies(movies, { search: searchQuery, navTab: activeNavTab, genre: selectedGenrePill, format: selectedFormat, sortBy }),
    [movies, searchQuery, activeNavTab, selectedGenrePill, selectedFormat, sortBy],
  );

  // Reset all filters back to Discovery default
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenrePill('Tất cả');
    setSelectedFormat('all');
    setSortBy('latest');
    setActiveNavTab('kham-pha');
  };

  // Specific Categorical Row Slices for Netflix-style home view
  const cyberpunkSciFiMovies = useMemo(() => {
    return movies.filter(
      (m) =>
        m.genre.some((g) => g.toLowerCase().includes('cyberpunk') || g.toLowerCase().includes('viễn tưởng'))
    );
  }, [movies]);

  const complianceVerifiedMovies = useMemo(() => {
    return movies.filter(
      (m) => m.aiCompliance?.reviewStatus === 'approved' || m.aiCompliance?.complianceArticle?.includes('Điều 44')
    );
  }, [movies]);

  const fantasy3DMovies = useMemo(() => {
    return movies.filter((m) =>
      m.genre.some((g) => g.includes('3D AI Fantasy') || g.includes('Võ thuật') || g.includes('Cổ trang') || g.includes('Thần thoại'))
    );
  }, [movies]);

  const actionThrillerMovies = useMemo(() => {
    return movies.filter((m) =>
      m.genre.some((g) => g.includes('Hành động') || g.includes('Giật gân') || g.includes('Tội phạm'))
    );
  }, [movies]);

  const isFilteringActive =
    !!searchQuery.trim() ||
    activeNavTab !== 'kham-pha' ||
    selectedGenrePill !== 'Tất cả' ||
    selectedFormat !== 'all' ||
    sortBy !== 'latest';

  const getFilteredTitle = () => {
    if (activeNavTab === 'phim-bo' || selectedFormat === 'series') return 'Series Phim Bộ AI Dài Tập';
    if (activeNavTab === 'phim-le' || selectedFormat === 'single') return 'Phim Lẻ AI Điện Ảnh';
    if (activeNavTab === 'anime-ai') return 'Anime & 3D AI Fantasy Siêu Nhiên';
    if (activeNavTab === 'bang-xep-hang') return 'Bảng Xếp Hạng Phim AI Xuất Sắc Nhất';
    if (selectedGenrePill !== 'Tất cả') return `Thể Loại: ${selectedGenrePill}`;
    if (searchQuery.trim()) return `Kết quả tìm kiếm cho: "${searchQuery}"`;
    return 'Kho Phim AI Được Chọn Lọc';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07090E] text-slate-900 dark:text-white selection:bg-[#E50914] selection:text-white flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* 1. Motchill & Netflix-Style Floating Navbar with Light/Dark Theme Switcher */}
        <NetflixNavbar
          activeTab={activeNavTab}
          onSelectTab={(tab) => {
            setActiveNavTab(tab);
            setSearchQuery('');
                    if (tab === 'phim-bo') setSelectedFormat('series');
            else if (tab === 'phim-le') setSelectedFormat('single');
            else if (tab === 'bang-xep-hang') setSortBy('rating');
            else if (tab === 'kham-pha') {
              setSelectedFormat('all');
              setSelectedGenrePill('Tất cả');
              setSortBy('latest');
            }
          }}
          onSearchChange={(q) => {
            setSearchQuery(q);
          }}
        />

        {/* 2. Cinematic Hero Billboard (Only on Discovery / Khám Phá tab when not filtering) */}
        {!isFilteringActive && heroMovie && (
          <CinematicHeroBillboard
            movie={heroMovie}
            featuredMovies={featuredMovies}
            onSelectMovie={(m) => setActiveHeroId(m.id)}
            onOpenDetailModal={(m) => setSelectedMovieModal(m)}
          />
        )}

        {/* Loading Skeleton if movies are still fetching from database */}
        {!isFilteringActive && !heroMovie && isCatalogLoading && (
          <div className="relative w-full h-[75vh] min-h-[600px] bg-slate-200 dark:bg-[#0E1118] animate-pulse flex items-end px-4 sm:px-8 md:px-16 pb-24 select-none">
            <div className="space-y-4 max-w-xl">
              <div className="h-6 w-36 bg-slate-300 dark:bg-white/10 rounded-full" />
              <div className="h-10 sm:h-14 w-72 sm:w-96 bg-slate-300 dark:bg-white/15 rounded-xl" />
              <div className="h-16 w-full bg-slate-300 dark:bg-white/5 rounded-lg" />
              <div className="flex gap-3 pt-2">
                <div className="h-12 w-36 bg-red-600/30 rounded-xl" />
                <div className="h-12 w-36 bg-slate-300 dark:bg-white/10 rounded-xl" />
              </div>
            </div>
          </div>
        )}

        {/* Spacing compensation if hero is not shown */}
        {isFilteringActive && <div className="h-20 sm:h-24" />}

        {/* Motchill Quick Filter Bar (Inspired by Motchill's quick genre pills & filter drawer) */}
        <MotchillFilterBar
          selectedGenre={selectedGenrePill}
          onSelectGenre={(g) => setSelectedGenrePill(g)}
          selectedFormat={selectedFormat}
          onSelectFormat={(f) => {
            setSelectedFormat(f);
            if (f === 'series' && activeNavTab !== 'phim-bo') setActiveNavTab('phim-bo');
            else if (f === 'single' && activeNavTab !== 'phim-le') setActiveNavTab('phim-le');
          }}
          sortBy={sortBy}
          onSelectSortBy={(sort) => setSortBy(sort)}
          onReset={handleResetFilters}
          totalResults={filteredMovies.length}
        />

        {/* 3. Main Content Stream */}
        {isFilteringActive ? (
          /* Motchill-style Grid layout for search / filtered / categorized views */
          <div className="px-4 sm:px-8 md:px-14 py-4 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Flame className="w-6 h-6 text-red-600 shrink-0" />
                  <span>{getFilteredTitle()}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Đang hiển thị {filteredMovies.length} bộ phim AI được tạo sinh bằng công nghệ mới nhất
                </p>
              </div>

              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-xs font-semibold text-slate-700 dark:text-slate-300 transition w-fit cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc & Quay về Khám Phá</span>
              </button>
            </div>

            <NetflixMovieRow
              title=""
              movies={filteredMovies}
              onOpenDetail={(m) => setSelectedMovieModal(m)}
              aspectRatio="16/9"
            />
          </div>
        ) : (
          /* Full Netflix Catalog Rows (Home Discovery View) */
          <div className="space-y-4 -mt-6 sm:-mt-10 md:-mt-14 relative z-30">
            {/* Row: Continue Watching (Xem Tiếp Của Bạn) */}
            <ContinueWatchingRow
              movies={movies}
              onOpenDetail={(m) => setSelectedMovieModal(m)}
            />

            {/* Row 1: Netflix-style Top 10 Ranked Row with Giant 3D Numbers */}
            <NetflixTopTenRow
              movies={movies}
              onOpenDetail={(m) => setSelectedMovieModal(m)}
            />

            {/* Row 2: Cyberpunk & Viễn Tưởng Mới Phát Hành */}
            <NetflixMovieRow
              title="Khoa Học Viễn Tưởng"
              subtitle="Thế giới tương lai qua lăng kính AI"
              badge="HOT"
              movies={cyberpunkSciFiMovies}
              onOpenDetail={(m) => setSelectedMovieModal(m)}
              aspectRatio="16/9"
            />

            {/* Row 3: Gắn nhãn tuân thủ Điều 44 Luật AI */}
            <NetflixMovieRow
              title="Đã Kiểm Duyệt & Gắn Nhãn AI"
              subtitle="Mọi tập đều qua kiểm duyệt nội dung, pháp lý và mang nhãn nội dung AI trước khi phát hành"
              badge="NHÃN AI"
              movies={complianceVerifiedMovies}
              onOpenDetail={(m) => setSelectedMovieModal(m)}
              aspectRatio="16/9"
            />

            {/* Row 5: 3D AI Fantasy & Võ Thuật Kỳ Ảo */}
            <NetflixMovieRow
              title="Hoạt Hình & Giả Tưởng"
              subtitle="Thế giới kỳ ảo tạo bằng AI"
              badge="HOẠT HÌNH"
              movies={fantasy3DMovies}
              onOpenDetail={(m) => setSelectedMovieModal(m)}
              aspectRatio="2/3"
            />

            {/* Row 6: Hành Động & Trinh Thám Giật Gân */}
            <NetflixMovieRow
              title="Hành Động & Trinh Thám Giật Gân"
              subtitle="Kịch tính, bí ẩn và nghẹt thở"
              movies={actionThrillerMovies}
              onOpenDetail={(m) => setSelectedMovieModal(m)}
              aspectRatio="16/9"
            />

            {/* Feature 7: Legal Compliance & Trust Banner */}
            <ComplianceTrustBanner />
          </div>
        )}

        {/* 4. Quick View Modal (Chi Tiết, Kịch Bản & Gắn Nhãn Điều 44) */}
        <MovieDetailQuickModal
          movie={selectedMovieModal}
          onClose={() => setSelectedMovieModal(null)}
        />
      </div>

      {/* 5. Enterprise Cinema Footer */}
      <CinemaEnterpriseFooter />
    </div>
  );
}
