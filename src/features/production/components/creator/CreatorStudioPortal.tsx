'use client';

import { GreetingCard } from '@/components/data/GreetingCard';
import { StageBar } from '@/components/data/StageBar';
import { useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Pager, pageOf } from '@/components/data/Pager';
import { ErrorNote, Loading } from '@/components/data/ui';
import { useResource } from '@/hooks/useResource';
import { loadPipelines } from '@/services/pipelineService';
import { useAppStore } from '@/store/useAppStore';
import { CinematicProjectCard, needsWriting } from './CinematicProjectCard';
import { CinematicProjectTable } from './CinematicProjectTable';
import { StudioFilterBar } from './StudioFilterBar';
import { matchesFilter, toScriptItem, type ScriptFilterKey, type ScriptProjectItem } from './scriptItems';

const hrefOf = (p: ScriptProjectItem) => `/creator/projects/${p.id}${needsWriting(p) ? '?tab=script' : ''}`;
const PAGE_SIZE = 6;

/** The Creator's home: the projects the Admin assigned, where each script stands, and the way into each one. */
export function CreatorStudioPortal() {
  const user = useAppStore((s) => s.user);
  const initialSearch = useSearchParams().get('q') ?? '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState<ScriptFilterKey>('all');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const pipelines = useResource('creator-pipelines', () => loadPipelines());

  const items = useMemo(() => (pipelines.data ?? []).map(toScriptItem), [pipelines.data]);
  const filtered = items.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || p.title.toLowerCase().includes(query) || p.genreTags.some((g) => g.toLowerCase().includes(query)) || !!p.studioName?.toLowerCase().includes(query);
    return matchesFilter(p, activeFilter) && matchesSearch;
  });
  const { rows, totalPages } = pageOf(filtered, page, PAGE_SIZE);
  const count = (...stages: ScriptProjectItem['stage'][]) => items.filter((p) => stages.includes(p.stage)).length;
  const toWrite = items.find(needsWriting);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setPage(1);
  };

  const handleFilterChange = (f: ScriptFilterKey) => {
    setActiveFilter(f);
    setPage(1);
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <GreetingCard
          label="Hồ sơ biên kịch"
          name={user?.name ?? 'Creator'}
          summary="Kịch bản và dự án được giao cho bạn, với bước tiếp theo của từng dự án."
          figures={
            pipelines.data
              ? [
                  { label: 'Dự án được giao', value: items.length },
                  { label: 'Cần viết hoặc sửa', value: count('DRAFT', 'REVISION') },
                  { label: 'Đang chờ duyệt', value: count('IN_REVIEW', 'ADMIN_REVIEW') },
                ]
              : undefined
          }
          action={
            <Link href="/creator/profile" className="inline-flex h-10 items-center rounded-lg border border-white/25 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Hồ sơ cá nhân
            </Link>
          }
        />

        {pipelines.error && <ErrorNote message={pipelines.error} onRetry={pipelines.reload} />}
        {pipelines.loading && !pipelines.data && <Loading />}

        {pipelines.data && (
          <>
            <StageBar
              title="Tiến độ kịch bản"
              headline={{ value: items.length, label: 'dự án được giao' }}
              segments={[
                { label: 'Chưa nộp', value: count('DRAFT'), color: 'var(--viz-4)' },
                { label: 'Đang chờ duyệt', value: count('IN_REVIEW', 'ADMIN_REVIEW'), color: 'var(--viz-2)' },
                { label: 'Cần sửa', value: count('REVISION'), color: 'var(--viz-5)' },
                { label: 'Kịch bản bản cuối', value: count('NEGOTIATING', 'HANDED_OFF'), color: 'var(--viz-3)' },
              ]}
            />

            {toWrite && (
              <section
                aria-label="Kịch bản cần viết"
                className="relative overflow-hidden rounded-2xl bg-card p-6 pl-8 shadow-xs ring-1 ring-foreground/10 before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-(--edge) sm:p-7 sm:pl-9"
                style={{ '--edge': toWrite.stage === 'REVISION' ? 'var(--viz-5)' : 'var(--viz-2)' } as CSSProperties}
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                  <div className="max-w-2xl space-y-2">
                    <p className="inline-flex items-center gap-2 rounded-full bg-(--edge)/12 px-3 py-1 text-xs font-semibold text-foreground">
                      <span className="size-2 rounded-full bg-(--edge)" aria-hidden="true" />
                      {toWrite.stage === 'REVISION' ? 'Có kịch bản cần sửa theo góp ý' : 'Có kịch bản đang chờ bạn viết'}
                    </p>
                    <h3 className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{toWrite.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {toWrite.genreTags.slice(0, 3).join(', ') || 'Dự án phim'}, {toWrite.totalEpisodes} tập. Reviewer phụ trách: {toWrite.reviewerName}
                    </p>
                  </div>
                  <Link
                    href={hrefOf(toWrite)}
                    className="inline-flex h-10 shrink-0 items-center self-start rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white shadow-sm shadow-purple-600/25 transition-colors hover:bg-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-reel md:self-auto"
                  >
                    Mở trình soạn kịch bản
                  </Link>
                </div>
              </section>
            )}

            <StudioFilterBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalFilteredCount={filtered.length}
            />

            <section aria-label="Danh sách dự án" className="space-y-6">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                  <h3 className="text-base font-bold text-foreground">{items.length ? 'Không có dự án khớp bộ lọc' : 'Bạn chưa được giao dự án nào'}</h3>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rows.map((project) => (
                    <CinematicProjectCard key={project.id} project={project} href={hrefOf(project)} />
                  ))}
                </div>
              ) : (
                <CinematicProjectTable projects={rows} getHref={hrefOf} />
              )}
              {totalPages > 1 && (
                <div className="pt-2 flex justify-center">
                  <Pager page={Math.min(page, totalPages)} totalPages={totalPages} onChange={setPage} />
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
