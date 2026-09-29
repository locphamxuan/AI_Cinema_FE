'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { Movie } from '@/types/movie';
import NetflixNavbar from '@/components/home/NetflixNavbar';
import CinematicHeroBillboard from '@/components/home/CinematicHeroBillboard';
import NetflixTopTenRow from '@/components/home/NetflixTopTenRow';
import NetflixMovieRow from '@/components/home/NetflixMovieRow';
import ContinueWatchingRow from '@/components/home/ContinueWatchingRow';
import MovieDetailQuickModal from '@/components/home/MovieDetailQuickModal';

export default function HomePage() {
  const { movies, isCatalogLoading, loadCatalog } = useAppStore();
  const [activeNavTab, setActiveNavTab] = useState('kham-pha');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovieModal, setSelectedMovieModal] = useState<Movie | null>(null);
  const [selectedGenrePill, setSelectedGenrePill] = useState('Tất cả');

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Hero Spotlight Movie: select first movie with rich banner, or first movie in catalog
  const heroMovie = useMemo(() => {
    if (!movies || movies.length === 0) return null;
    return movies.find((m) => m.bannerUrl && m.bannerUrl.length > 0 && m.episodes.length > 0) || movies[0];
  }, [movies]);

  // Filtered by Search or NavTab
  const filteredMovies = useMemo(() => {
    let result = [...movies];

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

    if (activeNavTab === 'series-ai') {
      result = result.filter((m) => m.isSeries || m.totalEpisodes > 1);
    } else if (activeNavTab === 'chieu-rap-ai') {
      result = result.filter((m) => !m.isSeries || m.totalEpisodes === 1 || m.badge?.includes('Chiếu Rạp'));
    } else if (activeNavTab === 'the-loai' && selectedGenrePill !== 'Tất cả') {
      result = result.filter((m) => m.genre.includes(selectedGenrePill));
    }

    return result;
  }, [movies, searchQuery, activeNavTab, selectedGenrePill]);

  // Specific Categorical Row Slices
  const cyberpunkSciFiMovies = useMemo(() => {
    return movies.filter((m) => m.genre.includes('Cyberpunk') || m.genre.includes('Khoa học viễn tưởng'));
  }, [movies]);

  const complianceVerifiedMovies = useMemo(() => {
    return movies.filter(
      (m) => m.aiCompliance?.reviewStatus === 'approved' && m.aiCompliance?.complianceArticle?.includes('Điều 44')
    );
  }, [movies]);

  const fantasy3DMovies = useMemo(() => {
    return movies.filter((m) => m.genre.includes('3D AI Fantasy') || m.genre.includes('Mecha') || m.genre.includes('Cổ trang'));
  }, [movies]);

  const genresList = ['Tất cả', 'Cyberpunk', 'Khoa học viễn tưởng', '3D AI Fantasy', 'Anime AI', 'Giật gân', 'Hành động'];

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white selection:bg-[#E50914] selection:text-white pb-24">
      {/* 1. Netflix-Style Transparent-to-Dark Floating Navbar */}
      <NetflixNavbar
        activeTab={activeNavTab}
        onSelectTab={(tab) => {
          setActiveNavTab(tab);
          setSearchQuery('');
        }}
        onSearchChange={setSearchQuery}
      />

      {/* 2. Cinematic Hero Billboard (Only on Discovery / Khám Phá tab when not searching) */}
      {!searchQuery && activeNavTab === 'kham-pha' && heroMovie && (
        <CinematicHeroBillboard
          movie={heroMovie}
          onOpenDetailModal={(m) => setSelectedMovieModal(m)}
        />
      )}

      {/* Loading Skeleton if movies are still fetching from database */}
      {!searchQuery && activeNavTab === 'kham-pha' && !heroMovie && isCatalogLoading && (
        <div className="relative w-full h-[75vh] min-h-[580px] bg-[#0E1118] animate-pulse flex items-end px-4 sm:px-8 md:px-16 pb-20 select-none">
          <div className="space-y-4 max-w-xl">
            <div className="h-6 w-36 bg-white/10 rounded-full" />
            <div className="h-10 sm:h-14 w-72 sm:w-96 bg-white/15 rounded-xl" />
            <div className="h-16 w-full bg-white/5 rounded-lg" />
            <div className="flex gap-3 pt-2">
              <div className="h-12 w-36 bg-red-600/30 rounded-xl" />
              <div className="h-12 w-36 bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Spacing compensation if hero is not shown */}
      {(searchQuery || activeNavTab !== 'kham-pha') && <div className="h-24 sm:h-28" />}

      {/* Search Header Notification if searching */}
      {searchQuery && (
        <div className="px-4 sm:px-8 md:px-12 pt-4 pb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Kết quả tìm kiếm cho: <span className="text-[#E50914]">&ldquo;{searchQuery}&rdquo;</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Tìm thấy {filteredMovies.length} tác phẩm AI phù hợp</p>
        </div>
      )}

      {/* Genre Filter Pills (Visible when on 'the-loai' or when exploring) */}
      {activeNavTab === 'the-loai' && (
        <div className="px-4 sm:px-8 md:px-12 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {genresList.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenrePill(g)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedGenrePill === g
                  ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* 3. Main Content Stream */}
      {searchQuery || activeNavTab !== 'kham-pha' ? (
        /* Grid layout for search / filtered views */
        <div className="px-4 sm:px-8 md:px-12 py-6">
          <NetflixMovieRow
            title={
              activeNavTab === 'series-ai'
                ? 'Series Phim AI Dài Tập'
                : activeNavTab === 'chieu-rap-ai'
                ? 'Phim Điện Ảnh AI Chiếu Rạp'
                : activeNavTab === 'bang-xep-hang'
                ? 'Bảng Xếp Hạng Đánh Giá Cao Nhất'
                : `Thể Loại: ${selectedGenrePill}`
            }
            movies={filteredMovies}
            onOpenDetail={(m) => setSelectedMovieModal(m)}
            aspectRatio="16/9"
          />
        </div>
      ) : (
        /* Full Netflix Catalog Rows (Home View) */
        <div className="space-y-4 -mt-10 sm:-mt-16 md:-mt-24 relative z-30">
          {/* Row 4: Continue Watching (Xem Tiếp Của Bạn) */}
          <ContinueWatchingRow
            movies={movies}
            onOpenDetail={(m) => setSelectedMovieModal(m)}
          />

          {/* Row 1: Netflix-style Top 10 Ranked Row with Giant Numbers */}
          <NetflixTopTenRow
            movies={movies}
            onOpenDetail={(m) => setSelectedMovieModal(m)}
          />

          {/* Row 2: Cyberpunk & Viễn Tưởng Mới Phát Hành */}
          <NetflixMovieRow
            title="Phim Cyberpunk & Viễn Tưởng Mới Phát Hành"
            subtitle="Độ phân giải 4K HDR siêu thực"
            badge="HOT"
            movies={cyberpunkSciFiMovies}
            onOpenDetail={(m) => setSelectedMovieModal(m)}
            aspectRatio="16/9"
          />

          {/* Row 3: Gắn nhãn tuân thủ Điều 44 Luật AI */}
          <NetflixMovieRow
            title="Dự Án Độc Quyền Được Gắn Nhãn AI (Compliance Passed - Điều 44)"
            subtitle="Chứng nhận minh bạch công nghệ theo Điều 18 NĐ 142/2026/NĐ-CP"
            badge="VERIFIED"
            movies={complianceVerifiedMovies}
            onOpenDetail={(m) => setSelectedMovieModal(m)}
            aspectRatio="16/9"
          />

          {/* Row 5: 3D AI Fantasy & Anime */}
          <NetflixMovieRow
            title="3D AI Fantasy & Anime Viễn Tưởng"
            subtitle="Tác phẩm kỳ ảo tạo sinh bằng Unreal Engine & AI Pipeline"
            movies={fantasy3DMovies}
            onOpenDetail={(m) => setSelectedMovieModal(m)}
            aspectRatio="2/3"
          />
        </div>
      )}

      {/* 4. Quick View Modal (Chi Tiết, Kịch Bản & Gắn Nhãn Điều 44) */}
      <MovieDetailQuickModal
        movie={selectedMovieModal}
        onClose={() => setSelectedMovieModal(null)}
      />
    </div>
  );
}
