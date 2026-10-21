'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Film,
  Clapperboard,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
} from 'lucide-react';
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
import { Empty, ErrorNote, Loading, StatusPill } from '../shared/ui';
import { CreateProjectModal } from './CreateProjectModal';

const FILTERS: { key: string; label: string; status?: MovieStatus[]; icon: React.ElementType }[] = [
  { key: 'all', label: 'Tất cả', icon: Layers },
  { key: 'plan', label: 'Kế hoạch', status: ['DRAFT', 'ASSIGNED'], icon: Clock },
  { key: 'production', label: 'Sản xuất', status: ['IN_PRODUCTION', 'UNDER_REVISION'], icon: Clapperboard },
  { key: 'done', label: 'Hoàn tất', status: ['COMPLETED'], icon: CheckCircle2 },
  { key: 'cancelled', label: 'Đã huỷ', status: ['CANCELLED'], icon: XCircle },
];

const STATUS_COLOR: Partial<Record<MovieStatus, string>> = {
  DRAFT: 'from-slate-500 to-slate-600',
  ASSIGNED: 'from-blue-500 to-blue-600',
  IN_PRODUCTION: 'from-purple-600 to-violet-600',
  UNDER_REVISION: 'from-amber-500 to-orange-500',
  COMPLETED: 'from-emerald-500 to-teal-500',
  CANCELLED: 'from-rose-500 to-red-600',
};

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

  const areaGradient = isCreator
    ? 'from-blue-600 via-purple-600 to-violet-700'
    : base === '/admin'
      ? 'from-purple-700 via-violet-600 to-purple-800'
      : 'from-emerald-600 via-teal-600 to-cyan-700';

  return (
    <main className="w-full">
      {/* ── Hero Banner ── */}
      <div className={`relative bg-gradient-to-br ${areaGradient} overflow-hidden`}>
        {/* Decorative film strip pattern */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 48px, white 48px, white 50px),
              repeating-linear-gradient(0deg, transparent, transparent 48px, white 48px, white 50px)`,
          }}
        />
        {/* Glow circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 px-6 lg:px-8 py-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                {isCreator ? 'Creator' : base === '/admin' ? 'Admin' : 'Reviewer'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dự án phim</h1>
            <p className="text-white/60 text-sm mt-1 max-w-lg">
              {isCreator
                ? 'Các dự án được giao cho bạn: bàn giao studio, giao tập và theo dõi kiểm duyệt.'
                : base === '/admin'
                  ? 'Mọi dự án phim trên nền tảng. Admin xem và gửi đề xuất sửa cho Reviewer.'
                  : 'Đặt hàng studio sản xuất, duyệt tập, gắn nhãn AI và phát hành.'}
            </p>
          </div>
          {canCreate && (
            <Button
              onClick={() => setCreating(true)}
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 shadow-lg shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> Tạo dự án
            </Button>
          )}
        </div>
      </div>

      {/* ── Filters + Search ── */}
      <div className="px-6 lg:px-8 py-4 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#0F1117] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div role="tablist" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => { setFilter(f.key); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filter === f.key
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <Icon className="w-3 h-3" aria-hidden="true" />
                {f.label}
              </button>
            );
          })}
        </div>
        <form
          role="search"
          className="relative w-full md:w-72"
          onSubmit={(e) => { e.preventDefault(); setSearch(searchDraft); setPage(1); }}
        >
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Tìm theo tên phim hoặc studio…"
            aria-label="Tìm dự án"
            className={`${fieldInputClass} pl-9`}
          />
        </form>
      </div>

      {/* ── Content ── */}
      <div className="px-6 lg:px-8 py-6">
        {projects.error && <ErrorNote message={projects.error} onRetry={projects.reload} />}
        {projects.loading && !projects.data && <Loading />}

        {projects.data && (
          <>
            {projects.data.data.length === 0 ? (
              <Empty>{isCreator ? 'Chưa có dự án nào được giao cho bạn.' : 'Không có dự án nào khớp bộ lọc.'}</Empty>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {projects.data.data.map((p) => {
                  const href = productionPaths.project(base, p.id);
                  const gradientBar = STATUS_COLOR[p.status] ?? 'from-slate-500 to-slate-600';
                  return (
                    <Link
                      key={p.id}
                      href={href}
                      className="group flex flex-col rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] hover:border-purple-400/50 dark:hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-900/30 transition-all duration-300 overflow-hidden"
                    >
                      {/* Poster area */}
                      <div className="relative w-full aspect-[16/9] bg-slate-100 dark:bg-white/[0.04] overflow-hidden">
                        {/* Gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradientBar} opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />
                        {/* Film icon watermark */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Film className="w-10 h-10 text-white/20 group-hover:text-white/30 group-hover:scale-110 transition-all duration-300" />
                        </div>
                        {/* Status badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <StatusPill {...MOVIE_STATUS[p.status]} />
                        </div>
                        {/* Episode count */}
                        {p._count?.episodes !== undefined && (
                          <div className="absolute bottom-2.5 right-2.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                            {p._count.episodes} tập
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col flex-1 p-3.5 gap-2">
                        <p className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {p.title}
                        </p>
                        <div className="flex flex-col gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-auto">
                          {p.studioName && (
                            <span className="truncate">🎬 {p.studioName}</span>
                          )}
                          <span className="truncate">
                            👤 {(isCreator ? p.reviewer?.fullName : p.creator?.fullName) ?? 'Chưa giao'}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500">
                            🕐 {formatDateTime(p.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {projects.data.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8 text-xs text-slate-500">
                <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Trang trước"
                  className="border border-slate-200 dark:border-white/10">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="font-medium">
                  Trang {projects.data.meta.currentPage} / {projects.data.meta.totalPages}
                </span>
                <Button
                  size="sm" variant="ghost"
                  disabled={page >= projects.data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Trang sau"
                  className="border border-slate-200 dark:border-white/10"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {creating && (
        <CreateProjectModal
          onClose={() => setCreating(false)}
          onCreated={(id) => router.push(productionPaths.project(base, id))}
        />
      )}
    </main>
  );
}
