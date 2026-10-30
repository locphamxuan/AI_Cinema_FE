'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { getTodayDateString } from '@/lib/dateUtils';
import { productionService } from '@/services/productionService';
import type { Episode, Season } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { toDateInput } from '@/lib/format';
import {
  MAX_EPISODE_MINUTES,
  deadlineValid,
  releaseDateValid,
  toEpisodeInput,
  type ReleaseWindowDraft,
} from '../shared/EpisodeRowsEditor';
import { SeasonDraftEditor, emptySeason, seasonValid, toSeasonInput, type SeasonDraft } from '../shared/SeasonDraftEditor';
import { useProject } from './ProjectContext';

export function AddSeasonModal({ firstNumber, nextSeason, onClose }: { firstNumber: number; nextSeason: number; onClose: () => void }) {
  const { project, reload } = useProject();
  const [season, setSeason] = useState<SeasonDraft>(emptySeason(nextSeason, firstNumber));
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await run(() => productionService.addSeason(project.id, toSeasonInput(season)), 'Đã thêm mùa')) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={`Thêm mùa ${nextSeason}`} maxWidth="max-w-3xl">
      <form onSubmit={submit} className="space-y-4">
        <SeasonDraftEditor season={season} number={nextSeason} firstNumber={firstNumber} onChange={setSeason} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !seasonValid(season)}>
            Thêm mùa
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Title, price of one episode and release window of a season. A new price after the allocation needs a top-up. */
export function EditSeasonModal({ season, onClose }: { season: Season; onClose: () => void }) {
  const { reload } = useProject();
  const [title, setTitle] = useState(season.title ?? '');
  const [cost, setCost] = useState(Number(season.episodeProductionCost));
  const [start, setStart] = useState(toDateInput(season.releaseStartDate));
  const [end, setEnd] = useState(toDateInput(season.releaseEndDate));
  const { busy, run } = useAction();
  const windowOk = !start || !end || start <= end;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        productionService.updateSeason(season.id, {
          title: title.trim() || undefined,
          episodeProductionCost: cost,
          releaseStartDate: start || null,
          releaseEndDate: end || null,
        }),
      'Đã lưu mùa',
    );
    if (done) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={`Sửa mùa ${season.seasonNumber}`} subtitle="Khoảng phát hành phải còn chứa ngày dự kiến phát hành của mọi tập.">
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Tên mùa">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} className={fieldInputClass} />
        </FormField>
        <FormField label="Đơn giá 1 tập (Token)">
          <input type="number" min={1} value={cost || ''} onChange={(e) => setCost(Number(e.target.value))} required className={fieldInputClass} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Phát hành từ ngày">
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={fieldInputClass} />
          </FormField>
          <FormField label="Đến ngày">
            <input type="date" min={start || undefined} value={end} onChange={(e) => setEnd(e.target.value)} className={`${fieldInputClass} ${windowOk ? '' : 'border-rose-500'}`} />
          </FormField>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !windowOk || !Number.isInteger(cost) || cost < 1}>
            Lưu
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const windowOf = (season: Season): ReleaseWindowDraft => ({
  start: toDateInput(season.releaseStartDate),
  end: toDateInput(season.releaseEndDate),
});

export function AddEpisodeModal({ season, onClose }: { season: Season; onClose: () => void }) {
  const { reload } = useProject();
  const [values, setValues] = useState({ title: '', minutes: 20, deadline: '', releaseDate: '', synopsis: '' });
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        productionService.addEpisode(season.id, {
          ...toEpisodeInput(values),
          ...(values.synopsis.trim() ? { synopsis: values.synopsis.trim() } : {}),
        }),
      'Đã thêm tập',
    );
    if (done) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={`Thêm tập vào mùa ${season.seasonNumber}`} subtitle="Tập mới nhận số thứ tự cuối cùng của phim; cấp thêm phí cho mùa ở tab Phí sản xuất.">
      <EpisodeForm
        values={values}
        window={windowOf(season)}
        deadlineRequired
        onChange={setValues}
        busy={busy}
        submitLabel="Thêm tập"
        onSubmit={submit}
        onCancel={onClose}
      />
    </Modal>
  );
}

