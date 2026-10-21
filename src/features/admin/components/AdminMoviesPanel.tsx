'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Film, Search, Star, Calendar } from 'lucide-react';
import { fieldInputClass } from '@/components/ui/FormField';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useResource } from '@/features/production/hooks/useResource';
import { productionPaths } from '@/features/production/lib/routes';
import { Empty, ErrorNote, Loading } from '@/features/production/components/shared/ui';
import { apiClient } from '@/services/apiClient';
import type { Genre } from '@/types/production';

/** A movie as the public catalog lists it: at least one episode out, never cancelled. */
interface CatalogMovie {
  id: string;
  title: string;
  synopsis: string | null;
  ageRating: string | null;
  releaseYear: number | null;
  posterUrl: string | null;
  genres: Genre[];
}

interface CatalogPage {
  data: CatalogMovie[];
  meta: { totalItems: number; currentPage: number; totalPages: number };
}

function catalogUrl(page: number, search: string): string {
  const params = new URLSearchParams({ page: String(page), limit: '12', sortBy: 'createdAt:DESC' });
  if (search.trim()) params.set('search', search.trim());
  return `${API_ROUTES.MOVIES.LIST}?${params.toString()}`;
}

/**
 * Movies viewers can watch now (the public catalog). Each one is a movie project, so the Admin opens it to
 * see episodes, prices and publications, and proposes changes to its Reviewer from there (BR-55).
 */
export function AdminMoviesPanel() {
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const movies = useResource(`admin:movies:${search}:${page}`, () => apiClient.get<CatalogPage>(catalogUrl(page, search)));
  const totalPages = movies.data?.meta.totalPages ?? 1;

  return (
    <section className="space-y-0">
      {/* Hero header */}
      <div className="relative bg-gradient-to-br from-purple-700 via-violet-600 to-purple-800 overflow-hidden rounded-2xl mx-6 lg:mx-8 mt-6">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 60px, white 60px, white 62px)`,
          }}
        />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white/60 text-[11px] font-semibold uppercase tracking-widest">Catalog</span>
            </div>
            <h2 className="text-xl font-bold text-white">Phim đã phát hành</h2>
            <p className="text-white/60 text-sm mt-0.5">
              {movies.data ? `${movies.data.meta.totalItems} phim` : 'Đang tải…'} · Mở phim để xem tập, giá và lịch phát hành.
            </p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(searchDraft); setPage(1); }}
            className="relative w-full sm:w-64"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" aria-hidden="true" />
            <input
              type="search"
              aria-label="Tìm phim theo tên"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Tìm tên phim…"
              className="w-full bg-white/15 backdrop-blur-sm border border-white/25 text-white placeholder:text-white/40 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-8 py-6 space-y-4">
        {movies.error && <ErrorNote message={movies.error} onRetry={movies.reload} />}
        {movies.loading && !movies.data && <Loading />}
        {movies.data?.data.length === 0 && <Empty>Chưa có phim nào được phát hành.</Empty>}

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {movies.data?.data.map((m) => (
            <li key={m.id}>
              <Link
                href={productionPaths.project('/admin', m.id, 'episodes')}
                className="group flex flex-col rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] hover:border-purple-400/60 hover:shadow-2xl hover:shadow-purple-500/15 transition-all duration-300 overflow-hidden"
              >
                {/* Poster */}
                <div className="relative w-full aspect-[2/3] bg-slate-100 dark:bg-white/[0.04] overflow-hidden">
                  {m.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- posters come from outside hosts (Commons, R2)
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-violet-800 flex items-center justify-center">
                      <Film className="w-10 h-10 text-white/30 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Age rating */}
                  {m.ageRating && (
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      {m.ageRating}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-1.5">
                  <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {m.title}
                  </p>
                  {m.releaseYear && (
                    <p className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3 h-3" aria-hidden="true" />
                      {m.releaseYear}
                    </p>
                  )}
                  {m.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {m.genres.slice(0, 2).map((g) => (
                        <span key={g.id} className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4 text-xs">
            <button
              type="button"
              aria-label="Trang trước"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 disabled:opacity-40 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Trang {page} / {totalPages}
            </span>
            <button
              type="button"
              aria-label="Trang sau"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 disabled:opacity-40 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
