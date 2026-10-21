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
  LayoutGrid,
  List,
  Building2,
  Calendar,
  Sparkles,
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
import { CARD, Empty, ErrorNote, Loading, StatusPill } from '../shared/ui';
import { CreateProjectModal } from './CreateProjectModal';

const FILTERS: { key: string; label: string; status?: MovieStatus[]; icon: React.ElementType }[] = [
  { key: 'all', label: 'Tất cả', icon: Layers },
  { key: 'plan', label: 'Đang lên kế hoạch', status: ['DRAFT', 'ASSIGNED'], icon: Clock },
  { key: 'production', label: 'Đang sản xuất', status: ['IN_PRODUCTION', 'UNDER_REVISION'], icon: Clapperboard },
  { key: 'done', label: 'Hoàn tất', status: ['COMPLETED'], icon: CheckCircle2 },
  { key: 'cancelled', label: 'Đã huỷ', status: ['CANCELLED'], icon: XCircle },
];

const STATUS_GRADIENTS: Partial<Record<MovieStatus, string>> = {
  DRAFT: 'from-slate-600 via-slate-700 to-slate-800',
  ASSIGNED: 'from-blue-600 via-indigo-600 to-slate-900',
  IN_PRODUCTION: 'from-purple-700 via-violet-600 to-indigo-900',
  UNDER_REVISION: 'from-amber-600 via-orange-600 to-slate-900',
  COMPLETED: 'from-emerald-600 via-teal-600 to-slate-900',
  CANCELLED: 'from-rose-700 via-red-800 to-slate-950',
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const status = FILTERS.find((f) => f.key === filter)?.status;
  const projects = useResource(`projects:${filter}:${search}:${page}`, () =>
    productionService.listProjects({ page, search, status }),
  );
  const canCreate = can(PERMISSION.PROJECT_MANAGE);
  const isCreator = base === '/creator';

  const heroGradient = isCreator
    ? 'from-blue-700 via-indigo-600 to-purple-800'
    : base === '/admin'
      ? 'from-purple-800 via-violet-700 to-slate-900'
      : 'from-emerald-700 via-teal-700 to-slate-900';

  const totalCount = projects.data?.meta.totalItems ?? 0;

  return (
    <main className="w-full">
      {/* ── Cinematic Hero Banner ── */}
      <div className={`relative bg-gradient-to-br ${heroGradient} overflow-hidden shadow-md`}>
        {/* Film frame grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 58px, white 58px, white 60px),
              repeating-linear-gradient(0deg, transparent, transparent 58px, white 58px, white 60px)`,
          }}
        />
        {/* Glow circles */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-10 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                {isCreator ? 'Không gian Creator' : base === '/admin' ? 'Quản trị hệ thống' : 'Kiểm duyệt nội dung'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              Dự án phim
            </h1>
            <p className="text-white/70 text-xs md:text-sm max-w-2xl leading-relaxed">
              {isCreator
                ? 'Các dự án bạn tham gia: bàn giao Studio, cập nhật mốc Studio, upload Submission và theo dõi kiểm duyệt.'
                : base === '/admin'
                  ? 'Mọi dự án phim trên nền tảng. Admin xem mọi dự án và duyệt đề xuất của Reviewer/Creator, không sửa trực tiếp (BR-55).'
                  : 'Đặt hàng studio sản xuất, duyệt tập, gắn nhãn AI và phát hành.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {totalCount > 0 && (
              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-white text-center hidden sm:block">
                <span className="block text-[10px] uppercase font-bold text-white/60">Tổng cộng</span>
                <span className="text-base font-black font-mono">{totalCount}</span>
              </div>
            )}
            {canCreate && (
              <Button
                onClick={() => setCreating(true)}
                className="bg-white text-slate-900 hover:bg-white/90 shadow-lg font-bold border-0"
              >
                <Plus className="w-4 h-4 text-purple-600" aria-hidden="true" /> Tạo dự án mới
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter Bar & Controls ── */}
      <div className="px-6 lg:px-8 py-4 border-b border-slate-200/70 dark:border-white/5 bg-white dark:bg-[#0F1117] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Status filters */}
        <div role="tablist" aria-label="Lọc theo trạng thái" className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setFilter(f.key);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search + View mode toggler */}
        <div className="flex items-center gap-2">
          <form
            role="search"
            className="relative w-full md:w-64"
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
              placeholder="Tìm phim, studio…"
              aria-label="Tìm dự án"
              className={`${fieldInputClass} pl-9 py-1.5 text-xs rounded-xl`}
            />
          </form>

          {/* Toggle Grid / Table */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Xem dạng thẻ poster"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-white/15 text-purple-600 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Xem dạng bảng"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-white/15 text-purple-600 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="px-6 lg:px-8 py-6 space-y-6">
        {projects.error && <ErrorNote message={projects.error} onRetry={projects.reload} />}
        {projects.loading && !projects.data && <Loading />}

        {projects.data && (
          <>
            {projects.data.data.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-12 text-center bg-white/40 dark:bg-white/[0.01]">
                <Film className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {isCreator ? 'Chưa có dự án nào được giao cho bạn.' : 'Không có dự án nào khớp bộ lọc.'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {isCreator ? 'Khi Reviewer phân công dự án cho bạn, phim sẽ hiển thị tại đây.' : 'Thử đổi từ khoá tìm kiếm hoặc chọn bộ lọc khác.'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              /* ── Grid Gallery View ── */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {projects.data.data.map((p) => {
                  const href = productionPaths.project(base, p.id);
                  const gradient = STATUS_GRADIENTS[p.status] ?? 'from-purple-800 to-indigo-900';
                  const episodeCount = p._count?.episodes ?? 0;
                  const studioName = p.studio?.name ?? null;
                  const personInCharge = isCreator ? p.reviewer?.fullName : p.creator?.fullName;
                  const posterUrl = (p as unknown as { posterUrl?: string | null }).posterUrl;

                  return (
                    <Link
                      key={p.id}
                      href={href}
                      className="group flex flex-col rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] hover:border-purple-400/60 dark:hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-900/30 transition-all duration-300 overflow-hidden cursor-pointer"
                    >
                      {/* ── Poster Thumbnail ── */}
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                        {posterUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={posterUrl}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                            {/* Film pattern background */}
                            <div
                              className="absolute inset-0 opacity-15"
                              style={{
                                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 16px, white 16px, white 18px)`,
                              }}
                            />
                            <div className="relative w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 shadow-lg">
                              <Film className="w-7 h-7 text-white/80" />
                            </div>
                          </div>
                        )}

                        {/* Top Overlay Badge: Status */}
                        <div className="absolute top-3 left-3 z-10 drop-shadow-md">
                          <StatusPill {...MOVIE_STATUS[p.status]} />
                        </div>

                        {/* Bottom Overlay Badges */}
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between z-10">
                          <span className="text-white text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/20">
                            {episodeCount} tập
                          </span>
                          {p.lastActivityAt && (
                            <span className="text-white/70 text-[10px] font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-white/60" />
                              {formatDateTime(p.lastActivityAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ── Card Body ── */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {p.title}
                          </h2>
                        </div>

                        {/* Meta footer chips */}
                        <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-[11px]">
                          {studioName && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="truncate font-medium">{studioName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <span className="w-4 h-4 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-[9px] shrink-0">
                              {personInCharge ? personInCharge.charAt(0) : '?'}
                            </span>
                            <span className="truncate">
                              {isCreator ? 'Reviewer: ' : 'Creator: '}
                              <b className="font-semibold">{personInCharge ?? 'Chưa giao'}</b>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* ── Classic Table View (cho ai muốn xem dạng bảng) ── */
              <div className={`${CARD} overflow-hidden`}>
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-left">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Phim</th>
                      <th className="px-4 py-3 font-semibold">Trạng thái</th>
                      <th className="px-4 py-3 font-semibold hidden md:table-cell">Studio</th>
                      <th className="px-4 py-3 font-semibold hidden md:table-cell">{isCreator ? 'Reviewer' : 'Creator'}</th>
                      <th className="px-4 py-3 font-semibold hidden sm:table-cell text-right">Số tập</th>
                      <th className="px-4 py-3 font-semibold hidden lg:table-cell">Cập nhật lần cuối</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {projects.data.data.map((p) => {
                      const href = productionPaths.project(base, p.id);
                      return (
                        <tr
                          key={p.id}
                          onClick={() => router.push(href)}
                          className="hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3">
                            <Link href={href} className="font-semibold text-slate-900 dark:text-white hover:underline hover:text-purple-600" onClick={(e) => e.stopPropagation()}>
                              {p.title}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill {...MOVIE_STATUS[p.status]} />
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
                            {p.studio?.name ?? '—'}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
                            {(isCreator ? p.reviewer?.fullName : p.creator?.fullName) ?? 'Chưa giao'}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-right text-slate-600 dark:text-slate-300 font-bold font-mono">
                            {p._count?.episodes ?? '—'}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell text-slate-500 dark:text-slate-400">
                            {formatDateTime(p.lastActivityAt ?? p.updatedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {projects.data.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6 text-xs text-slate-500">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Trang trước"
                  className="rounded-xl border border-slate-200 dark:border-white/10"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="font-semibold">
                  Trang {projects.data.meta.currentPage} / {projects.data.meta.totalPages}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page >= projects.data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Trang sau"
                  className="rounded-xl border border-slate-200 dark:border-white/10"
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
