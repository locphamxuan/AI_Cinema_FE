'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, Ban, Film, Clapperboard, ShieldCheck, History, CalendarClock, Layers, Users } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useCan } from '@/hooks/useCan';
import { seasonName } from '@/lib/seasonLabel';
import { productionService } from '@/services/productionService';
import { useResource } from '@/hooks/useResource';
import { projectCapabilities } from '../../lib/capabilities';
import { MOVIE_STATUS, SEASON_STATUS } from '../../lib/labels';
import { baseFromPath, productionPaths } from '../../lib/routes';
import { ErrorNote, Loading, StatusPill } from '@/components/data/ui';
import { ProjectProvider } from './ProjectContext';
import { OverviewTab } from './OverviewTab';
import { EpisodesTab } from './EpisodesTab';
import { StudioTab } from './StudioTab';
import { FeeTab } from './FeeTab';
import { TeamTab } from './TeamTab';
import { ChangeRequestsTab } from './ChangeRequestsTab';
import { ActivityTab } from './ActivityTab';

const TABS = [
  { key: 'overview', label: 'Tổng quan', icon: Film },
  { key: 'episodes', label: 'Mùa & tập phim', icon: Clapperboard },
  { key: 'team', label: 'Creator', icon: Users },
  { key: 'studio', label: 'Studio', icon: Layers },
  { key: 'fee', label: 'Phí sản xuất', icon: CalendarClock },
  { key: 'changes', label: 'Đề xuất cho Admin', icon: ShieldCheck },
  { key: 'activity', label: 'Lịch sử', icon: History },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/** Who and what the project involves, read at a glance under its title. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-sm font-semibold text-slate-900 dark:text-white truncate">{value}</dd>
    </div>
  );
}

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
        <Link href={productionPaths.list(base)} className="text-xs text-sky-700 hover:underline">
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
      <main className="w-full">
        <div className="bg-white dark:bg-card border-b border-sky-100 dark:border-white/10">
          <div className="h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-coral-400" aria-hidden="true" />
          <div className="px-6 lg:px-8 pt-4 pb-5 space-y-4">
            <Link
              href={productionPaths.list(base)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 hover:underline"
            >
              Danh sách dự án
            </Link>

            <div className="flex flex-col gap-4">
              <div className="space-y-2 min-w-0">
                <h1 className="font-heading text-2xl font-semibold text-slate-900 dark:text-white leading-tight tracking-tight">{data.title}</h1>
                <div aria-label="Trạng thái dự án, mùa và tập" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    Dự án <StatusPill {...MOVIE_STATUS[data.status]} />
                  </span>
                  {data.seasons.map((season) => (
                    <span key={season.id} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      {seasonName(season.seasonNumber, season.episodes.length)} <StatusPill {...SEASON_STATUS[season.status]} />
                    </span>
                  ))}
                </div>
                {(data.synopsis || data.ideaDescription) && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 max-w-3xl leading-relaxed">{data.synopsis || data.ideaDescription}</p>
                )}
              </div>

              <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 rounded-xl bg-sky-50/70 dark:bg-white/[0.04] px-5 py-3">
                <Fact label="Reviewer" value={data.reviewer.fullName} />
                <Fact label={caps.creator && caps.lead ? 'Creator chính (bạn)' : 'Creator chính'} value={data.creator?.fullName ?? 'Chưa giao'} />
                <Fact label="Studio" value={data.studio?.name ?? 'Chưa chọn'} />
                <Fact label="Quy mô" value={`${data.seasons.length} mùa, ${totalEpisodes} tập`} />
              </dl>
            </div>
          </div>

          <div role="tablist" aria-label="Mục của dự án" className="px-6 lg:px-8 flex items-center gap-1 overflow-x-auto scrollbar-none">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => selectTab(key)}
                className={`shrink-0 flex items-center gap-2 px-4 py-3 text-sm border-b-2 whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-sky-50 ${
                  tab === key
                    ? 'border-sky-500 text-sky-800 dark:text-sky-200 font-semibold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {key === 'changes' && caps.creator ? 'Đề xuất cho Reviewer và Admin' : label}
                {key === 'changes' && data.openChangeRequests > 0 && (
                  <span className="px-1.5 rounded-full bg-coral-500 text-white text-xs font-semibold tabular-nums" title="Đề xuất đang chờ">
                    {data.openChangeRequests}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Alerts ── */}
        <div className="px-6 lg:px-8 space-y-3 pt-4">
          {data.status === 'CANCELLED' && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-300">
              <Ban className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span><b>Dự án đã huỷ:</b> {data.cancelReason}</span>
            </div>
          )}
          {data.revision.episodeCount > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <b>Đang sửa {data.revision.episodeCount} tập:</b>{' '}
                {data.revision.bySeason.map((s) => `mùa ${s.seasonNumber}: tập ${s.episodeNumbers.join(', ')}`).join('; ')}
              </span>
            </div>
          )}
        </div>

        {/* ── Tab panel ── */}
        <div role="tabpanel" className="px-6 lg:px-8 py-6">
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
