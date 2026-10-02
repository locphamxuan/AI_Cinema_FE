'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { getTodayDateString } from '@/lib/dateUtils';
import { productionService } from '@/services/productionService';
import type { Episode, Season } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { formatDay, toDateInput } from '../../lib/format';
import {
  EpisodeRowsEditor,
  MAX_EPISODE_MINUTES,
  MilestoneQuickFill,
  emptyEpisode,
  episodesValid,
  milestoneValid,
  spreadMilestones,
  toEpisodeInput,
  type EpisodeDraft,
} from '../shared/EpisodeRowsEditor';
import { useProject } from './ProjectContext';

export function AddSeasonModal({ firstNumber, nextSeason, onClose }: { firstNumber: number; nextSeason: number; onClose: () => void }) {
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
        <MilestoneQuickFill
          onApply={(first, gap) => {
            const days = spreadMilestones(first, gap, episodes.length);
            setEpisodes(episodes.map((ep, i) => ({ ...ep, milestone: days[i] })));
          }}
        />
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

export function AddEpisodeModal({ season, onClose }: { season: Season; onClose: () => void }) {
  const { reload } = useProject();
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(20);
  const [milestone, setMilestone] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        productionService.addEpisode(season.id, {
          ...toEpisodeInput({ title, minutes, milestone }),
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
        milestone={milestone}
        synopsis={synopsis}
        onTitle={setTitle}
        onMinutes={setMinutes}
        onMilestone={setMilestone}
        onSynopsis={setSynopsis}
        busy={busy}
        submitLabel="Thêm tập"
        onSubmit={submit}
        onCancel={onClose}
      />
    </Modal>
  );
}

export function EditEpisodeModal({ episode, onClose }: { episode: Episode; onClose: () => void }) {
  const { reload } = useProject();
  const [title, setTitle] = useState(episode.title);
  const [minutes, setMinutes] = useState(Math.round(episode.targetDurationSeconds / 60));
  const initialMilestone = toDateInput(episode.milestoneDate);
  const [milestone, setMilestone] = useState(initialMilestone);
  const [synopsis, setSynopsis] = useState(episode.synopsis ?? '');
  const { busy, run } = useAction();
  const moved = milestone !== initialMilestone;
  // The studio is already due on this day; the milestone cannot come before it.
  const studioDue = toDateInput(episode.dueDate);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { milestoneDate, ...fields } = toEpisodeInput({ title, minutes, milestone });
    const done = await run(
      () =>
        productionService.updateEpisode(episode.id, {
          ...fields,
          ...(moved ? { milestoneDate } : {}),
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
        milestone={milestone}
        milestoneMin={studioDue}
        milestoneRequired={moved}
        synopsis={synopsis}
        onTitle={setTitle}
        onMinutes={setMinutes}
        onMilestone={setMilestone}
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
  milestone: string;
  /** Earliest allowed milestone besides today, e.g. the studio due date already set. */
  milestoneMin?: string;
  /** False when editing and the milestone is left as it was. */
  milestoneRequired?: boolean;
  synopsis: string;
  onTitle: (v: string) => void;
  onMinutes: (v: number) => void;
  onMilestone: (v: string) => void;
  onSynopsis: (v: string) => void;
  busy: boolean;
  submitLabel: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const today = getTodayDateString();
  const earliest = props.milestoneMin && props.milestoneMin > today ? props.milestoneMin : today;
  const milestoneOk = props.milestoneRequired === false || (milestoneValid(props.milestone) && props.milestone >= earliest);
  const valid = props.title.trim() && props.minutes > 0 && props.minutes <= MAX_EPISODE_MINUTES && milestoneOk;
  return (
    <form onSubmit={props.onSubmit} className="space-y-4">
      <FormField label="Tên tập">
        <input value={props.title} onChange={(e) => props.onTitle(e.target.value)} maxLength={255} required className={fieldInputClass} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Thời lượng mục tiêu (phút)">
          <input
            type="number"
            min={1}
            max={MAX_EPISODE_MINUTES}
            value={props.minutes}
            onChange={(e) => props.onMinutes(Number(e.target.value))}
            className={fieldInputClass}
          />
        </FormField>
        <FormField label="Mốc hoàn thành">
          <input
            type="date"
            min={earliest}
            value={props.milestone}
            onChange={(e) => props.onMilestone(e.target.value)}
            required={props.milestoneRequired !== false}
            className={fieldInputClass}
          />
        </FormField>
      </div>
      {props.milestoneMin && (
        <p className="text-[11px] text-slate-500">Studio đang có hạn {formatDay(props.milestoneMin)}; mốc không được sớm hơn ngày này.</p>
      )}
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
