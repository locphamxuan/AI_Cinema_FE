'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronRight, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { productionService } from '@/services/productionService';
import type { Episode, Season } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { BEFORE_APPROVAL_EPISODE, OPEN_PROJECT, isIn } from '../../lib/capabilities';
import { EPISODE_STATUS, INGEST_STATUS } from '../../lib/labels';
import { formatDay, formatDuration, formatNumber } from '../../lib/format';
import { productionPaths } from '../../lib/routes';
import { EpisodeRowsEditor, MAX_EPISODE_MINUTES, emptyEpisode, episodesValid, toEpisodeInput, type EpisodeDraft } from '../shared/EpisodeRowsEditor';
import { CARD, Empty, StatusPill } from '../shared/ui';
import { useProject } from './ProjectContext';

/** Today as YYYY-MM-DD in local time, to flag overdue deliveries. */
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function EpisodesTab() {
  const { project, caps, base } = useProject();
  const [addingSeason, setAddingSeason] = useState(false);
  const [addingTo, setAddingTo] = useState<Season | null>(null);
  const [editing, setEditing] = useState<Episode | null>(null);
  const plan = caps.manage && isIn(project.status, OPEN_PROJECT);
  const totalEpisodes = project.seasons.reduce((n, s) => n + s.episodes.length, 0);
  const now = today();

  return (
    <div className="space-y-4">
      {plan && (
        <div className="flex justify-end">
          <Button size="sm" variant="secondary" onClick={() => setAddingSeason(true)}>
            <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm mùa
          </Button>
        </div>
      )}

      {project.seasons.map((season) => (
        <section key={season.id} className={`${CARD} overflow-hidden`} aria-label={`Mùa ${season.seasonNumber}`}>
          <header className="flex items-center justify-between gap-2 px-5 py-3 border-b border-slate-100 dark:border-white/5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Mùa {season.seasonNumber}
              {season.title && season.title !== `Mùa ${season.seasonNumber}` && <span className="font-normal text-slate-500"> — {season.title}</span>}
            </h2>
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
                <thead className="text-slate-500 dark:text-slate-400 text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium w-12">#</th>
                    <th className="px-4 py-2 font-medium">Tập</th>
                    <th className="px-4 py-2 font-medium">Trạng thái</th>
                    <th className="px-4 py-2 font-medium hidden md:table-cell">Thời lượng</th>
                    <th className="px-4 py-2 font-medium hidden md:table-cell">Hạn giao</th>
                    <th className="px-4 py-2 font-medium hidden lg:table-cell">Bản mới nhất</th>
                    <th className="px-4 py-2 font-medium hidden sm:table-cell text-right">Giá Coin</th>
                    <th className="px-2 py-2 w-16" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {season.episodes.map((ep) => {
                    const latest = ep.mediaAssets[0];
                    const overdue = !!ep.dueDate && ep.dueDate.slice(0, 10) < now && isIn(ep.status, ['AWAITING_MEDIA', 'CHANGES_REQUESTED']);
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
                          {latest?.durationSeconds ? `${formatDuration(latest.durationSeconds)} / ` : ''}
                          {formatDuration(ep.targetDurationSeconds)}
                        </td>
                        <td className={`px-4 py-2.5 hidden md:table-cell ${overdue ? 'text-rose-600 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
                          {overdue && <AlertTriangle className="inline w-3 h-3 mr-1" aria-label="Trễ hạn" />}
                          {formatDay(ep.dueDate)}
                        </td>
                        <td className="px-4 py-2.5 hidden lg:table-cell text-slate-600 dark:text-slate-300">
                          {latest ? `v${latest.version} · ${INGEST_STATUS[latest.ingestStatus].label}` : '—'}
                        </td>
                        <td className="px-4 py-2.5 hidden sm:table-cell text-right text-slate-600 dark:text-slate-300">{formatNumber(ep.coinPrice)}</td>
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
      ))}

      {addingSeason && <AddSeasonModal firstNumber={totalEpisodes + 1} nextSeason={project.seasons.length + 1} onClose={() => setAddingSeason(false)} />}
      {addingTo && <AddEpisodeModal season={addingTo} onClose={() => setAddingTo(null)} />}
      {editing && <EditEpisodeModal episode={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function AddSeasonModal({ firstNumber, nextSeason, onClose }: { firstNumber: number; nextSeason: number; onClose: () => void }) {
  const { project, reload } = useProject();
  const [title, setTitle] = useState(`Mùa ${nextSeason}`);
  const [episodes, setEpisodes] = useState<EpisodeDraft[]>([emptyEpisode(firstNumber)]);
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () => productionService.addSeason(project.id, { title: title.trim() || undefined, episodes: episodes.map(toEpisodeInput) }),
      'Đã thêm mùa',
    );
    if (done) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={`Thêm mùa ${nextSeason}`} maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Tên mùa">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} className={fieldInputClass} />
        </FormField>
        <EpisodeRowsEditor episodes={episodes} onChange={setEpisodes} firstNumber={firstNumber} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !episodesValid(episodes)}>
            Thêm mùa
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AddEpisodeModal({ season, onClose }: { season: Season; onClose: () => void }) {
  const { reload } = useProject();
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(20);
  const [synopsis, setSynopsis] = useState('');
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        productionService.addEpisode(season.id, {
          ...toEpisodeInput({ title, minutes }),
          ...(synopsis.trim() ? { synopsis: synopsis.trim() } : {}),
        }),
      'Đã thêm tập',
    );
    if (done) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={`Thêm tập vào mùa ${season.seasonNumber}`} subtitle="Tập mới nhận số thứ tự cuối cùng của phim.">
      <EpisodeForm
        title={title}
        minutes={minutes}
        synopsis={synopsis}
        onTitle={setTitle}
        onMinutes={setMinutes}
        onSynopsis={setSynopsis}
        busy={busy}
        submitLabel="Thêm tập"
        onSubmit={submit}
        onCancel={onClose}
      />
    </Modal>
  );
}

function EditEpisodeModal({ episode, onClose }: { episode: Episode; onClose: () => void }) {
  const { reload } = useProject();
  const [title, setTitle] = useState(episode.title);
  const [minutes, setMinutes] = useState(Math.round(episode.targetDurationSeconds / 60));
  const [synopsis, setSynopsis] = useState(episode.synopsis ?? '');
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        productionService.updateEpisode(episode.id, {
          ...toEpisodeInput({ title, minutes }),
          ...(synopsis.trim() ? { synopsis: synopsis.trim() } : {}),
        }),
      'Đã lưu tập',
    );
    if (done) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={`Sửa tập ${episode.episodeNumber}`} subtitle="Đổi thời lượng mục tiêu được tới khi tập được duyệt (BR-31).">
      <EpisodeForm
        title={title}
        minutes={minutes}
        synopsis={synopsis}
        onTitle={setTitle}
        onMinutes={setMinutes}
        onSynopsis={setSynopsis}
        busy={busy}
        submitLabel="Lưu"
        onSubmit={submit}
        onCancel={onClose}
      />
    </Modal>
  );
}

function EpisodeForm(props: {
  title: string;
  minutes: number;
  synopsis: string;
  onTitle: (v: string) => void;
  onMinutes: (v: number) => void;
  onSynopsis: (v: string) => void;
  busy: boolean;
  submitLabel: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const valid = props.title.trim() && props.minutes > 0 && props.minutes <= MAX_EPISODE_MINUTES;
  return (
    <form onSubmit={props.onSubmit} className="space-y-4">
      <FormField label="Tên tập">
        <input value={props.title} onChange={(e) => props.onTitle(e.target.value)} maxLength={255} required className={fieldInputClass} />
      </FormField>
      <FormField label="Thời lượng mục tiêu (phút)" className="max-w-40">
        <input
          type="number"
          min={1}
          max={MAX_EPISODE_MINUTES}
          value={props.minutes}
          onChange={(e) => props.onMinutes(Number(e.target.value))}
          className={fieldInputClass}
        />
      </FormField>
      <FormField label="Tóm tắt tập">
        <textarea rows={3} value={props.synopsis} onChange={(e) => props.onSynopsis(e.target.value)} maxLength={5000} className={fieldTextareaClass} />
      </FormField>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={props.onCancel}>
          Huỷ
        </Button>
        <Button type="submit" disabled={props.busy || !valid}>
          {props.submitLabel}
        </Button>
      </div>
    </form>
  );
}