export function EditEpisodeModal({ episode, season, onClose }: { episode: Episode; season: Season; onClose: () => void }) {
  const { reload } = useProject();
  const initialDeadline = toDateInput(episode.deliveryDeadline);
  const initialRelease = toDateInput(episode.expectedReleaseDate);
  const [values, setValues] = useState({
    title: episode.title,
    minutes: Math.round(episode.targetDurationSeconds / 60),
    deadline: initialDeadline,
    releaseDate: initialRelease,
    synopsis: episode.synopsis ?? '',
  });
  const { busy, run } = useAction();
  const moved = values.deadline !== initialDeadline;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { deliveryDeadline, expectedReleaseDate, ...fields } = toEpisodeInput(values);
    const done = await run(
      () =>
        productionService.updateEpisode(episode.id, {
          ...fields,
          ...(moved ? { deliveryDeadline } : {}),
          ...(values.releaseDate !== initialRelease ? { expectedReleaseDate: expectedReleaseDate ?? null } : {}),
          ...(values.synopsis.trim() ? { synopsis: values.synopsis.trim() } : {}),
        }),
      'Đã lưu tập',
    );
    if (done) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={`Sửa tập ${episode.episodeNumber}`} subtitle="Đổi thời lượng mục tiêu và hạn giao được tới khi tập được duyệt.">
      <EpisodeForm
        values={values}
        window={windowOf(season)}
        handedOff={!!episode.dueDate}
        deadlineRequired={moved}
        onChange={setValues}
        busy={busy}
        submitLabel="Lưu"
        onSubmit={submit}
        onCancel={onClose}
      />
    </Modal>
  );
}

interface EpisodeValues {
  title: string;
  minutes: number;
  deadline: string;
  releaseDate: string;
  synopsis: string;
}

function EpisodeForm(props: {
  values: EpisodeValues;
  window: ReleaseWindowDraft;
  /** The studio already works on it: a new deadline applies to the studio too. */
  handedOff?: boolean;
  /** False when editing and the deadline is left as it was. */
  deadlineRequired?: boolean;
  onChange: (values: EpisodeValues) => void;
  busy: boolean;
  submitLabel: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const { values, window } = props;
  const set = (patch: Partial<EpisodeValues>) => props.onChange({ ...values, ...patch });
  const deadlineOk = props.deadlineRequired === false || deadlineValid(values.deadline);
  const releaseOk = releaseDateValid(values.releaseDate, values.deadline, window);
  const valid = values.title.trim() && values.minutes > 0 && values.minutes <= MAX_EPISODE_MINUTES && deadlineOk && releaseOk;

  return (
    <form onSubmit={props.onSubmit} className="space-y-4">
      <FormField label="Tên tập">
        <input value={values.title} onChange={(e) => set({ title: e.target.value })} maxLength={255} required className={fieldInputClass} />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField label="Thời lượng mục tiêu (phút)">
          <input type="number" min={1} max={MAX_EPISODE_MINUTES} value={values.minutes} onChange={(e) => set({ minutes: Number(e.target.value) })} className={fieldInputClass} />
        </FormField>
        <FormField label="Hạn giao">
          <input type="date" min={getTodayDateString()} value={values.deadline} onChange={(e) => set({ deadline: e.target.value })} required={props.deadlineRequired !== false} className={fieldInputClass} />
        </FormField>
        <FormField label="Ngày dự kiến phát hành">
          <input type="date" min={values.deadline || undefined} value={values.releaseDate} onChange={(e) => set({ releaseDate: e.target.value })} className={`${fieldInputClass} ${releaseOk ? '' : 'border-rose-500'}`} />
        </FormField>
      </div>
      {(window.start || window.end) && (
        <p className="text-[11px] text-slate-500">
          Khoảng phát hành của mùa: {window.start || '…'} → {window.end || '…'}.
        </p>
      )}
      {props.handedOff && <p className="text-[11px] text-slate-500">Đã bàn giao: studio cũng phải giao theo hạn mới.</p>}
      <FormField label="Tóm tắt tập">
        <textarea rows={3} value={values.synopsis} onChange={(e) => set({ synopsis: e.target.value })} maxLength={5000} className={fieldTextareaClass} />
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
