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
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { UnpublishModal } from './UnpublishModal';

/** The highest Coin price the API accepts for one episode (SetCoinPriceRequestDto). */
const MAX_COIN_PRICE = 1_000_000;

/**
 * Steps 12–16: the Admin sets the Coin price (BR-29, BR-47) and the free flags (BR-03/19), releases the Final Film
 * now or on a schedule once the Reviewer confirmed it, and takes an episode down (BR-52, BR-56).
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
  /** The Admin (episode:price). */
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
  const [confirming, setConfirming] = useState<'now' | 'schedule' | null>(null);
  const refresh = () => Promise.all([publications.reload(), onChanged()]).then(() => undefined);
  const { busy, run } = useAction({ onStale: refresh });

  const min = settings.data?.episodeCoinPriceMin;
  const max = settings.data?.episodeCoinPriceMax;
  const priceValue = Number(price);
  const priceValid = price !== '' && Number.isInteger(priceValue) && priceValue >= 0 && priceValue <= MAX_COIN_PRICE;
  const priceProblem =
    price === '' || priceValid ? null : `Giá Coin phải là số nguyên từ 0 đến ${formatNumber(MAX_COIN_PRICE)}.`;
  const outOfRange = priceValid && min !== undefined && max !== undefined && (priceValue < min || priceValue > max);
  const canPrice = mayPrice && isIn(projectStatus, EDITABLE_PROJECT);
  const canRelease = canPublish && isIn(projectStatus, RELEASING_PROJECT) && isIn(episode.status, RELEASABLE_EPISODE);
  // A freshly checked version needs the Reviewer's Final Film confirmation; a re-release does not (BE publication.service).
  const awaitingFinal = episode.status === 'COMPLIANCE_PASSED' && !episode.finalConfirmedAt;
  const releaseBlocked = episode.coinPrice === null || awaitingFinal;
  const active = publications.data?.find((p) => !p.unpublishedAt);

  // BR-03/19: an episode free for Guests is free for Members too, as the API stores it.
  const saveFlags = async (guest: boolean, member: boolean) => {
    const before = { guest: isFreeForGuest, member: isFreeForMember };
    setIsFreeForGuest(guest);
    setIsFreeForMember(guest || member);
    const done = await run(
      () => productionService.setAccessFlags(episode.id, { isFreeForGuest: guest, isFreeForMember: guest || member }),
      'Đã cập nhật quyền xem miễn phí của tập',
    );
    if (done) return onChanged();
    setIsFreeForGuest(before.guest);
    setIsFreeForMember(before.member);
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
    setConfirming(null);
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
      description="Admin đặt giá Coin và quyền xem miễn phí; Admin phát hành Phim bản cuối sau khi Reviewer xác nhận và tập có giá Coin."
    >
      <div className="space-y-5 text-xs">
        {canPrice ? (
          <div className="space-y-3">
            <form onSubmit={savePrice} className="flex flex-wrap items-end gap-2">
              <FormField label={`Giá Coin${min !== undefined ? ` (khoảng hợp lệ ${min}–${max})` : ''}`} className="w-48" error={priceProblem}>
                <input type="number" min={0} max={MAX_COIN_PRICE} step={1} aria-invalid={!!priceProblem} value={price} onChange={(e) => setPrice(e.target.value)} className={fieldInputClass} />
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
                  className="rounded border-input text-sky-600 focus:ring-sky-500"
                />
                <span className="text-secondary-foreground">Miễn phí cho khách chưa đăng nhập</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFreeForGuest || isFreeForMember}
                  disabled={busy || isFreeForGuest}
                  title={isFreeForGuest ? 'Tập miễn phí cho khách thì cũng miễn phí cho thành viên' : undefined}
                  onChange={(e) => saveFlags(isFreeForGuest, e.target.checked)}
                  className="rounded border-input text-sky-600 focus:ring-sky-500"
                />
                <span className="text-secondary-foreground">Miễn phí cho thành viên (Member)</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-muted-foreground">
            <p>Giá Coin: {formatNumber(episode.coinPrice)}</p>
            {(episode.isFreeForGuest || episode.isFreeForMember) && (
              <p className="text-muted-foreground">
                Miễn phí: {episode.isFreeForGuest ? 'Khách chưa đăng nhập' : ''}{episode.isFreeForGuest && episode.isFreeForMember ? ', ' : ''}{episode.isFreeForMember ? 'Thành viên (Member)' : ''}
              </p>
            )}
          </div>
        )}

        {canRelease && (
          <div className="space-y-2 rounded-xl border border-sky-100 dark:border-white/10 p-3">
            {episode.coinPrice === null && <p className="text-amber-600">Admin cần đặt giá Coin trước khi phát hành.</p>}
            {awaitingFinal && <p className="text-amber-600">Chờ Reviewer xác nhận Phim bản cuối trước khi phát hành.</p>}
            <div className="flex flex-wrap items-end gap-2">
              <Button disabled={busy || releaseBlocked} onClick={() => setConfirming('now')}>
                Phát hành ngay
              </Button>
              <span className="text-muted-foreground px-1">hoặc</span>
              <FormField label="Lên lịch lúc" className="w-56">
                <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className={fieldInputClass} />
              </FormField>
              <Button
                variant="secondary"
                disabled={busy || releaseBlocked || !scheduleAt || new Date(scheduleAt) <= new Date()}
                onClick={() => setConfirming('schedule')}
              >
                {episode.status === 'SCHEDULED' ? 'Đổi lịch' : 'Lên lịch'}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="font-semibold text-secondary-foreground">Lịch sử phát hành</p>
          {publications.data?.length === 0 && <Empty>Chưa phát hành lần nào.</Empty>}
          <ul className="space-y-2">
            {publications.data?.map((p) => (
              <li key={p.id} className="rounded-lg bg-muted/60 p-2.5 space-y-0.5">
                <p className="text-foreground">
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

      <ConfirmModal
        open={confirming !== null}
        title={confirming === 'schedule' ? 'Lên lịch phát hành tập' : 'Phát hành tập ngay'}
        description={`Tập ${episode.episodeNumber}${episode.title ? ` - ${episode.title}` : ''} sẽ hiện với khán giả trên ứng dụng.`}
        details={[
          ['Giá Coin', formatNumber(episode.coinPrice)],
          ['Miễn phí', episode.isFreeForGuest ? 'Khách và thành viên' : episode.isFreeForMember ? 'Thành viên' : 'Không'],
          ...(confirming === 'schedule' && scheduleAt ? [['Thời điểm', formatDateTime(localDateTimeToIso(scheduleAt))] as [string, string]] : []),
        ]}
        consequence="Khán giả mua hoặc xem tập theo giá trên. Muốn dừng phải gỡ tập (người đã mua được hoàn Coin nếu gỡ hẳn)."
        confirmLabel={confirming === 'schedule' ? 'Lên lịch' : 'Phát hành'}
        busy={busy}
        onClose={() => setConfirming(null)}
        onConfirm={() => void publish(confirming === 'schedule')}
      />

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
