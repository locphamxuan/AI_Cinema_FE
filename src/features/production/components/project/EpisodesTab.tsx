'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronRight, Pencil, Plus, Tv2, Clock, Coins } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getTodayDateString } from '@/lib/dateUtils';
import type { Episode, Season } from '@/types/production';
import { BEFORE_APPROVAL_EPISODE, OPEN_PROJECT, isIn } from '../../lib/capabilities';
import { EPISODE_STATUS, INGEST_STATUS } from '../../lib/labels';
import { formatDay, formatDuration, formatNumber } from '../../lib/format';
import { productionPaths } from '../../lib/routes';
import { Empty, StatusPill } from '../shared/ui';
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
    <div className="space-y-5">
      {/* Header action */}
      {plan && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setAddingSeason(true)} className="shadow-sm">
            <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm mùa
          </Button>
        </div>
      )}

      {project.seasons.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-10 text-center">
          <Tv2 className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Chưa có mùa phim nào</p>
          <p className="text-xs text-slate-400 mt-1">Thêm mùa để bắt đầu lên kế hoạch tập phim</p>
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
        const estCostTokens = totalEpisodes > 0 ? Math.round(project.productionFeeTokens / totalEpisodes) : 0;

        return (
          <section
            key={season.id}
            className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] overflow-hidden shadow-sm"
            aria-label={`Mùa ${season.seasonNumber}`}
          >
            {/* Season header */}
            <header className="relative overflow-hidden px-5 py-4 border-b border-slate-100 dark:border-white/5">
              <div className={`absolute inset-0 opacity-[0.04] ${
                isSeasonComplete
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : isSeasonInProd
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600'
                    : 'bg-gradient-to-r from-slate-400 to-slate-500'
              }`} />
              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    isSeasonComplete
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : isSeasonInProd
                        ? 'bg-purple-600/15 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                  }`}>
                    S{season.seasonNumber}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Mùa {season.seasonNumber}
                      {season.title && season.title !== `Mùa ${season.seasonNumber}` && (
                        <span className="font-normal text-slate-500"> — {season.title}</span>
                      )}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        isSeasonComplete
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : isSeasonInProd
                            ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isSeasonComplete ? '✓ Hoàn tất' : isSeasonInProd ? '⚡ Đang sản xuất' : '📋 Kế hoạch'}
                      </span>
                      {durationFrom && durationTo && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {durationFrom} → {durationTo}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                    {season.episodes.length} tập
                  </span>
                </div>
                {plan && (
                  <Button size="sm" variant="ghost" onClick={() => setAddingTo(season)} className="shrink-0">
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm tập
                  </Button>
                )}
              </div>
            </header>

            {season.episodes.length === 0 ? (
              <Empty>Mùa này chưa có tập.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-[11px] text-slate-500 dark:text-slate-400 text-left bg-slate-50/60 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold w-10">#</th>
                      <th className="px-4 py-2.5 font-semibold">Tập phim</th>
                      <th className="px-4 py-2.5 font-semibold">Trạng thái</th>
                      <th className="px-4 py-2.5 font-semibold hidden md:table-cell">Creator</th>
                      <th className="px-4 py-2.5 font-semibold hidden md:table-cell">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Thời lượng</span>
                      </th>
                      <th className="px-4 py-2.5 font-semibold hidden md:table-cell">Phát hành</th>
                      <th className="px-4 py-2.5 font-semibold hidden lg:table-cell">Bản mới nhất</th>
                      <th className="px-4 py-2.5 font-semibold hidden sm:table-cell text-right">
                        <span className="flex items-center justify-end gap-1"><Coins className="w-3 h-3" />Phí</span>
                      </th>
                      <th className="px-4 py-2.5 font-semibold hidden sm:table-cell text-right">Coin</th>
                      <th className="w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {season.episodes.map((ep) => {
                      const latest = ep.mediaAssets[0];
                      const overdue = !!ep.milestoneDate && ep.milestoneDate.slice(0, 10) < now && isIn(ep.status, ['AWAITING_MEDIA', 'CHANGES_REQUESTED']);
                      return (
                        <tr
                          key={ep.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-[10px]">
                              {ep.episodeNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={productionPaths.episode(base, project.id, ep.id)}
                              className="font-semibold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                              {ep.title}
                            </Link>
                            {ep.revisionStartedAt && (
                              <span className="ml-2 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                                đang sửa
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill {...EPISODE_STATUS[ep.status]} />
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
                            {project.creator ? (
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {project.creator.fullName}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 italic">Chưa giao</span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
                            {latest?.durationSeconds ? `${formatDuration(latest.durationSeconds)} / ` : ''}
                            {formatDuration(ep.targetDurationSeconds)}
                          </td>
                          <td className={`px-4 py-3 hidden md:table-cell ${overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
                            {overdue && <AlertTriangle className="inline w-3 h-3 mr-1" aria-label="Trễ hạn" />}
                            {ep.milestoneDate
                              ? formatDay(ep.milestoneDate)
                              : <span className="text-amber-500 dark:text-amber-400">Chưa đặt</span>}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell text-slate-500 dark:text-slate-400">
                            {latest ? (
                              <span className="font-mono text-[10px] bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                v{latest.version} · {INGEST_STATUS[latest.ingestStatus].label}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-right font-mono text-purple-600 dark:text-purple-400">
                            {estCostTokens > 0 ? `${formatNumber(estCostTokens)}` : '—'}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-right text-slate-600 dark:text-slate-300 font-mono">
                            {formatNumber(ep.coinPrice)}
                          </td>
                          <td className="px-2 py-3 text-right whitespace-nowrap">
                            {plan && isIn(ep.status, BEFORE_APPROVAL_EPISODE) && (
                              <Button size="sm" variant="ghost" onClick={() => setEditing(ep)} aria-label={`Sửa tập ${ep.episodeNumber}`}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Link
                              href={productionPaths.episode(base, project.id, ep.id)}
                              aria-label={`Mở tập ${ep.episodeNumber}`}
                              className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
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
