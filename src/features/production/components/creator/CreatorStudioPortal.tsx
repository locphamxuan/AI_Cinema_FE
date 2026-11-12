'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowUpRight, FileText } from 'lucide-react';
import { InitialsAvatar } from '@/components/data/InitialsAvatar';
import { ErrorNote, Loading } from '@/components/data/ui';
import { useResource } from '@/hooks/useResource';
import { loadPipelines } from '@/services/pipelineService';
import { useAppStore } from '@/store/useAppStore';
import { CinematicProjectCard, needsWriting } from './CinematicProjectCard';
import { CinematicProjectTable } from './CinematicProjectTable';
import { StudioFilterBar } from './StudioFilterBar';
import { matchesFilter, toScriptItem, type ScriptFilterKey, type ScriptProjectItem } from './scriptItems';

const CARD = 'rounded-3xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] shadow-xs';
const hrefOf = (p: ScriptProjectItem) => `/creator/projects/${p.id}${needsWriting(p) ? '?tab=script' : ''}`;

function Dot({ tone, value, label }: { tone: string; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${tone}`} />
      <span>
        {value} {label}
      </span>
    </div>
  );
}

/** The Creator's home: the projects the Admin assigned, where each script stands, and the way into each one. */
export function CreatorStudioPortal() {
  const user = useAppStore((s) => s.user);
  const initialSearch = useSearchParams().get('q') ?? '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState<ScriptFilterKey>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const pipelines = useResource('creator-pipelines', () => loadPipelines());

  const items = useMemo(() => (pipelines.data ?? []).map(toScriptItem), [pipelines.data]);
  const filtered = items.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || p.title.toLowerCase().includes(query) || p.genreTags.some((g) => g.toLowerCase().includes(query)) || !!p.studioName?.toLowerCase().includes(query);
    return matchesFilter(p, activeFilter) && matchesSearch;
  });
  const count = (...stages: ScriptProjectItem['stage'][]) => items.filter((p) => stages.includes(p.stage)).length;
  const toWrite = items.find(needsWriting);

  return (
    <div className="relative min-h-screen w-full bg-[#F9FAFB] dark:bg-[#090B10] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <section aria-label="Hồ sơ biên kịch" className={`${CARD} p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div className="flex items-center gap-4">
            <InitialsAvatar name={user?.name ?? 'Creator'} />
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Xin chào, {user?.name ?? 'Creator'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {user?.email} · Quản lý kịch bản &amp; dự án được giao
              </p>
            </div>
          </div>
          <Link
            href="/creator/profile"
            className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full border border-slate-300 dark:border-white/15 bg-white dark:bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
          >
            Hồ sơ cá nhân <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </section>

        {pipelines.error && <ErrorNote message={pipelines.error} onRetry={pipelines.reload} />}
        {pipelines.loading && !pipelines.data && <Loading />}

        {pipelines.data && (
          <>
            <section aria-label="Thống kê kịch bản" className={`${CARD} p-6 sm:p-7 space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Tiến độ kịch bản</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">{items.length}</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Dự án được giao</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Dot tone="bg-slate-400 dark:bg-slate-600" value={count('DRAFT')} label="Chưa nộp" />
                <Dot tone="bg-amber-400" value={count('IN_REVIEW', 'ADMIN_REVIEW')} label="Đang chờ duyệt" />
                <Dot tone="bg-rose-400" value={count('REVISION')} label="Cần sửa" />
                <Dot tone="bg-emerald-500" value={count('NEGOTIATING', 'HANDED_OFF')} label="Kịch bản Final" />
              </div>
            </section>

            {toWrite && (
              <section
                aria-label="Kịch bản cần viết"
                className="relative overflow-hidden rounded-3xl bg-[#0E1117] border border-slate-800 p-7 sm:p-9 text-white shadow-sm"
              >
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-100">
                      <span className={`w-2 h-2 rounded-full ${toWrite.stage === 'REVISION' ? 'bg-rose-400' : 'bg-amber-400'}`} aria-hidden="true" />
                      {toWrite.stage === 'REVISION' ? 'Có kịch bản cần sửa theo góp ý' : 'Có kịch bản đang chờ bạn viết'}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {toWrite.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {(toWrite.genreTags.slice(0, 3).join(' · ') || 'Dự án phim')} • {toWrite.totalEpisodes} tập • Reviewer phụ trách: {toWrite.reviewerName}
                    </p>
                  </div>
                  <Link
                    href={hrefOf(toWrite)}
                    className="shrink-0 inline-flex items-center gap-2 self-start md:self-auto px-5 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-semibold shadow-sm transition-all"
                  >
                    <FileText className="w-4 h-4" aria-hidden="true" />
                    Mở trình soạn kịch bản <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </section>
            )}

            <StudioFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalFilteredCount={filtered.length}
            />

            <section aria-label="Danh sách dự án">
              {filtered.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-12 text-center bg-white dark:bg-[#141724]">
                  <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3" aria-hidden="true" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{items.length ? 'Không có dự án khớp bộ lọc' : 'Bạn chưa được giao dự án nào'}</h3>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filtered.map((project) => (
                    <CinematicProjectCard key={project.id} project={project} href={hrefOf(project)} />
                  ))}
                </div>
              ) : (
                <CinematicProjectTable projects={filtered} getHref={hrefOf} />
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
