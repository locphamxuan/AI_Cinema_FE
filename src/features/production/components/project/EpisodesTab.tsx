'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronRight, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getTodayDateString } from '@/lib/dateUtils';
import type { Episode, Season } from '@/types/production';
import { BEFORE_APPROVAL_EPISODE, OPEN_PROJECT, isIn } from '../../lib/capabilities';
import { EPISODE_STATUS, INGEST_STATUS } from '../../lib/labels';
import { formatDay, formatDuration, formatNumber } from '../../lib/format';
import { productionPaths } from '../../lib/routes';
import { CARD, Empty, StatusPill } from '../shared/ui';
import { AddEpisodeModal, AddSeasonModal, EditEpisodeModal } from './EpisodeModals';
import { useProject } from './ProjectContext';


export function EpisodesTab() {
  const { project, caps, base } = useProject();
  const [addingSeason, setAddingSeason] = useState(false);
  const [addingTo, setAddingTo] = useState<Season | null>(null);
  const [editing, setEditing] = useState<Episode | null>(null);
  const plan = caps.manage && isIn(project.status, OPEN_PROJECT);
  const totalEpisodes = project.seasons.reduce((n, s) => n + s.episodes.length, 0);
  const now = getTodayDateString();

  return (
    <div className="space-y-4">
      {plan && (
        <div className="flex justify-end">
          <Button size="sm" variant="secondary" onClick={() => setAddingSeason(true)}>
            <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm mùa
          </Button>
        </div>
      )}

      {project.seasons.map((season) => {
        const milestones = season.episodes
          .map((e) => e.milestoneDate)
          .filter((d): d is string => !!d)
          .sort();
        const durationFrom = milestones[0] ? formatDay(milestones[0]) : null;
        const durationTo = milestones[milestones.length - 1] ? formatDay(milestones[milestones.length - 1]) : null;
        const isSeasonComplete = season.episodes.length > 0 && season.episodes.every((e) => e.status === 'PUBLISHED');
        const isSeasonInProd = season.episodes.some((e) => ['PROCESSING', 'IN_REVIEW', 'APPROVED', 'LABELED'].includes(e.status));

        // Estimated production cost per episode (totalTokens / totalEpisodes in project)
        const estCostTokens = totalEpisodes > 0 ? Math.round(project.productionFeeTokens / totalEpisodes) : 0;

        return (
          <section key={season.id} className={`${CARD} overflow-hidden`} aria-label={`Mùa ${season.seasonNumber}`}>
            <header className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Mùa {season.seasonNumber}
                  {season.title && season.title !== `Mùa ${season.seasonNumber}` && <span className="font-normal text-slate-500"> — {season.title}</span>}
                </h2>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  isSeasonComplete
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                    : isSeasonInProd
                      ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'
                }`}>
                  {isSeasonComplete ? 'Đã hoàn tất mùa' : isSeasonInProd ? 'Đang sản xuất' : 'Lên kế hoạch'}
                </span>
                {durationFrom && durationTo && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Thời gian: {durationFrom} → {durationTo}
                  </span>
                )}
              </div>
              {plan && (
                <Button size="sm" variant="ghost" onClick={() => setAddingTo(season)}>
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm tập
                </Button>
              )}
            </header>
            {season.episodes.length === 0 ? (
              <Empty>Mùa này chưa có tập.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-slate-500 dark:text-slate-400 text-left bg-slate-50 dark:bg-white/5">
                    <tr>
                      <th className="px-4 py-2 font-medium w-12">#</th>
                      <th className="px-4 py-2 font-medium">Tập</th>
                      <th className="px-4 py-2 font-medium">Trạng thái</th>
                      <th className="px-4 py-2 font-medium hidden md:table-cell">Creator phụ trách</th>
                      <th className="px-4 py-2 font-medium hidden md:table-cell">Thời lượng</th>
                      <th className="px-4 py-2 font-medium hidden md:table-cell">Ngày dự kiến phát hành</th>
                      <th className="px-4 py-2 font-medium hidden lg:table-cell">Bản mới nhất</th>
                      <th className="px-4 py-2 font-medium hidden sm:table-cell text-right">Giá sản xuất</th>
                      <th className="px-4 py-2 font-medium hidden sm:table-cell text-right">Giá bán (Coin)</th>
                      <th className="px-2 py-2 w-16" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {season.episodes.map((ep) => {
                      const latest = ep.mediaAssets[0];
                      const overdue = !!ep.milestoneDate && ep.milestoneDate.slice(0, 10) < now && isIn(ep.status, ['AWAITING_MEDIA', 'CHANGES_REQUESTED']);
                      return (
                        <tr key={ep.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                          <td className="px-4 py-2.5 text-slate-500">{ep.episodeNumber}</td>
                          <td className="px-4 py-2.5">
                            <Link href={productionPaths.episode(base, project.id, ep.id)} className="font-medium text-slate-900 dark:text-white hover:underline">
                              {ep.title}
                            </Link>
                            {ep.revisionStartedAt && <span className="ml-2 text-[10px] text-amber-600">đang sửa</span>}
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusPill {...EPISODE_STATUS[ep.status]} />
                          </td>
                          <td className="px-4 py-2.5 hidden md:table-cell text-slate-600 dark:text-slate-300">
                            {project.creator ? (
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {project.creator.fullName}
                              </span>
                            ) : (
                              <span className="text-slate-400">Chưa giao</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 hidden md:table-cell text-slate-600 dark:text-slate-300">
                            {latest?.durationSeconds ? `${formatDuration(latest.durationSeconds)} / ` : ''}
                            {formatDuration(ep.targetDurationSeconds)}
                          </td>
                          <td className={`px-4 py-2.5 hidden md:table-cell ${overdue ? 'text-rose-600 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
                            {overdue && <AlertTriangle className="inline w-3 h-3 mr-1" aria-label="Trễ hạn" />}
                            {ep.milestoneDate ? formatDay(ep.milestoneDate) : <span className="text-amber-600">Chưa đặt</span>}
                          </td>
                          <td className="px-4 py-2.5 hidden lg:table-cell text-slate-600 dark:text-slate-300">
                            {latest ? `v${latest.version} · ${INGEST_STATUS[latest.ingestStatus].label}` : '—'}
                          </td>
                          <td className="px-4 py-2.5 hidden sm:table-cell text-right font-mono text-purple-600 dark:text-purple-400">
                            {estCostTokens > 0 ? `${formatNumber(estCostTokens)} Token` : '—'}
                          </td>
                          <td className="px-4 py-2.5 hidden sm:table-cell text-right text-slate-600 dark:text-slate-300 font-medium">
                            {formatNumber(ep.coinPrice)}
                          </td>
                          <td className="px-2 py-2.5 text-right whitespace-nowrap">
                            {plan && isIn(ep.status, BEFORE_APPROVAL_EPISODE) && (
                              <Button size="sm" variant="ghost" onClick={() => setEditing(ep)} aria-label={`Sửa tập ${ep.episodeNumber}`}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Link
                              href={productionPaths.episode(base, project.id, ep.id)}
                              aria-label={`Mở tập ${ep.episodeNumber}`}
                              className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-purple-600"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}

      {addingSeason && <AddSeasonModal firstNumber={totalEpisodes + 1} nextSeason={project.seasons.length + 1} onClose={() => setAddingSeason(false)} />}
      {addingTo && <AddEpisodeModal season={addingTo} onClose={() => setAddingTo(null)} />}
      {editing && <EditEpisodeModal episode={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
