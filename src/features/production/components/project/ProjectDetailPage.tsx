'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, Ban, Film, Clapperboard, ShieldCheck, History, Layers, Users } from 'lucide-react';
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
import { TeamTab } from './TeamTab';
import { ChangeRequestsTab } from './ChangeRequestsTab';
import { ActivityTab } from './ActivityTab';

const TABS = [
  { key: 'overview', label: 'Tổng quan & Ý tưởng', icon: Film },
  { key: 'episodes', label: 'Kịch bản & Tập phim', icon: Clapperboard },
  { key: 'team', label: 'Biên kịch Creator', icon: Users },
  { key: 'studio', label: 'Studio & Hợp đồng B2B', icon: Layers },
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
                    <span className="font-medium text-slate-700 dark:text-slate-200">Dự án:</span>
                    <StatusPill {...MOVIE_STATUS[data.status]} />
                  </span>
                  {data.seasons[0] && (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {seasonName(data.seasons[0].seasonNumber, data.seasons[0].episodes.length)}:
                      </span>
                      <StatusPill {...SEASON_STATUS[data.seasons[0].status]} />
                    </span>
                  )}
                  <span>·</span>
                  <span>{data.seasons.length} mùa</span>
                  <span>·</span>
                  <span>{totalEpisodes} tập</span>
                </div>
              </div>

              {/* Facts strip */}
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/60 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                <Fact label="Reviewer thẩm định" value={data.reviewer.fullName} />
                <Fact label="Biên kịch Creator" value={data.creator?.fullName ?? 'Chưa giao'} />
                <Fact label="Studio đối tác" value={data.studio?.name ?? 'Chưa chọn'} />
                <Fact label="Cấu trúc" value={`${data.seasons.length} mùa · ${totalEpisodes} tập`} />
              </dl>
            </div>

            {/* Tab navigation */}
            <nav role="tablist" aria-label="Phần của dự án" className="flex gap-2 overflow-x-auto pt-2 -mb-5 border-b border-transparent">
              {tabs.map((item) => {
                const Icon = item.icon;
                const active = tab === item.key;
                return (
                  <button
                    key={item.key}
                    role="tab"
                    aria-selected={active}
                    onClick={() => selectTab(item.key)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition cursor-pointer whitespace-nowrap ${
                      active
                        ? 'border-[#E50914] text-[#E50914] bg-red-500/5 dark:bg-red-500/10'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Banner: project was cancelled */}
          {data.status === 'CANCELLED' && (
            <div role="status" className="flex items-start gap-2 bg-rose-50 dark:bg-rose-500/10 border-t border-rose-200 dark:border-rose-500/20 px-6 py-3 text-xs text-rose-700 dark:text-rose-400">
              <Ban className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <b>Dự án đã bị huỷ</b>
                {data.cancelReason && `: ${data.cancelReason}`}
              </span>
            </div>
          )}

          {/* Banner: episodes under revision */}
          {data.revision && (
            <div role="status" className="flex items-start gap-2 bg-amber-50 dark:bg-amber-500/10 border-t border-amber-200 dark:border-amber-500/20 px-6 py-3 text-xs text-amber-800 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
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
          {tab === 'changes' && <ChangeRequestsTab />}
          {tab === 'activity' && <ActivityTab />}
        </div>
      </main>
    </ProjectProvider>
  );
}
