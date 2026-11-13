'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { productionService } from '@/services/productionService';
import type { Episode, MovieStatus, Publication } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { EDITABLE_PROJECT, RELEASABLE_EPISODE, RELEASING_PROJECT, isIn } from '../../lib/capabilities';
import { UNPUBLISH_MODE, UNPUBLISH_REASON } from '../../lib/labels';
import { formatDateTime, formatNumber, localDateTimeToIso } from '@/lib/format';
import { Empty, Panel } from '@/components/data/ui';
import { UnpublishModal } from './UnpublishModal';

/**
 * Steps 12–16: the Reviewer in charge sets the Coin price (BR-29, BR-47); the Admin alone releases the Final Film
 * now or on a schedule, once the Reviewer confirmed it, and takes an episode down (BR-52, BR-56).
 */
export function PublishPanel({
  episode,
  projectStatus,
  canPrice: mayPrice,
  canPublish,
  onChanged,
}: {
  episode: Episode;
  projectStatus: MovieStatus;
  /** The Reviewer in charge (episode:price). */
  canPrice: boolean;
  /** The Admin (episode:publish). */
  canPublish: boolean;
  onChanged: () => Promise<void>;
}) {
  const publications = useResource(`publications:${episode.id}:${episode.status}`, () => productionService.listPublications(episode.id));
  const settings = useResource(mayPrice ? 'settings' : null, productionService.getPlatformSettings);
  const [price, setPrice] = useState(episode.coinPrice !== null ? String(episode.coinPrice) : '');
  const [isFreeForGuest, setIsFreeForGuest] = useState(!!episode.isFreeForGuest);
  const [isFreeForMember, setIsFreeForMember] = useState(!!episode.isFreeForMember);
  const [scheduleAt, setScheduleAt] = useState('');
  const [takingDown, setTakingDown] = useState<Publication | null>(null);
  const { busy, run } = useAction();

  const min = settings.data?.episodeCoinPriceMin;
  const max = settings.data?.episodeCoinPriceMax;
  const priceValue = Number(price);
  const priceValid = price !== '' && Number.isInteger(priceValue) && priceValue >= 0;
  const outOfRange = priceValid && min !== undefined && max !== undefined && (priceValue < min || priceValue > max);
  const canPrice = mayPrice && isIn(projectStatus, EDITABLE_PROJECT);
  const canRelease = canPublish && isIn(projectStatus, RELEASING_PROJECT) && isIn(episode.status, RELEASABLE_EPISODE);
  // A freshly checked version needs the Reviewer's Final Film confirmation; a re-release does not (BE publication.service).
  const awaitingFinal = episode.status === 'COMPLIANCE_PASSED' && !episode.finalConfirmedAt;
  const releaseBlocked = episode.coinPrice === null || awaitingFinal;
  const active = publications.data?.find((p) => !p.unpublishedAt);

  const refresh = () => Promise.all([publications.reload(), onChanged()]).then(() => undefined);

  const saveFlags = async (guest: boolean, member: boolean) => {
    setIsFreeForGuest(guest);
    setIsFreeForMember(member);
    const done = await run(
      () => productionService.setAccessFlags(episode.id, { isFreeForGuest: guest, isFreeForMember: member }),
      'Đã cập nhật quyền truy cập tập',
    );
    if (done) await onChanged();
  };

  const savePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () => productionService.setCoinPrice(episode.id, priceValue),
      outOfRange ? 'Đã lưu giá - giá ngoài khoảng nên Admin được báo' : 'Đã lưu giá Coin',
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
    <Panel
      title="Định giá & phát hành"
      description="Admin đặt giá Coin và cờ xem miễn phí; Admin phát hành Phim Final sau khi Reviewer xác nhận và tập có giá Coin."
    >
      <div className="space-y-5 text-xs">
        {canPrice ? (
          <div className="space-y-3">
            <form onSubmit={savePrice} className="flex flex-wrap items-end gap-2">
              <FormField label={`Giá Coin${min !== undefined ? ` (khoảng hợp lệ ${min}–${max})` : ''}`} className="w-48">
                <input type="number" min={0} step={1} value={price} onChange={(e) => setPrice(e.target.value)} className={fieldInputClass} />
              </FormField>
              <Button type="submit" variant="secondary" disabled={busy || !priceValid || priceValue === episode.coinPrice}>
                Lưu giá
              </Button>
              {outOfRange && <p className="w-full text-amber-600">Giá ngoài khoảng: vẫn lưu được nhưng Admin sẽ nhận cảnh báo.</p>}
            </form>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFreeForGuest}
                  disabled={busy}
                  onChange={(e) => saveFlags(e.target.checked, isFreeForMember)}
                  className="rounded border-slate-300 dark:border-white/20 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-700 dark:text-slate-200">Miễn phí cho khách (Guest)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFreeForMember}
                  disabled={busy}
                  onChange={(e) => saveFlags(isFreeForGuest, e.target.checked)}
                  className="rounded border-slate-300 dark:border-white/20 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-700 dark:text-slate-200">Miễn phí cho thành viên (Member)</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-slate-600 dark:text-slate-300">
            <p>Giá Coin: {formatNumber(episode.coinPrice)}</p>
            {(episode.isFreeForGuest || episode.isFreeForMember) && (
              <p className="text-slate-500">
                Miễn phí: {episode.isFreeForGuest ? 'Khách (Guest)' : ''}{episode.isFreeForGuest && episode.isFreeForMember ? ', ' : ''}{episode.isFreeForMember ? 'Thành viên (Member)' : ''}
              </p>
            )}
          </div>
        )}

        {canRelease && (
          <div className="space-y-2 rounded-xl border border-sky-100 dark:border-white/10 p-3">
            {episode.coinPrice === null && <p className="text-amber-600">Admin cần đặt giá Coin trước khi phát hành.</p>}
            {awaitingFinal && <p className="text-amber-600">Chờ Reviewer xác nhận Phim Final trước khi phát hành.</p>}
            <div className="flex flex-wrap items-end gap-2">
              <Button disabled={busy || releaseBlocked} onClick={() => publish(false)}>
                Phát hành ngay
              </Button>
              <span className="text-slate-400 px-1">hoặc</span>
              <FormField label="Lên lịch lúc" className="w-56">
                <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className={fieldInputClass} />
              </FormField>
              <Button
                variant="secondary"
                disabled={busy || releaseBlocked || !scheduleAt || new Date(scheduleAt) <= new Date()}
                onClick={() => publish(true)}
              >
                {episode.status === 'SCHEDULED' ? 'Đổi lịch' : 'Lên lịch'}
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
                    {p.unpublishNote && ` - ${p.unpublishNote}`}
                  </p>
                )}
                {canPublish && p === active && isIn(episode.status, ['PUBLISHED', 'SCHEDULED']) && (
                  <Button size="sm" variant="ghost" className="!px-0 text-rose-600" onClick={() => setTakingDown(p)}>
                    {p.publishedAt ? 'Gỡ tập' : 'Huỷ lịch'}
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
