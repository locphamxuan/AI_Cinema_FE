'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Film, Clapperboard, Clock, CheckCircle2, XCircle, Layers, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { productionService } from '@/services/productionService';
import type { MovieStatus } from '@/types/production';
import { useResource } from '@/hooks/useResource';
import { baseFromPath, productionPaths, type ProductionBase } from '../../lib/routes';
import { ErrorNote, Loading } from '@/components/data/ui';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectGrid } from './ProjectGrid';
import { ProjectTable } from './ProjectTable';
import { CreatorAnalyticsSection } from './CreatorAnalyticsSection';
import { DataPagination } from '@/components/data/DataPagination';

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
  '/creator': 'Các dự án bạn được giao: trao đổi ý tưởng với Admin, viết kịch bản và theo dõi Studio sản xuất.',
  '/reviewer': 'Các dự án bạn phụ trách: lên mùa/tập, duyệt kịch bản và phim Studio nộp, gắn nhãn AI, đặt giá và xác nhận Phim Final.',
  '/admin': 'Mọi dự án trên nền tảng. Admin tạo dự án, giao Creator, duyệt Kịch bản Final, ký hợp đồng với Studio và phát hành Phim Final.',
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
  const canCreate = can(PERMISSION.PROJECT_CREATE);
  const isCreator = base === '/creator';
  const totalCount = projects.data?.meta.totalItems ?? 0;

  return (
    <main className="w-full bg-[#F9FAFB] dark:bg-[#090B10] min-h-[calc(100vh-3.5rem)]">
      <div className="bg-white dark:bg-[#111420]">
        <div className="px-6 lg:px-8 pt-6 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Dự án phim
              {totalCount > 0 && <span className="ml-3 text-base font-medium text-slate-400 tabular-nums">{totalCount}</span>}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{INTRO[base]}</p>
          </div>
          {canCreate && (
            <Button onClick={() => setCreating(true)} className="shrink-0 rounded-full bg-[#121212] text-white hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
              Tạo dự án
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-8 py-3 border-y border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] flex flex-col md:flex-row md:items-center justify-between gap-3">
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
                filter === key
                  ? 'bg-[#121212] text-white font-semibold dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
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
                    ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs'
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
            {projects.data.data.length > 0 && (
              <CreatorAnalyticsSection
                projects={projects.data.data}
                roleTitle={isCreator ? 'Creator' : base === '/reviewer' ? 'Reviewer' : 'Admin'}
              />
            )}

            {projects.data.data.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-12 text-center bg-white dark:bg-white/[0.02]">
                <Film className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" aria-hidden="true" />
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

            <DataPagination
              page={page}
              totalPages={projects.data.meta.totalPages}
              totalItems={projects.data.meta.totalItems}
              pageSize={projects.data.meta.itemsPerPage}
              unit="dự án"
              onChange={setPage}
              className="pt-6"
            />
          </>
        )}
      </div>

      {creating && (
        <CreateProjectModal onClose={() => setCreating(false)} onCreated={(id) => router.push(productionPaths.project(base, id))} />
      )}
    </main>
  );
}
