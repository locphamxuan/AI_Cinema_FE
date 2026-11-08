'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FileText, Heart } from 'lucide-react';
import { InitialsAvatar } from '@/components/data/InitialsAvatar';
import { ErrorNote, Loading } from '@/components/data/ui';
import { useResource } from '@/hooks/useResource';
import { loadPipelines } from '@/services/pipelineService';
import { useAppStore } from '@/store/useAppStore';
import { CinematicProjectCard, needsWriting } from './CinematicProjectCard';
import { CinematicProjectTable } from './CinematicProjectTable';
import { StudioFilterBar } from './StudioFilterBar';
import { matchesFilter, toScriptItem, type ScriptFilterKey, type ScriptProjectItem } from './types';

const CARD = 'rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 shadow-xs';
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
    <div className="relative min-h-screen w-full bg-[#FAF9F6] dark:bg-[#0D0F17] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <section aria-label="Hồ sơ biên kịch" className={`${CARD} p-6 sm:p-7 flex items-center gap-4`}>
          <InitialsAvatar name={user?.name ?? 'Creator'} />
          <div className="space-y-0.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Xin chào, {user?.name}</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{user?.email}</p>
          </div>
        </section>

        {pipelines.error && <ErrorNote message={pipelines.error} onRetry={pipelines.reload} />}
        {pipelines.loading && !pipelines.data && <Loading />}

        {pipelines.data && (
          <>
            <section aria-label="Thống kê kịch bản" className={`${CARD} p-7 space-y-5`}>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tiến Độ Kịch Bản</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{items.length}</span>
                <span className="text-base font-bold text-slate-500 dark:text-slate-400">Dự án được giao</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Dot tone="bg-slate-300 dark:bg-slate-600" value={count('DRAFT')} label="Chưa nộp" />
                <Dot tone="bg-amber-400" value={count('IN_REVIEW', 'ADMIN_REVIEW')} label="Đang chờ duyệt" />
                <Dot tone="bg-rose-400" value={count('REVISION')} label="Cần sửa" />
                <Dot tone="bg-emerald-400" value={count('NEGOTIATING', 'HANDED_OFF')} label="Kịch bản Final" />
              </div>
            </section>

            {toWrite && (
              <section aria-label="Kịch bản cần viết" className={`${CARD} p-10 text-center space-y-4`}>
                <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-400/10 border border-amber-200/60 dark:border-amber-400/20 mx-auto flex items-center justify-center text-amber-500">
                  <Heart className="w-6 h-6 fill-amber-400/30" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{toWrite.stage === 'REVISION' ? 'Có kịch bản cần sửa theo góp ý' : 'Có kịch bản đang chờ bạn viết'}</h3>
                <Link href={hrefOf(toWrite)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 text-xs font-bold">
                  <FileText className="w-4 h-4" aria-hidden="true" /> Mở kịch bản: {toWrite.title}
                </Link>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
