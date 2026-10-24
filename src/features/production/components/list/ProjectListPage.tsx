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

const HERO: Record<ProductionBase, { gradient: string; area: string; intro: string }> = {
  '/creator': {
    gradient: 'from-blue-700 via-indigo-600 to-purple-800',
    area: 'Không gian Creator',
    intro: 'Các dự án bạn tham gia: bàn giao Studio, cập nhật mốc Studio, upload Submission và theo dõi kiểm duyệt.',
  },
  '/reviewer': {
    gradient: 'from-emerald-700 via-teal-700 to-slate-900',
    area: 'Kiểm duyệt nội dung',
    intro: 'Đặt hàng studio sản xuất, duyệt tập, gắn nhãn AI và phát hành.',
  },
  '/admin': {
    gradient: 'from-purple-800 via-violet-700 to-slate-900',
    area: 'Quản trị hệ thống',
    intro: 'Mọi dự án phim trên nền tảng. Admin xem mọi dự án và duyệt đề xuất của Reviewer/Creator, không sửa trực tiếp (BR-55).',
  },
};

const GRID_LINES = `repeating-linear-gradient(90deg, transparent, transparent 58px, white 58px, white 60px),
  repeating-linear-gradient(0deg, transparent, transparent 58px, white 58px, white 60px)`;

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
  const hero = HERO[base];
  const totalCount = projects.data?.meta.totalItems ?? 0;

  return (
    <main className="w-full">
      <div className={`relative bg-gradient-to-br ${hero.gradient} overflow-hidden shadow-md`}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: GRID_LINES }} />
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-10 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">{hero.area}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">Dự án phim</h1>
            <p className="text-white/70 text-xs md:text-sm max-w-2xl leading-relaxed">{hero.intro}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {totalCount > 0 && (
              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-white text-center hidden sm:block">
                <span className="block text-[10px] uppercase font-bold text-white/60">Tổng cộng</span>
                <span className="text-base font-black font-mono">{totalCount}</span>
              </div>
            )}
            {canCreate && (
              <Button onClick={() => setCreating(true)} className="!bg-white !text-slate-900 hover:!bg-white/90 shadow-lg font-bold border-0">
                <Plus className="w-4 h-4 text-purple-600" aria-hidden="true" /> Tạo dự án mới
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-4 border-b border-slate-200/70 dark:border-white/5 bg-white dark:bg-[#0F1117] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filter === key
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
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
              className={`${fieldInputClass} pl-9 py-1.5 text-xs rounded-xl`}
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
                    ? 'bg-white dark:bg-white/15 text-purple-600 dark:text-white shadow-xs'
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
              <div className="rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-12 text-center bg-white/40 dark:bg-white/[0.01]">
                <Film className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" aria-hidden="true" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {isCreator ? 'Chưa có dự án nào được giao cho bạn.' : 'Không có dự án nào khớp bộ lọc.'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {isCreator ? 'Khi Reviewer phân công dự án cho bạn, phim sẽ hiển thị tại đây.' : 'Thử đổi từ khoá tìm kiếm hoặc chọn bộ lọc khác.'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <ProjectGrid projects={projects.data.data} base={base} />
            ) : (
              <ProjectTable projects={projects.data.data} base={base} />
            )}

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
        <CreateProjectModal onClose={() => setCreating(false)} onCreated={(id) => router.push(productionPaths.project(base, id))} />
      )}
    </main>
  );
}
