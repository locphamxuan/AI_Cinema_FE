'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Film,
  Clapperboard,
  ShieldCheck,
  History,
  CalendarClock,
  Layers,
  Users,
} from 'lucide-react';
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
  { key: 'overview', label: 'Tổng quan', icon: Film },
  { key: 'episodes', label: 'Mùa & tập phim', icon: Clapperboard },
  { key: 'team', label: 'Creator', icon: Users },
  { key: 'studio', label: 'Studio', icon: Layers },
  { key: 'fee', label: 'Phí sản xuất', icon: CalendarClock },
  { key: 'changes', label: 'Đề xuất cho Admin', icon: ShieldCheck },
  { key: 'activity', label: 'Lịch sử', icon: History },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const BASE_GRADIENT: Record<string, string> = {
  '/creator': 'from-blue-800 via-blue-700 to-purple-800',
  '/reviewer': 'from-emerald-800 via-teal-700 to-emerald-900',
  '/admin': 'from-violet-800 via-purple-700 to-violet-900',
};

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-center min-w-[90px]">
      <span className="text-white/50 block text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      <span className="font-bold text-white text-sm leading-tight">{value}</span>
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
        <Link href={productionPaths.list(base)} className="text-xs text-purple-600 hover:underline">
          ← Về danh sách dự án
        </Link>
      </main>
    );
  }

  const data = project.data;
  const caps = projectCapabilities(data, userId, can);
  const totalEpisodes = data.seasons.reduce((n, s) => n + s.episodes.length, 0);
  const heroGradient = BASE_GRADIENT[base] ?? 'from-purple-800 via-violet-700 to-purple-900';

  return (
    <ProjectProvider value={{ project: data, caps, base, reload: project.reload }}>
      <main className="w-full">
        {/* ── Cinematic Hero Header ── */}
        <div className={`relative bg-gradient-to-br ${heroGradient} overflow-hidden`}>
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 58px, white 58px, white 60px),
                repeating-linear-gradient(0deg, transparent, transparent 58px, white 58px, white 60px)`,
            }}
          />
          <div className="absolute -top-20 right-1/3 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -left-16 w-64 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 px-6 lg:px-8 pt-5 pb-6 space-y-4">
            <Link
              href={productionPaths.list(base)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/50 hover:text-white/90 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Quay lại danh sách dự án
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                    <Film className="w-5.5 h-5.5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-white tracking-tight leading-none">{data.title}</h1>
                    <div aria-label="Trạng thái dự án, mùa và tập" className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-white/70">Dự án</span>
                      <StatusPill {...MOVIE_STATUS[data.status]} />
                      {data.seasons.map((season) => (
                        <span key={season.id} className="inline-flex items-center gap-1 text-[11px] text-white/70">
                          → {seasonName(season.seasonNumber, season.episodes.length)} <StatusPill {...SEASON_STATUS[season.status]} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {(data.synopsis || data.ideaDescription) && (
                  <p className="text-white/55 text-sm line-clamp-2 max-w-2xl leading-relaxed pl-14">
                    {data.synopsis || data.ideaDescription}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <MetaChip label="Reviewer" value={data.reviewer.fullName} />
                <MetaChip label="Creator chính" value={data.creator?.fullName ?? 'Chưa giao'} />
                {caps.creator && <MetaChip label="Vai trò của bạn" value={caps.lead ? 'Creator chính' : 'Creator phụ'} />}
                <MetaChip label="Studio" value={data.studio?.name ?? 'Chưa chọn'} />
                <MetaChip label="Quy mô" value={`${data.seasons.length} mùa · ${totalEpisodes} tập`} />
              </div>
            </div>
          </div>

          {/* ── Tab bar ── */}
          <div className="relative z-10 px-6 lg:px-8 border-t border-white/10">
            <div
              role="tablist"
              aria-label="Mục của dự án"
              className="flex items-center gap-0.5 overflow-x-auto scrollbar-none"
            >
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => selectTab(key)}
                  className={`relative shrink-0 flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    tab === key
                      ? 'text-white'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {key === 'changes' && caps.creator ? 'Đề xuất cho Reviewer & Admin' : label}
                  {key === 'changes' && data.openChangeRequests > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                      {data.openChangeRequests}
                    </span>
                  )}
                  {tab === key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
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
