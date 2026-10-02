'use client';

import { useState } from 'react';
import { CalendarClock, Coins, Rocket, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { productionService } from '@/services/productionService';
import type { Episode, MovieStatus, Publication, UnpublishMode, UnpublishReason } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { EDITABLE_PROJECT, RELEASABLE_EPISODE, RELEASING_PROJECT, isIn } from '../../lib/capabilities';
import { UNPUBLISH_MODE, UNPUBLISH_REASON } from '../../lib/labels';
import { formatDateTime, formatNumber, localDateTimeToIso } from '../../lib/format';
import { Empty, Panel } from '../shared/ui';

/** Steps 12–16: Coin price (BR-29, BR-47), release now or on a schedule, take an episode down (BR-52, BR-56). */
export function PublishPanel({
  episode,
  projectStatus,
  canAct,
  onChanged,
}: {
  episode: Episode;
  projectStatus: MovieStatus;
  canAct: boolean;
  onChanged: () => Promise<void>;
}) {
  const publications = useResource(`publications:${episode.id}:${episode.status}`, () => productionService.listPublications(episode.id));
  const settings = useResource(canAct ? 'settings' : null, productionService.getPlatformSettings);
  const [price, setPrice] = useState(episode.coinPrice !== null ? String(episode.coinPrice) : '');
  const [scheduleAt, setScheduleAt] = useState('');
  const [takingDown, setTakingDown] = useState<Publication | null>(null);
  const { busy, run } = useAction();

  const min = settings.data?.episodeCoinPriceMin;
  const max = settings.data?.episodeCoinPriceMax;
  const priceValue = Number(price);
  const priceValid = price !== '' && Number.isInteger(priceValue) && priceValue >= 0;
  const outOfRange = priceValid && min !== undefined && max !== undefined && (priceValue < min || priceValue > max);
  const canPrice = canAct && isIn(projectStatus, EDITABLE_PROJECT);
  const canRelease = canAct && isIn(projectStatus, RELEASING_PROJECT) && isIn(episode.status, RELEASABLE_EPISODE);
  const active = publications.data?.find((p) => !p.unpublishedAt);

  const refresh = () => Promise.all([publications.reload(), onChanged()]).then(() => undefined);

  const savePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () => productionService.setCoinPrice(episode.id, priceValue),
      outOfRange ? 'Đã lưu giá — giá ngoài khoảng nên Admin được báo' : 'Đã lưu giá Coin',
    );
    if (done) await onChanged();
  };

  const publish = async (scheduled: boolean) => {
    const done = await run(
      () => productionService.publish(episode.id, scheduled ? localDateTimeToIso(scheduleAt) : undefined),
      scheduled ? 'Đã lên lịch phát hành' : 'Tập đã phát hành',
    );
    if (done) {
      setScheduleAt('');
      await refresh();
    }
  };

  return (
    <Panel title="Định giá & phát hành" description="Tập chỉ phát hành được khi đã đạt kiểm tra tuân thủ và có giá Coin.">
      <div className="space-y-5 text-xs">
        {canPrice ? (
          <form onSubmit={savePrice} className="flex flex-wrap items-end gap-2">
            <FormField label={`Giá Coin${min !== undefined ? ` (khoảng hợp lệ ${min}–${max})` : ''}`} className="w-48">
              <input type="number" min={0} step={1} value={price} onChange={(e) => setPrice(e.target.value)} className={fieldInputClass} />
            </FormField>
            <Button type="submit" variant="secondary" disabled={busy || !priceValid || priceValue === episode.coinPrice}>
              <Coins className="w-3.5 h-3.5" aria-hidden="true" /> Lưu giá
            </Button>
            {outOfRange && <p className="w-full text-amber-600">Giá ngoài khoảng: vẫn lưu được nhưng Admin sẽ nhận cảnh báo (BR-47).</p>}
          </form>
        ) : (
          <p className="text-slate-600 dark:text-slate-300">Giá Coin: {formatNumber(episode.coinPrice)}</p>
        )}

        {canRelease && (
          <div className="space-y-2 rounded-xl border border-slate-200 dark:border-white/10 p-3">
            {episode.coinPrice === null && <p className="text-amber-600">Đặt giá Coin trước khi phát hành.</p>}
            <div className="flex flex-wrap items-end gap-2">
              <Button disabled={busy || episode.coinPrice === null} onClick={() => publish(false)}>
                <Rocket className="w-4 h-4" aria-hidden="true" /> Phát hành ngay
              </Button>
              <span className="text-slate-400 px-1">hoặc</span>
              <FormField label="Lên lịch lúc" className="w-56">
                <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className={fieldInputClass} />
              </FormField>
              <Button
                variant="secondary"
                disabled={busy || episode.coinPrice === null || !scheduleAt || new Date(scheduleAt) <= new Date()}
                onClick={() => publish(true)}
              >
                <CalendarClock className="w-4 h-4" aria-hidden="true" /> {episode.status === 'SCHEDULED' ? 'Đổi lịch' : 'Lên lịch'}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-200">Lịch sử phát hành</p>
          {publications.data?.length === 0 && <Empty>Chưa phát hành lần nào.</Empty>}
          <ul className="space-y-2">
            {publications.data?.map((p) => (
              <li key={p.id} className="rounded-lg bg-slate-50 dark:bg-white/5 p-2.5 space-y-0.5">
                <p className="text-slate-800 dark:text-slate-100">
                  {p.publishedAt
                    ? `Phát hành ${formatDateTime(p.publishedAt)}`
                    : p.scheduledAt
                      ? `Lên lịch ${formatDateTime(p.scheduledAt)}`
                      : 'Chờ phát hành'}{' '}
                  · {p.publishedBy.fullName}
                </p>
                {p.unpublishedAt && (
                  <p className="text-rose-600">
                    {p.publishedAt ? (p.unpublishMode ? UNPUBLISH_MODE[p.unpublishMode].label : 'Gỡ') : 'Huỷ lịch'} {formatDateTime(p.unpublishedAt)}
                    {p.unpublishReason && ` · ${UNPUBLISH_REASON[p.unpublishReason]}`}
                    {p.unpublishNote && ` — ${p.unpublishNote}`}
                  </p>
                )}
                {canAct && p === active && isIn(episode.status, ['PUBLISHED', 'SCHEDULED']) && (
                  <Button size="sm" variant="ghost" className="!px-0 text-rose-600" onClick={() => setTakingDown(p)}>
                    <Undo2 className="w-3.5 h-3.5" aria-hidden="true" /> {p.publishedAt ? 'Gỡ tập' : 'Huỷ lịch'}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {takingDown && (
        <UnpublishModal
          publication={takingDown}
          onClose={() => setTakingDown(null)}
          onDone={async () => {
            setTakingDown(null);
            await refresh();
          }}
        />
      )}
    </Panel>
  );
}

function UnpublishModal({ publication, onClose, onDone }: { publication: Publication; onClose: () => void; onDone: () => Promise<void> }) {
  const live = publication.publishedAt !== null;
  const [mode, setMode] = useState<UnpublishMode>('REVISION');
  const [reason, setReason] = useState<UnpublishReason>('MANUAL');
  const [note, setNote] = useState('');
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () => productionService.unpublish(publication.id, { ...(live ? { mode } : {}), reason, note: note.trim() }),
      live ? (mode === 'REVISION' ? 'Đã gỡ tập để sửa' : 'Đã gỡ hẳn tập') : 'Đã huỷ lịch phát hành',
    );
    if (done) await onDone();
  };

  return (
    <Modal open onClose={onClose} title={live ? 'Gỡ tập' : 'Huỷ lịch phát hành'}>
      <form onSubmit={submit} className="space-y-4 text-xs">
        {live && (
          <div role="radiogroup" aria-label="Cách gỡ" className="space-y-2">
            {(Object.keys(UNPUBLISH_MODE) as UnpublishMode[]).map((m) => (
              <label
                key={m}
                className={`block rounded-xl border p-3 cursor-pointer ${mode === m ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-500/10' : 'border-slate-200 dark:border-white/10'}`}
              >
                <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  <input type="radio" name="unpublish-mode" checked={mode === m} onChange={() => setMode(m)} />
                  {UNPUBLISH_MODE[m].label}
                </span>
                <span className="block mt-1 text-slate-500 dark:text-slate-400">{UNPUBLISH_MODE[m].hint}</span>
              </label>
            ))}
          </div>
        )}
        <FormField label="Lý do">
          <select value={reason} onChange={(e) => setReason(e.target.value as UnpublishReason)} className={fieldInputClass}>
            {(Object.keys(UNPUBLISH_REASON) as UnpublishReason[]).map((r) => (
              <option key={r} value={r}>
                {UNPUBLISH_REASON[r]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={live && mode === 'REVISION' ? 'Nhận xét gửi Creator / studio' : 'Ghi chú'}>
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} minLength={5} maxLength={2000} required className={fieldTextareaClass} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button type="submit" variant="danger" disabled={busy || note.trim().length < 5}>
            {live ? 'Gỡ tập' : 'Huỷ lịch'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
