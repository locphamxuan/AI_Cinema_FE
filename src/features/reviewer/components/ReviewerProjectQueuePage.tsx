'use client';

import { GreetingCard } from '@/components/data/GreetingCard';
import { StageBar } from '@/components/data/StageBar';
import { useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LayoutGrid, List, Search } from 'lucide-react';
import { Pager, pageOf } from '@/components/data/Pager';
import { ErrorNote, Loading } from '@/components/data/ui';
import { useResource } from '@/hooks/useResource';
import { loadPipelines } from '@/services/pipelineService';
import { useAppStore } from '@/store/useAppStore';
import { FILTER_STAGE, filterQueue, toQueueItems, type QueueFilter, type QueueItem } from '../reviewQueue';
import { ReviewerQueueCard, STAGE_STYLE, episodeText } from './ReviewerQueueCard';

const CARD = 'rounded-2xl bg-card ring-1 ring-foreground/10 shadow-xs';

/** Each stage keeps its dashboard hue on the bar, the filter and the card chip. */
const FILTERS: { key: QueueFilter; label: string; hue: string }[] = [
  { key: 'all', label: 'Tất cả', hue: 'var(--foreground)' },
  { key: 'script', label: 'Kịch bản chờ duyệt', hue: 'var(--viz-2)' },
  { key: 'master', label: 'Phim cần duyệt', hue: 'var(--viz-1)' },
  { key: 'revising', label: 'Studio đang sửa', hue: 'var(--viz-5)' },
  { key: 'approved', label: 'Phim bản cuối', hue: 'var(--viz-3)' },
];

const isFilter = (value: string | null): value is QueueFilter => FILTERS.some((f) => f.key === value);

function QueueTable({ items }: { items: QueueItem[] }) {
  return (
    <div className={`${CARD} overflow-x-auto`}>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/60 text-muted-foreground font-bold text-[11px]">
            <th className="py-3.5 px-4">Dự án & tập phim</th>
            <th className="py-3.5 px-4">Biên kịch</th>
            <th className="py-3.5 px-4">Studio</th>
            <th className="py-3.5 px-4">Trạng thái</th>
            <th className="py-3.5 px-4 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-3.5 px-4">
                <p className="font-extrabold text-foreground line-clamp-1">{item.title}</p>
                <p className="text-[11px] text-muted-foreground tabular-nums">{episodeText(item)}</p>
              </td>
              <td className="py-3.5 px-4 font-medium text-foreground">{item.creatorName}</td>
              <td className="py-3.5 px-4 font-medium text-foreground">{item.studioName}</td>
              <td className="py-3.5 px-4">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STAGE_STYLE[item.stage].badge}`}>{item.stageLabel}</span>
              </td>
              <td className="py-3.5 px-4 text-right">
                <Link href={item.href} className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                  {STAGE_STYLE[item.stage].action}
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
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const pipelines = useResource('reviewer-pipelines', () => loadPipelines());

  const items = useMemo(() => toQueueItems(pipelines.data ?? []), [pipelines.data]);
  const shown = filterQueue(items, filter, search);
  const { rows, totalPages } = pageOf(shown, page, viewMode === 'grid' ? 6 : 10);
  const countOf = (key: QueueFilter) => (key === 'all' ? items.length : items.filter((i) => i.stage === FILTER_STAGE[key]).length);
  const pending = countOf('script') + countOf('master');

  const handleFilter = (f: QueueFilter) => {
    setFilter(f);
    setPage(1);
  };
  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <GreetingCard
          label="Hồ sơ Reviewer"
          name={user?.name ?? 'Reviewer'}
          summary="Dự án bạn phụ trách: kịch bản chờ duyệt, bản phim Studio vừa nộp và những tập cần sửa."
          figures={
            pipelines.data
              ? [
                  { label: 'Chờ bạn xử lý', value: pending },
                  { label: 'Kịch bản chờ duyệt', value: countOf('script') },
                  { label: 'Phim cần duyệt', value: countOf('master') },
                ]
              : undefined
          }
          action={
            <Link href="/reviewer" className="inline-flex h-10 items-center rounded-lg bg-[#F5B83D] px-5 text-sm font-semibold text-[#1C1830] shadow-sm shadow-black/30 transition-colors hover:bg-[#FCD98A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Mở trang duyệt phim
            </Link>
          }
        />

        {pipelines.error && <ErrorNote message={pipelines.error} onRetry={pipelines.reload} />}
        {pipelines.loading && !pipelines.data && <Loading />}

        {pipelines.data && (
          <>
            <StageBar
              title="Tiến độ duyệt"
              headline={{ value: items.length, label: 'hồ sơ bạn phụ trách' }}
              segments={FILTERS.slice(1).map((f) => ({ label: f.label, value: countOf(f.key), color: f.hue }))}
            />

            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div role="group" aria-label="Lọc theo giai đoạn" className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    aria-pressed={filter === f.key}
                    onClick={() => handleFilter(f.key)}
                    style={{ '--hue': f.hue } as CSSProperties}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 whitespace-nowrap transition-colors cursor-pointer ${filter === f.key ? 'border-(--hue) bg-(--hue)/12 text-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted'}`}
                  >
                    <span className="size-2 rounded-full bg-(--hue)" aria-hidden="true" />
                    {f.label} ({countOf(f.key)})
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <input type="search" value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Tìm phim, Studio, Creator…" aria-label="Tìm trong danh sách chờ duyệt" className="w-full pl-9 pr-3 py-2 rounded-2xl bg-card border border-border text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-reel/40" />
                </div>
                <div className="flex items-center rounded-2xl bg-card border border-border p-1">
                  {([['grid', LayoutGrid, 'Xem dạng thẻ'], ['table', List, 'Xem dạng bảng']] as const).map(([mode, Icon, label]) => (
                    <button key={mode} type="button" aria-label={label} aria-pressed={viewMode === mode} onClick={() => { setViewMode(mode); setPage(1); }} className={`p-1.5 rounded-xl cursor-pointer ${viewMode === mode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-secondary-foreground'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {shown.length === 0 ? (
              <p className={`${CARD} p-10 text-center text-sm text-muted-foreground`}>{items.length ? 'Không có mục nào khớp bộ lọc.' : 'Bạn chưa phụ trách dự án nào.'}</p>
            ) : viewMode === 'grid' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rows.map((item) => (
                    <ReviewerQueueCard key={item.id} item={item} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center pt-2">
                    <Pager page={Math.min(page, totalPages)} totalPages={totalPages} onChange={setPage} />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <QueueTable items={rows} />
                {totalPages > 1 && (
                  <div className="flex justify-center pt-2">
                    <Pager page={Math.min(page, totalPages)} totalPages={totalPages} onChange={setPage} />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
