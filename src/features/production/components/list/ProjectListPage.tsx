'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { productionService } from '@/services/productionService';
import type { MovieStatus } from '@/types/production';
import { useResource } from '../../hooks/useResource';
import { baseFromPath, productionPaths, type ProductionBase } from '../../lib/routes';
import { ErrorNote, Loading } from '../shared/ui';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectGrid } from './ProjectGrid';
import { ProjectTable } from './ProjectTable';

const FILTERS: { key: string; label: string; status?: MovieStatus[]; icon: React.ElementType }[] = [
  { key: 'all', label: 'Tất cả', icon: Layers },
  { key: 'plan', label: 'Đang lên kế hoạch', status: ['DRAFT', 'ASSIGNED'], icon: Clock },
  { key: 'production', label: 'Đang sản xuất', status: ['IN_PRODUCTION', 'UNDER_REVISION'], icon: Clapperboard },
  { key: 'done', label: 'Hoàn tất', status: ['COMPLETED'], icon: CheckCircle2 },
  { key: 'cancelled', label: 'Đã huỷ', status: ['CANCELLED'], icon: XCircle },
];

const VIEWS = [
  { key: 'grid', label: 'Xem dạng thẻ poster', icon: LayoutGrid },
  { key: 'table', label: 'Xem dạng bảng', icon: List },
] as const;

type ViewMode = (typeof VIEWS)[number]['key'];

/** What each role does with its projects, under the page title. */
const INTRO: Record<ProductionBase, string> = {
  '/creator': 'Các dự án bạn được giao: gửi brief cho Studio, cập nhật tiến độ và nộp bản phim Studio giao.',
  '/reviewer': 'Các dự án bạn phụ trách: đặt hàng Studio, duyệt từng tập, gắn nhãn AI và phát hành.',
  '/admin': 'Mọi dự án trên nền tảng. Admin theo dõi và duyệt đề xuất của Reviewer, Creator, không sửa trực tiếp dự án.',
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
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const status = FILTERS.find((f) => f.key === filter)?.status;
  const projects = useResource(`projects:${filter}:${search}:${page}`, () =>
    productionService.listProjects({ page, search, status }),
  );
  const canCreate = can(PERMISSION.PROJECT_MANAGE);
  const isCreator = base === '/creator';
  const totalCount = projects.data?.meta.totalItems ?? 0;

  return (
    <main className="w-full">
      <div className="bg-white dark:bg-[#0F1C27]">
        <div className="h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-coral-400" aria-hidden="true" />
        <div className="px-6 lg:px-8 pt-6 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Dự án phim
              {totalCount > 0 && <span className="ml-3 text-base font-medium text-slate-400 tabular-nums">{totalCount}</span>}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{INTRO[base]}</p>
          </div>
          {canCreate && (
            <Button onClick={() => setCreating(true)} className="shrink-0">
              <Plus className="w-4 h-4" aria-hidden="true" /> Tạo dự án
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-8 py-3 border-y border-sky-100 dark:border-white/5 bg-white dark:bg-[#0F1C27] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div role="tablist" aria-label="Lọc theo trạng thái" className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => {
                setFilter(key);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 ${
                filter === key
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

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
              className={`${fieldInputClass} pl-9 py-2`}
            />
          </form>

          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shrink-0">
            {VIEWS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setViewMode(key)}
                aria-label={label}
                aria-pressed={viewMode === key}
                title={label}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === key
                    ? 'bg-white dark:bg-white/15 text-sky-700 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 space-y-6">
        {projects.error && <ErrorNote message={projects.error} onRetry={projects.reload} />}
        {projects.loading && !projects.data && <Loading />}

        {projects.data && (
          <>
            {projects.data.data.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sky-200 dark:border-white/10 p-12 text-center bg-white dark:bg-white/[0.02]">
                <Film className="w-10 h-10 mx-auto text-sky-300 dark:text-slate-600 mb-3" aria-hidden="true" />
                <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  {isCreator ? 'Bạn chưa được giao dự án nào' : 'Không có dự án nào khớp bộ lọc'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {isCreator ? 'Dự án sẽ hiện ở đây khi Reviewer giao cho bạn.' : 'Đổi từ khoá hoặc chọn trạng thái khác.'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <ProjectGrid projects={projects.data.data} base={base} />
            ) : (
              <ProjectTable projects={projects.data.data} base={base} />
            )}

            {projects.data.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6 text-sm text-slate-500">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Trang trước"
                  className="rounded-xl border border-sky-100 dark:border-white/10"
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
                  className="rounded-xl border border-sky-100 dark:border-white/10"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {creating && (
        <CreateProjectModal onClose={() => setCreating(false)} onCreated={(id) => router.push(productionPaths.project(base, id))} />
      )}
    </main>
  );
}
