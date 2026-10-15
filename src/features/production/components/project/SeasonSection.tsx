'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronDown, ChevronRight, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getTodayDateString } from '@/lib/dateUtils';
import { productionService } from '@/services/productionService';
import { teamService } from '@/services/teamService';
import type { CreatorSeat, Episode, Season, SeasonFee } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { BEFORE_APPROVAL_EPISODE, OPEN_PROJECT, TEAM_EDITABLE_PROJECT, isIn } from '../../lib/capabilities';
import { formatDay, formatDuration, formatNumber } from '../../lib/format';
import { EPISODE_STATUS, INGEST_STATUS, SEASON_STATUS } from '../../lib/labels';
import { productionPaths } from '../../lib/routes';
import { CARD, Empty, StatusPill } from '../shared/ui';
import { useProject } from './ProjectContext';

/** Submissions of one episode: every version of media the Creator uploaded from the studio's deliveries. */
function Submissions({ episode }: { episode: Episode }) {
  const versions = useResource(`media:${episode.id}`, () => productionService.listMedia(episode.id));
  if (versions.loading && !versions.data) return <p className="text-slate-500">Đang tải Submission…</p>;
  if (!versions.data?.length) return <p className="text-slate-500">Chưa có Submission nào.</p>;
  return (
    <ul className="space-y-1">
      {versions.data.map((media) => (
        <li key={media.id} className="flex flex-wrap gap-x-3 text-slate-600 dark:text-slate-300">
          <span className="font-medium">v{media.version}</span>
          <span>{INGEST_STATUS[media.ingestStatus].label}</span>
          <span>{media.submittedBy.fullName}</span>
          {media.studioHandoff && <span>Studio: {media.studioHandoff.studio.name}</span>}
          <span>{formatDuration(media.durationSeconds)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Who holds an episode: a Reviewer or the lead picks from the team; everyone else sees the name. */
function Assignee({ episode, seats, editable }: { episode: Episode; seats: CreatorSeat[]; editable: boolean }) {
  const { reload } = useProject();
  const { busy, run } = useAction();
  const active = seats.filter((seat) => seat.isActive);
  const held = (creatorId: string) => active.find((seat) => seat.creatorId === creatorId)?.episodes.length ?? 0;
  if (!editable) {
    return episode.assignedCreator ? (
      <span>
        {episode.assignedCreator.fullName} <span className="text-slate-400">({held(episode.assignedCreator.id)} tập)</span>
      </span>
    ) : (
      <span className="text-slate-400">Cả nhóm</span>
    );
  }
  const change = async (creatorId: string) => {
    if (await run(() => teamService.assignEpisode(episode.id, creatorId || null), 'Đã giao tập')) await reload();
  };
  return (
    <select
      value={episode.assignedCreatorId ?? ''}
      disabled={busy}
      onChange={(e) => change(e.target.value)}
      aria-label={`Creator phụ trách tập ${episode.episodeNumber}`}
      className="rounded-lg border border-slate-200 dark:border-white/10 bg-transparent px-1.5 py-1 text-xs max-w-40"
    >
      <option value="">Cả nhóm</option>
      {active.map((seat) => (
        <option key={seat.creatorId} value={seat.creatorId}>
          {seat.creator.fullName} ({seat.episodes.length} tập)
        </option>
      ))}
    </select>
  );
}

/** One season: status, release window, price and the budget it needs, then its episodes (Mentor 14/10, §4.1.10). */
export function SeasonSection({
  season,
  fee,
  seats,
  onAddEpisode,
  onEditSeason,
  onEditEpisode,
}: {
  season: Season;
  fee: SeasonFee | undefined;
  seats: CreatorSeat[];
  onAddEpisode: () => void;
  onEditSeason: () => void;
  onEditEpisode: (episode: Episode) => void;
}) {
  const { project, caps, base } = useProject();
  const [open, setOpen] = useState<string | null>(null);
  const plan = caps.manage && isIn(project.status, OPEN_PROJECT);
  const assign = (caps.manage || caps.lead) && isIn(project.status, TEAM_EDITABLE_PROJECT);
  const today = getTodayDateString();
  const cost = Number(season.episodeProductionCost);

  return (
    <section className={`${CARD} overflow-hidden`} aria-label={`Mùa ${season.seasonNumber}`}>
      <header className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="min-w-0 space-y-1">
          <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            Mùa {season.seasonNumber}
            {season.title && season.title !== `Mùa ${season.seasonNumber}` && <span className="font-normal text-slate-500">— {season.title}</span>}
            <StatusPill {...SEASON_STATUS[season.status]} />
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Phát hành {season.releaseStartDate || season.releaseEndDate ? `${formatDay(season.releaseStartDate)} → ${formatDay(season.releaseEndDate)}` : 'chưa đặt khoảng'} ·
            đơn giá {formatNumber(cost)} Token/tập · dự trù {formatNumber(fee?.baselineTokens ?? cost * season.episodes.length)} Token
            {fee && fee.totalTokens > 0 && ` · đã cấp ${formatNumber(fee.totalTokens)}`}
            {fee && fee.missingTokens > 0 && <span className="text-amber-600"> · thiếu {formatNumber(fee.missingTokens)}</span>}
          </p>
        </div>
        <div className="flex gap-1">
          {plan && (
            <>
              <Button size="sm" variant="ghost" onClick={onEditSeason} aria-label={`Sửa mùa ${season.seasonNumber}`}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onAddEpisode}>
                <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm tập
              </Button>
            </>
          )}
        </div>
      </header>
      {season.episodes.length === 0 ? (
        <Empty>Mùa này chưa có tập.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-slate-500 dark:text-slate-400 text-left bg-slate-50 dark:bg-white/5">
              <tr>
                <th className="px-3 py-2 font-medium w-10">#</th>
                <th className="px-3 py-2 font-medium">Tập</th>
                <th className="px-3 py-2 font-medium">Trạng thái</th>
                <th className="px-3 py-2 font-medium hidden md:table-cell">Creator phụ trách</th>
                <th className="px-3 py-2 font-medium hidden lg:table-cell text-right">Giá sản xuất</th>
                <th className="px-3 py-2 font-medium hidden sm:table-cell text-right">Giá bán (Coin)</th>
                <th className="px-3 py-2 font-medium hidden md:table-cell">Ngày dự kiến phát hành</th>
                <th className="px-3 py-2 font-medium hidden lg:table-cell">Hạn giao Studio</th>
                <th className="px-2 py-2 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {season.episodes.map((ep) => {
                const overdue = !!ep.deliveryDeadline && ep.deliveryDeadline.slice(0, 10) < today && isIn(ep.status, ['AWAITING_MEDIA', 'CHANGES_REQUESTED']);
                const expanded = open === ep.id;
                return (
                  <Fragment key={ep.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-3 py-2.5 text-slate-500">{ep.episodeNumber}</td>
                      <td className="px-3 py-2.5">
                        <Link href={productionPaths.episode(base, project.id, ep.id)} className="font-medium text-slate-900 dark:text-white hover:underline">
                          {ep.title}
                        </Link>
                        <span className="ml-2 text-[10px] text-slate-400">{formatDuration(ep.targetDurationSeconds)}</span>
                        {ep.revisionStartedAt && <span className="ml-2 text-[10px] text-amber-600">đang sửa</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusPill {...EPISODE_STATUS[ep.status]} />
                      </td>
                      <td className="px-3 py-2.5 hidden md:table-cell text-slate-600 dark:text-slate-300">
                        <Assignee episode={ep} seats={seats} editable={assign && ep.status !== 'PUBLISHED'} />
                      </td>
                      <td className="px-3 py-2.5 hidden lg:table-cell text-right text-slate-600 dark:text-slate-300">{formatNumber(cost)} Token</td>
                      <td className="px-3 py-2.5 hidden sm:table-cell text-right text-slate-600 dark:text-slate-300">{formatNumber(ep.coinPrice)}</td>
                      <td className="px-3 py-2.5 hidden md:table-cell text-slate-600 dark:text-slate-300">{formatDay(ep.expectedReleaseDate)}</td>
                      <td className={`px-3 py-2.5 hidden lg:table-cell ${overdue ? 'text-rose-600 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
                        {overdue && <AlertTriangle className="inline w-3 h-3 mr-1" aria-label="Trễ hạn" />}
                        {ep.deliveryDeadline ? formatDay(ep.deliveryDeadline) : <span className="text-amber-600">Chưa đặt</span>}
                      </td>
                      <td className="px-2 py-2.5 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setOpen(expanded ? null : ep.id)}
                          aria-expanded={expanded}
                          aria-label={`Submission của tập ${ep.episodeNumber}`}
                        >
                          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </Button>
                        {plan && isIn(ep.status, BEFORE_APPROVAL_EPISODE) && (
                          <Button size="sm" variant="ghost" onClick={() => onEditEpisode(ep)} aria-label={`Sửa tập ${ep.episodeNumber}`}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-slate-50/60 dark:bg-white/5">
                        <td />
                        <td colSpan={8} className="px-3 py-2.5">
                          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Submission (các version media)</p>
                          <Submissions episode={ep} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
