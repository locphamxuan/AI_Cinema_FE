'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Movie } from '@/types/movie';
import NetflixNavbar from '@/components/home/NetflixNavbar';
import NetflixMovieCard from '@/components/home/NetflixMovieCard';
import MovieDetailQuickModal from '@/components/home/MovieDetailQuickModal';
import CinemaEnterpriseFooter from '@/components/home/CinemaEnterpriseFooter';
import {
  filterMovies,
  filtersFromParams,
  NO_FILTERS,
  type AgeFilter,
  type MovieFilters,
  type MovieFormat,
  type MovieSort,
} from '@/components/home/filterMovies';

const FORMATS: { value: MovieFormat; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'series', label: 'Phim bộ' },
  { value: 'single', label: 'Phim lẻ' },
];

const AGES: { value: AgeFilter; label: string }[] = [
  { value: 'all', label: 'Mọi độ tuổi' },
  { value: 'everyone', label: 'Không giới hạn tuổi' },
  { value: 'T16', label: 'T16 (từ 16 tuổi)' },
  { value: 'T18', label: 'T18 (từ 18 tuổi)' },
];

const SORTS: { value: MovieSort; label: string }[] = [
  { value: 'newest', label: 'Mới phát hành' },
  { value: 'year', label: 'Năm sản xuất (mới nhất)' },
  { value: 'title', label: 'Tên phim (A–Z)' },
];

const SELECT =
  'w-full py-2 px-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-red-600 transition cursor-pointer';

/** /phim: every released movie, filtered by name, genre, format and age rating. */
export function BrowseMoviesPage() {
  const params = useSearchParams();
  // The navbar shortcuts (Phim Bộ, Hoạt Hình…) change the query: start again from it.
  return <BrowseMovies key={params.toString()} initial={filtersFromParams(params)} />;
}

function BrowseMovies({ initial }: { initial: MovieFilters }) {
  const { movies, genres, isCatalogLoading, loadCatalog } = useAppStore();
  const [filters, setFilters] = useState<MovieFilters>(initial);
  const [selected, setSelected] = useState<Movie | null>(null);
  const results = useMemo(() => filterMovies(movies, filters), [movies, filters]);
  const set = (patch: Partial<MovieFilters>) => setFilters((f) => ({ ...f, ...patch }));

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07090E] text-slate-900 dark:text-white flex flex-col justify-between">
      <div>
        <NetflixNavbar />
        <main className="max-w-[1800px] mx-auto px-4 sm:px-8 md:px-14 pt-24 pb-10 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2.5">
              <SlidersHorizontal className="w-6 h-6 text-red-600" aria-hidden="true" /> Lọc phim
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tìm phim theo tên, thể loại, loại phim và độ tuổi.</p>
          </div>

          <section aria-label="Bộ lọc" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-4">
            <label className="lg:col-span-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 space-y-1">
              <span>Tên phim</span>
              <span className="relative block">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input type="search" value={filters.search} onChange={(e) => set({ search: e.target.value })} placeholder="Nhập tên phim…" className={`${SELECT} pl-8 cursor-text`} />
              </span>
            </label>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 space-y-1">
              <span>Thể loại</span>
              <select value={filters.genre} onChange={(e) => set({ genre: e.target.value })} className={SELECT}>
                <option value="">Tất cả thể loại</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 space-y-1">
              <span>Độ tuổi</span>
              <select value={filters.age} onChange={(e) => set({ age: e.target.value as AgeFilter })} className={SELECT}>
                {AGES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 space-y-1">
              <span>Sắp xếp</span>
              <select value={filters.sortBy} onChange={(e) => set({ sortBy: e.target.value as MovieSort })} className={SELECT}>
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-2 lg:col-span-5 flex flex-wrap items-center justify-between gap-3">
              <div role="radiogroup" aria-label="Loại phim" className="flex rounded-xl bg-slate-100 dark:bg-black/30 p-1 border border-slate-200 dark:border-white/5 text-xs">
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    role="radio"
                    aria-checked={filters.format === f.value}
                    onClick={() => set({ format: f.value })}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      filters.format === f.value ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFilters(NO_FILTERS)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Xoá bộ lọc
              </button>
            </div>
          </section>

          <p className="text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
            {isCatalogLoading && movies.length === 0 ? 'Đang tải phim…' : `${results.length} phim phù hợp`}
          </p>
          {!isCatalogLoading && results.length === 0 && (
            <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">Không có phim nào khớp bộ lọc. Hãy thử bỏ bớt điều kiện.</p>
          )}
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {results.map((m) => (
              <li key={m.id}>
                <NetflixMovieCard movie={m} onOpenDetail={setSelected} aspectRatio="16/9" />
              </li>
            ))}
          </ul>
        </main>
      </div>
      <CinemaEnterpriseFooter />
      <MovieDetailQuickModal movie={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
