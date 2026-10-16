'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Ban } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useCan } from '@/hooks/useCan';
import { seasonName } from '@/lib/seasonLabel';
import { productionService } from '@/services/productionService';
import { useResource } from '../../hooks/useResource';
import { projectCapabilities } from '../../lib/capabilities';
import { MOVIE_STATUS, SEASON_STATUS } from '../../lib/labels';
import { baseFromPath, productionPaths } from '../../lib/routes';
import { ErrorNote, Loading, StatusPill } from '../shared/ui';
import { ProjectProvider } from './ProjectContext';
import { OverviewTab } from './OverviewTab';
import { EpisodesTab } from './EpisodesTab';
import { StudioTab } from './StudioTab';
import { FeeTab } from './FeeTab';
import { TeamTab } from './TeamTab';
import { ChangeRequestsTab } from './ChangeRequestsTab';
import { ActivityTab } from './ActivityTab';

const TABS = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'episodes', label: 'Mùa & tập phim' },
  { key: 'team', label: 'Creator' },
  { key: 'studio', label: 'Studio' },
  { key: 'fee', label: 'Phí sản xuất' },
  { key: 'changes', label: 'Đề xuất cho Admin' },
  { key: 'activity', label: 'Lịch sử' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/** One movie project, for its Reviewer, its Creator and the Admin; actions follow role, ownership and status. */
export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const base = baseFromPath(pathname);
  const userId = useAppStore((s) => s.user?.id);
  const can = useCan();

  const tabs = TABS;
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
      <main className="w-full px-6 lg:px-8 py-6 space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/20 via-purple-600/10 to-slate-900/10 border border-slate-200/80 dark:border-white/10 p-6 shadow-sm">
          <div className="relative z-10 space-y-4">
            <Link href={productionPaths.list(base)} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Quay lại danh sách dự án
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{data.title}</h1>
                  <StatusPill {...MOVIE_STATUS[data.status]} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-3xl leading-relaxed">
                  {data.synopsis || data.ideaDescription}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-xs">
                  <span className="text-slate-400 block text-[10px]">Reviewer</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{data.reviewer.fullName}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-xs">
                  <span className="text-slate-400 block text-[10px]">Creator chính</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{data.creator?.fullName ?? 'Chưa giao'}</span>
                </div>
                {caps.creator && (
                  <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30">
                    <span className="text-slate-400 block text-[10px]">Vai trò của bạn</span>
                    <span className="font-semibold text-purple-700 dark:text-purple-300">{caps.lead ? 'Creator chính' : 'Creator phụ'}</span>
                  </div>
                )}
                <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-xs">
                  <span className="text-slate-400 block text-[10px]">Quy mô</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400 font-mono">{data.seasons.length} mùa · {totalEpisodes} tập</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Reviewer: {data.reviewer.fullName} · Creator chính: {data.creator?.fullName ?? 'chưa giao'} · Studio: {data.studio?.name ?? 'chưa chọn'} ·{' '}
            {data.seasons.length} mùa, {totalEpisodes} tập
          </p>
          <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400" aria-label="Trạng thái dự án, mùa và tập">
            Dự án <StatusPill {...MOVIE_STATUS[data.status]} />
            {data.seasons.map((season) => (
              <span key={season.id} className="inline-flex items-center gap-1">
                → {seasonName(season.seasonNumber, season.episodes.length)} <StatusPill {...SEASON_STATUS[season.status]} />
              </span>
            ))}
          </p>
        </div>

        {data.status === 'CANCELLED' && (
          <p className="flex items-start gap-2 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-300">
            <Ban className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" /> 
            <span><b>Dự án đã huỷ:</b> {data.cancelReason}</span>
          </p>
        )}
        {data.revision.episodeCount > 0 && (
          <p className="flex items-start gap-2 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <b>Đang sửa {data.revision.episodeCount} tập:</b>{' '}
              {data.revision.bySeason.map((s) => `mùa ${s.seasonNumber}: tập ${s.episodeNumbers.join(', ')}`).join('; ')}
            </span>
          </p>
        )}

        <div role="tablist" aria-label="Mục của dự án" className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 overflow-x-auto">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => selectTab(key)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                tab === key
                  ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              {key === 'changes' && caps.creator ? 'Đề xuất cho Reviewer & Admin' : label}
              {key === 'changes' && data.openChangeRequests > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">{data.openChangeRequests}</span>
              )}
            </button>
          ))}
        </div>

        <div role="tabpanel">
          {tab === 'overview' && <OverviewTab />}
          {tab === 'episodes' && <EpisodesTab />}
          {tab === 'team' && <TeamTab />}
          {tab === 'studio' && <StudioTab />}
          {tab === 'fee' && <FeeTab />}
          {tab === 'changes' && <ChangeRequestsTab />}
          {tab === 'activity' && <ActivityTab />}
        </div>
      </main>
    </ProjectProvider>
  );
}
