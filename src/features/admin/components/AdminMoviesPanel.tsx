'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Film, Search } from 'lucide-react';
import { fieldInputClass } from '@/components/ui/FormField';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useResource } from '@/features/production/hooks/useResource';
import { productionPaths } from '@/features/production/lib/routes';
import { Empty, ErrorNote, Loading, Panel } from '@/features/production/components/shared/ui';
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
    <Panel
      title="Phim đã phát hành"
      description={`${movies.data ? `${movies.data.meta.totalItems} phim` : 'Đang tải…'} đang có trên trang người xem. Mở phim để xem tập, giá và lịch phát hành.`}
      actions={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchDraft);
            setPage(1);
          }}
          className="relative"
        >
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm phim theo tên"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Tên phim…"
            className={`${fieldInputClass} pl-8 py-1.5 w-52 text-xs`}
          />
        </form>
      }
    >
      {movies.error && <ErrorNote message={movies.error} onRetry={movies.reload} />}
      {movies.loading && !movies.data && <Loading />}
      {movies.data?.data.length === 0 && <Empty>Chưa có phim nào được phát hành.</Empty>}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.data?.data.map((m) => (
          <li key={m.id}>
            <Link
              href={productionPaths.project('/admin', m.id, 'episodes')}
              className="flex gap-3 rounded-2xl border border-slate-200 dark:border-white/10 p-3 hover:border-purple-400 transition"
            >
              <div className="w-20 h-28 shrink-0 rounded-lg bg-slate-100 dark:bg-white/5 overflow-hidden flex items-center justify-center">
                {m.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- posters come from outside hosts (Commons, R2)
                  <img src={m.posterUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <Film className="w-6 h-6 text-slate-400" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 text-xs space-y-1">
                <p className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2">{m.title}</p>
                <p className="text-slate-500 dark:text-slate-400">
                  {[m.releaseYear, m.ageRating, m.genres.map((g) => g.name).join(', ')].filter(Boolean).join(' · ')}
                </p>
                {m.synopsis && <p className="text-slate-600 dark:text-slate-300 line-clamp-3">{m.synopsis}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-xs">
          <button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-500 dark:text-slate-400">
            Trang {page}/{totalPages}
          </span>
          <button type="button" aria-label="Trang sau" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 cursor-pointer">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </Panel>
  );
}
