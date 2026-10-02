'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Ban } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useCan } from '@/hooks/useCan';
import { productionService } from '@/services/productionService';
import { useResource } from '../../hooks/useResource';
import { projectCapabilities } from '../../lib/capabilities';
import { MOVIE_STATUS } from '../../lib/labels';
import { baseFromPath, productionPaths } from '../../lib/routes';
import { ErrorNote, Loading, StatusPill } from '../shared/ui';
import { ProjectProvider } from './ProjectContext';
import { OverviewTab } from './OverviewTab';
import { EpisodesTab } from './EpisodesTab';
import { StudioTab } from './StudioTab';
import { FeeTab } from './FeeTab';
import { ChangeRequestsTab } from './ChangeRequestsTab';
import { ActivityTab } from './ActivityTab';

const TABS = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'episodes', label: 'Tập phim' },
  { key: 'studio', label: 'Studio' },
  { key: 'fee', label: 'Phí sản xuất' },
  { key: 'changes', label: 'Đề xuất của Admin' },
  { key: 'activity', label: 'Lịch sử' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/** Admin proposals are between the Admin and the Reviewer (BR-55); the Creator does not see them. */
const tabsFor = (base: string) => (base === '/creator' ? TABS.filter((t) => t.key !== 'changes') : TABS);

/** One movie project, for its Reviewer, its Creator and the Admin; actions follow role, ownership and status. */
export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const base = baseFromPath(pathname);
  const userId = useAppStore((s) => s.user?.id);
  const can = useCan();

  const tabs = tabsFor(base);
  const requested = searchParams.get('tab');
  const [tab, setTab] = useState<TabKey>(tabs.some((t) => t.key === requested) ? (requested as TabKey) : 'overview');
  const project = useResource(`project:${projectId}`, () => productionService.getProject(projectId));

  const selectTab = (key: TabKey) => {
    setTab(key);
    router.replace(productionPaths.project(base, projectId, key === 'overview' ? undefined : key), { scroll: false });
  };

  if (project.loading && !project.data) return <Loading label="Đang tải dự án…" />;
  if (!project.data) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <ErrorNote message={project.error ?? 'Không tìm thấy dự án.'} onRetry={project.reload} />
        <Link href={productionPaths.list(base)} className="text-xs text-purple-600 hover:underline">
          ← Về danh sách dự án
        </Link>
      </main>
    );
  }

  const data = project.data;
  const caps = projectCapabilities(data, userId, can);
  const totalEpisodes = data.seasons.reduce((n, s) => n + s.episodes.length, 0);

  return (
    <ProjectProvider value={{ project: data, caps, base, reload: project.reload }}>
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="space-y-2">
          <Link href={productionPaths.list(base)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-purple-600">
            <ArrowLeft className="w-3 h-3" aria-hidden="true" /> Dự án phim
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{data.title}</h1>
            <StatusPill {...MOVIE_STATUS[data.status]} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Reviewer: {data.reviewer.fullName} · Creator: {data.creator?.fullName ?? 'chưa giao'} · Studio: {data.studioName ?? 'chưa bàn giao'} ·{' '}
            {data.seasons.length} mùa, {totalEpisodes} tập
          </p>
        </div>

        {data.status === 'CANCELLED' && (
          <p className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
            <Ban className="w-4 h-4 shrink-0" aria-hidden="true" /> Dự án đã huỷ: {data.cancelReason}
          </p>
        )}
        {data.revision.episodeCount > 0 && (
          <p className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            Đang sửa {data.revision.episodeCount} tập —{' '}
            {data.revision.bySeason.map((s) => `mùa ${s.seasonNumber}: tập ${s.episodeNumbers.join(', ')}`).join('; ')}
          </p>
        )}

        <div role="tablist" aria-label="Mục của dự án" className="flex gap-1 border-b border-slate-200 dark:border-white/10 overflow-x-auto">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => selectTab(key)}
              className={`shrink-0 px-3 py-2 -mb-px border-b-2 text-xs font-semibold transition cursor-pointer ${
                tab === key
                  ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {label}
              {key === 'changes' && data.openChangeRequests > 0 && (
                <span className="ml-1.5 px-1.5 rounded-full bg-amber-500 text-white text-[10px]">{data.openChangeRequests}</span>
              )}
            </button>
          ))}
        </div>

        <div role="tabpanel">
          {tab === 'overview' && <OverviewTab />}
          {tab === 'episodes' && <EpisodesTab />}
          {tab === 'studio' && <StudioTab />}
          {tab === 'fee' && <FeeTab />}
          {tab === 'changes' && base !== '/creator' && <ChangeRequestsTab />}
          {tab === 'activity' && <ActivityTab />}
        </div>
      </main>
    </ProjectProvider>
  );
}
