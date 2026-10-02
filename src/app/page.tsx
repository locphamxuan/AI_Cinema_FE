'use client';

import { useState, useMemo, useEffect } from 'react';
import { Film, Sparkles, Filter, X, Search, ShieldCheck, Flame, Tv, Clapperboard, Award } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Movie } from '@/types/movie';
import NetflixNavbar from '@/components/home/NetflixNavbar';
import CinematicHeroBillboard from '@/components/home/CinematicHeroBillboard';
import NetflixTopTenRow from '@/components/home/NetflixTopTenRow';
import NetflixMovieRow from '@/components/home/NetflixMovieRow';
import ContinueWatchingRow from '@/components/home/ContinueWatchingRow';
import MovieDetailQuickModal from '@/components/home/MovieDetailQuickModal';
import StudioPartnerShowcase from '@/components/home/StudioPartnerShowcase';
import ComplianceTrustBanner from '@/components/home/ComplianceTrustBanner';
import CinemaEnterpriseFooter from '@/components/home/CinemaEnterpriseFooter';
import MotchillFilterBar from '@/components/home/MotchillFilterBar';

export default function HomePage() {
  const { movies, isCatalogLoading, loadCatalog } = useAppStore();
  const [activeNavTab, setActiveNavTab] = useState('kham-pha');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovieModal, setSelectedMovieModal] = useState<Movie | null>(null);
  const [selectedGenrePill, setSelectedGenrePill] = useState('Tất cả');
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'series' | 'single'>('all');
  const [selectedStudioFilter, setSelectedStudioFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'popular'>('latest');
  const [activeHeroId, setActiveHeroId] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Featured Blockbuster Movies for Hero Spotlight Carousel
  const featuredMovies = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    const cyber = movies.find((m) => m.title.includes('Cyber Saigon 2077'));
    const huyenThoai = movies.find((m) => m.title.includes('Huyền Thoại Đại Ngàn'));
    const saoHoa = movies.find((m) => m.title.includes('Sao Hỏa 2099'));
    const voLam = movies.find((m) => m.title.includes('Võ Lâm Mộng Cảnh'));

    const list = [cyber, huyenThoai, saoHoa, voLam].filter(Boolean) as Movie[];
    // Fill up to 4 if needed
    for (const m of movies) {
      if (list.length >= 4) break;
      if (!list.some((item) => item.id === m.id)) list.push(m);
    }
    return list;
  }, [movies]);

  // Active Hero Spotlight Movie
  const heroMovie = useMemo(() => {
    if (!movies || movies.length === 0) return null;
    if (activeHeroId) {
      const found = movies.find((m) => m.id === activeHeroId);
      if (found) return found;
    }
    return featuredMovies[0] || movies[0];
  }, [movies, activeHeroId, featuredMovies]);

  // Filtered by Search, NavTab, Motchill Filters, Genre Pill, or Studio
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    // Search text query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre.some((g) => g.toLowerCase().includes(q)) ||
          m.description.toLowerCase().includes(q) ||
          (m.partnerStudio && m.partnerStudio.toLowerCase().includes(q))
      );
    }

    // Studio filter
    if (selectedStudioFilter) {
      result = result.filter(
        (m) => m.partnerStudio && m.partnerStudio.toLowerCase().includes(selectedStudioFilter.toLowerCase())
      );
    }

    // Genre pill
    if (selectedGenrePill !== 'Tất cả') {
      result = result.filter((m) =>
        m.genre.some((g) => g.toLowerCase().includes(selectedGenrePill.toLowerCase()))
      );
    }

    // Format filter (Series vs Single Movie per Motchill style)
    const effectiveFormat =
      activeNavTab === 'phim-bo'
        ? 'series'
        : activeNavTab === 'phim-le'
        ? 'single'
        : selectedFormat;

    if (effectiveFormat === 'series') {
      result = result.filter((m) => m.isSeries || m.totalEpisodes > 1);
    } else if (effectiveFormat === 'single') {
      result = result.filter((m) => !m.isSeries && m.totalEpisodes <= 1);
    }

    // Anime / 3D AI filter
    if (activeNavTab === 'anime-ai') {
      result = result.filter((m) =>
        m.genre.some(
          (g) =>
            g.toLowerCase().includes('hoạt hình') ||
            g.toLowerCase().includes('anime') ||
            g.toLowerCase().includes('3d') ||
            g.toLowerCase().includes('fantasy')
        )
      );
    }

    // Sorting
    const effectiveSort = activeNavTab === 'bang-xep-hang' ? 'rating' : sortBy;
    if (effectiveSort === 'rating') {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (effectiveSort === 'popular') {
      result = [...result].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (effectiveSort === 'latest') {
      result = [...result].sort((a, b) => (b.year || 2026) - (a.year || 2026));
    }

    return result;
  }, [movies, searchQuery, activeNavTab, selectedGenrePill, selectedStudioFilter, selectedFormat, sortBy]);

  // Reset all filters back to Discovery default
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenrePill('Tất cả');
    setSelectedFormat('all');
    setSelectedStudioFilter(null);
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
    !!selectedStudioFilter ||
    selectedGenrePill !== 'Tất cả' ||
    selectedFormat !== 'all' ||
    sortBy !== 'latest';

  const getFilteredTitle = () => {
    if (selectedStudioFilter) return `Phim Thuộc Studio: ${selectedStudioFilter}`;
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
            setSelectedStudioFilter(null);
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
            if (q) setSelectedStudioFilter(null);
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
          selectedStudio={selectedStudioFilter}
          onSelectStudio={(s) => setSelectedStudioFilter(s)}
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
              title="Phim Cyberpunk & Viễn Tưởng Đột Phá"
              subtitle="Độ phân giải 4K HDR tạo sinh siêu thực"
              badge="HOT"
              movies={cyberpunkSciFiMovies}
              onOpenDetail={(m) => setSelectedMovieModal(m)}
              aspectRatio="16/9"
            />

            {/* Row 3: Gắn nhãn tuân thủ Điều 44 Luật AI */}
            <NetflixMovieRow
              title="Dự Án Độc Quyền Đã Kiểm Duyệt (Compliance Passed - Điều 44)"
              subtitle="Chứng nhận minh bạch công nghệ theo Điều 18 NĐ 142/2026/NĐ-CP"
              badge="VERIFIED"
              movies={complianceVerifiedMovies}
              onOpenDetail={(m) => setSelectedMovieModal(m)}
              aspectRatio="16/9"
            />

            {/* Feature 4: Studio Partners Marketplace Showcase */}
            <StudioPartnerShowcase
              onSelectStudio={(studioName) => {
                setSelectedStudioFilter(studioName);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Row 5: 3D AI Fantasy & Võ Thuật Kỳ Ảo */}
            <NetflixMovieRow
              title="3D AI Fantasy & Anime Siêu Thực"
              subtitle="Tác phẩm kỳ ảo tạo sinh bằng Pipeline Unreal Engine & Gen-AI"
              badge="3D CGI"
              movies={fantasy3DMovies}
              onOpenDetail={(m) => setSelectedMovieModal(m)}
              aspectRatio="2/3"
            />

            {/* Row 6: Hành Động & Trinh Thám Giật Gân */}
            <NetflixMovieRow
              title="Hành Động & Trinh Thám Giật Gân"
              subtitle="Kịch tính và nghẹt thở cùng công nghệ tạo hình diễn viên AI"
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
