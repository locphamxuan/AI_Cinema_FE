'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Clapperboard, LayoutGrid, List, Search } from 'lucide-react';
import { InitialsAvatar } from '@/components/data/InitialsAvatar';
import { ErrorNote, Loading } from '@/components/data/ui';
import { useResource } from '@/hooks/useResource';
import { loadPipelines } from '@/services/pipelineService';
import { useAppStore } from '@/store/useAppStore';
import { FILTER_STAGE, filterQueue, toQueueItems, type QueueFilter, type QueueItem } from '../reviewQueue';
import { ReviewerQueueCard, STAGE_STYLE, episodeText } from './ReviewerQueueCard';

const CARD = 'rounded-3xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] shadow-xs dark:shadow-xl';

const FILTERS: { key: QueueFilter; label: string; active: string }[] = [
  { key: 'all', label: 'Tất cả', active: 'bg-[#121212] text-white dark:bg-white dark:text-slate-900' },
  { key: 'script', label: 'Kịch bản chờ duyệt', active: 'bg-amber-600 text-white' },
  { key: 'master', label: 'Phim cần kiểm', active: 'bg-[#121212] text-white dark:bg-white dark:text-slate-900' },
  { key: 'revising', label: 'Studio đang sửa', active: 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900' },
  { key: 'approved', label: 'Phim Final', active: 'bg-emerald-600 text-white' },
];

const isFilter = (value: string | null): value is QueueFilter => FILTERS.some((f) => f.key === value);

function QueueTable({ items }: { items: QueueItem[] }) {
  return (
    <div className={`${CARD} overflow-x-auto`}>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-black/20 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            <th className="py-3.5 px-4">Dự Án & Tập Phim</th>
            <th className="py-3.5 px-4">Biên Kịch</th>
            <th className="py-3.5 px-4">Studio</th>
            <th className="py-3.5 px-4">Trạng Thái</th>
            <th className="py-3.5 px-4 text-right">Hành Động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-3.5 px-4">
                <p className="font-extrabold text-slate-900 dark:text-white line-clamp-1">{item.title}</p>
                <p className="text-[11px] text-slate-500 font-mono">{episodeText(item)}</p>
              </td>
              <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">{item.creatorName}</td>
              <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">{item.studioName}</td>
              <td className="py-3.5 px-4">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STAGE_STYLE[item.stage].badge}`}>{item.stageLabel}</span>
              </td>
              <td className="py-3.5 px-4 text-right">
                <Link href={item.href} className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#121212] hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-semibold">
                  {STAGE_STYLE[item.stage].action} <ArrowRight className="w-3 h-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The Reviewer's queue of real projects: scripts and films to check, with a way into each. */
export function ReviewerProjectQueuePage() {
  const params = useSearchParams();
  const user = useAppStore((s) => s.user);
  const requested = params.get('filter');
  const [filter, setFilter] = useState<QueueFilter>(isFilter(requested) ? requested : 'all');
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const pipelines = useResource('reviewer-pipelines', () => loadPipelines());

  const items = useMemo(() => toQueueItems(pipelines.data ?? []), [pipelines.data]);
  const shown = filterQueue(items, filter, search);
  const countOf = (key: QueueFilter) => (key === 'all' ? items.length : items.filter((i) => i.stage === FILTER_STAGE[key]).length);
  const pending = countOf('script') + countOf('master');

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] dark:bg-[#090B10] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <section aria-label="Hồ sơ thẩm định viên" className={`${CARD} p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div className="flex items-center gap-4">
            <InitialsAvatar name={user?.name ?? 'Reviewer'} />
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Xin chào, {user?.name}</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{user?.email}</p>
            </div>
          </div>
          <Link href="/reviewer" className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#121212] hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-xs sm:text-sm font-semibold shadow-xs transition-all">
            <Clapperboard className="w-4 h-4" aria-hidden="true" /> Bàn Thẩm Định Phim <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </section>

        {pipelines.error && <ErrorNote message={pipelines.error} onRetry={pipelines.reload} />}
        {pipelines.loading && !pipelines.data && <Loading />}

        {pipelines.data && (
          <>
            <section aria-label="Thống kê thẩm định" className={`${CARD} p-5 sm:p-6 space-y-3`}>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Tiến Độ Thẩm Định</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">{pending}</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Hồ sơ đang chờ bạn xử lý</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-xs font-semibold text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-white/[0.06]">
                {FILTERS.slice(1).map((f) => (
                  <span key={f.key}>
                    <strong>{countOf(f.key)}</strong> {f.label}
                  </span>
                ))}
              </div>
            </section>

            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div role="group" aria-label="Lọc theo giai đoạn" className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    aria-pressed={filter === f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all cursor-pointer ${filter === f.key ? f.active : 'bg-white dark:bg-[#111420] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08]'}`}
                  >
                    {f.label} ({countOf(f.key)})
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm phim, Studio, Creator..." aria-label="Tìm trong hàng đợi" className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white focus:outline-none" />
                </div>
                <div className="flex items-center rounded-2xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-1">
                  {([['grid', LayoutGrid, 'Xem dạng thẻ'], ['table', List, 'Xem dạng bảng']] as const).map(([mode, Icon, label]) => (
                    <button key={mode} type="button" aria-label={label} aria-pressed={viewMode === mode} onClick={() => setViewMode(mode)} className={`p-1.5 rounded-xl cursor-pointer ${viewMode === mode ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {shown.length === 0 ? (
              <p className={`${CARD} p-10 text-center text-sm text-slate-500 dark:text-slate-400`}>{items.length ? 'Không có mục nào khớp bộ lọc.' : 'Bạn chưa phụ trách dự án nào.'}</p>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {shown.map((item) => (
                  <ReviewerQueueCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <QueueTable items={shown} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
