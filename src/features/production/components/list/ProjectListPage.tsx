'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { productionService } from '@/services/productionService';
import type { MovieStatus } from '@/types/production';
import { useResource } from '../../hooks/useResource';
import { MOVIE_STATUS } from '../../lib/labels';
import { formatDateTime } from '../../lib/format';
import { baseFromPath, productionPaths } from '../../lib/routes';
import { CARD, Empty, ErrorNote, Loading, StatusPill } from '../shared/ui';
import { CreateProjectModal } from './CreateProjectModal';

const FILTERS: { key: string; label: string; status?: MovieStatus[] }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'plan', label: 'Đang lên kế hoạch', status: ['DRAFT', 'ASSIGNED'] },
  { key: 'production', label: 'Đang sản xuất', status: ['IN_PRODUCTION', 'UNDER_REVISION'] },
  { key: 'done', label: 'Hoàn tất', status: ['COMPLETED'] },
  { key: 'cancelled', label: 'Đã huỷ', status: ['CANCELLED'] },
];

/** Projects the account may see (own projects of a Reviewer, assigned ones of a Creator, all for the Admin). */
export function ProjectListPage() {
  const base = baseFromPath(usePathname());
  const router = useRouter();
  const can = useCan();
  const [filter, setFilter] = useState('all');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);

  const status = FILTERS.find((f) => f.key === filter)?.status;
  const projects = useResource(`projects:${filter}:${search}:${page}`, () =>
    productionService.listProjects({ page, search, status }),
  );
  const canCreate = can(PERMISSION.PROJECT_MANAGE);
  const isCreator = base === '/creator';

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dự án phim</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isCreator
              ? 'Các dự án được giao cho bạn: bàn giao studio, giao tập và theo dõi kiểm duyệt.'
              : 'Đặt hàng studio sản xuất, duyệt tập, gắn nhãn AI và phát hành.'}
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4" aria-hidden="true" /> Tạo dự án
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div role="tablist" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                filter === f.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <form
          role="search"
          className="relative w-full md:w-72"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchDraft);
            setPage(1);
          }}
        >
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Tìm theo tên phim hoặc studio…"
            aria-label="Tìm dự án"
            className={`${fieldInputClass} pl-8`}
          />
        </form>
      </div>

      {projects.error && <ErrorNote message={projects.error} onRetry={projects.reload} />}
      {projects.loading && !projects.data && <Loading />}

      {projects.data && (
        <div className={`${CARD} overflow-hidden`}>
          {projects.data.data.length === 0 ? (
            <Empty>{isCreator ? 'Chưa có dự án nào được giao cho bạn.' : 'Không có dự án nào khớp bộ lọc.'}</Empty>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-left">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Phim</th>
                  <th className="px-4 py-2.5 font-medium">Trạng thái</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">Studio</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">{isCreator ? 'Reviewer' : 'Creator'}</th>
                  <th className="px-4 py-2.5 font-medium hidden sm:table-cell text-right">Số tập</th>
                  <th className="px-4 py-2.5 font-medium hidden lg:table-cell">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {projects.data.data.map((p) => {
                  const href = productionPaths.project(base, p.id);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => router.push(href)}
                      className="hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <Link href={href} className="font-semibold text-slate-900 dark:text-white hover:underline" onClick={(e) => e.stopPropagation()}>
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill {...MOVIE_STATUS[p.status]} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-600 dark:text-slate-300">{p.studioName ?? '—'}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
                        {(isCreator ? p.reviewer?.fullName : p.creator?.fullName) ?? 'Chưa giao'}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-right text-slate-600 dark:text-slate-300">{p._count?.episodes ?? '—'}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-500 dark:text-slate-400">{formatDateTime(p.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {projects.data.meta.totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500">
              <span>
                Trang {projects.data.meta.currentPage}/{projects.data.meta.totalPages}
              </span>
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Trang trước">
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={page >= projects.data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Trang sau"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {creating && (
        <CreateProjectModal
          onClose={() => setCreating(false)}
          onCreated={(id) => router.push(productionPaths.project(base, id))}
        />
      )}
    </main>
  );
}
