'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, Play } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { savedMovieService, type SavedMovieItem } from '@/services/savedMovieService';
import MovieDetailQuickModal from '@/components/home/MovieDetailQuickModal';
import type { Movie } from '@/types/movie';
import { toast } from '@/components/ui/Toast';
import { Pager, pageOf } from '@/features/production/components/shared/Pager';

export default function SavedMoviesPage() {
  const { isAuthenticated, openAuthModal } = useAppStore();
  const [movies, setMovies] = useState<SavedMovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [page, setPage] = useState(1);
  const paged = pageOf(movies, page, 12);

  const fetchSaved = () =>
    savedMovieService
      .list()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setMovies(res.data);
        }
      })
      .finally(() => setLoading(false));

  const loadSaved = () => {
    setLoading(true);
    fetchSaved();
  };

  useEffect(() => {
    if (isAuthenticated) fetchSaved();
  }, [isAuthenticated]);

  const handleUnsave = async (e: React.MouseEvent, movie: SavedMovieItem) => {
    e.stopPropagation();
    // Optimistic removal
    setMovies((prev) => prev.filter((m) => m.id !== movie.id));
    const res = await savedMovieService.unsave(movie.id);
    if (res.success) {
      toast.success('Đã bỏ lưu phim', `Đã xóa "${movie.title}" khỏi danh sách xem sau.`);
    } else {
      toast.error('Không thể bỏ lưu', 'Vui lòng thử lại sau.');
      loadSaved();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4 animate-fade-in">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Đăng nhập để xem danh sách lưu</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Lưu lại những bộ phim AI yêu thích của bạn và đồng bộ trên mọi thiết bị máy tính, điện thoại.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-ruby hover:bg-ruby-light text-white font-bold text-xs shadow-lg shadow-ruby/20 transition-all cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12 px-4 sm:px-0">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="flex items-center gap-2.5 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Phim đã lưu
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 tabular-nums">
              {movies.length} phim
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Danh sách các bộ phim bạn đã đánh dấu để xem lại sau.
          </p>
        </div>

        <Link
          href="/phim"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-ruby bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors w-fit"
        >
          Khám phá thêm phim
        </Link>
      </div>

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="aspect-[2/3] rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && movies.length === 0 && (
        <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.01]">
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white">Bạn chưa lưu phim nào</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Bấm biểu tượng Bookmark ở trang chi tiết phim bất kỳ để lưu lại vào danh sách này.
            </p>
          </div>
          <Link
            href="/phim"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ruby hover:bg-ruby-light text-white font-bold text-xs shadow-md shadow-ruby/20 transition-all"
          >
            Khám phá phim ngay
          </Link>
        </div>
      )}

      {/* ── Movie Poster Grid ── */}
      {!loading && movies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {paged.rows.map((movie) => (
            <div
              key={movie.id}
              onClick={() => setSelectedMovie(movie)}
              className="group relative rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl hover:border-ruby/30 transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Poster Image */}
              <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
                <img
                  src={movie.posterUrl || movie.bannerUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Dark Vignette Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-60 group-hover:opacity-90 transition-opacity" />

                {/* Top Badge: Quality or Age */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/15">
                    {movie.ageRating || '18+'}
                  </span>
                </div>

                {/* Remove Bookmark Button (Top Right) */}
                <button
                  type="button"
                  onClick={(e) => handleUnsave(e, movie)}
                  title="Bỏ lưu phim này"
                  aria-label={`Bỏ lưu ${movie.title}`}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/70 hover:bg-danger text-white/90 hover:text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 shadow-md cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Play Icon in Center on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-ruby text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom info on poster */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-ruby-light transition-colors drop-shadow">
                    {movie.title}
                  </p>
                  <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                    {Array.isArray(movie.genre) ? movie.genre.slice(0, 2).join(' • ') : movie.genre}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pager page={page} totalPages={paged.totalPages} onChange={setPage} className="pt-6" />

      {/* Modal for viewing detail */}
      <MovieDetailQuickModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
}
