'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { productionService } from '@/services/productionService';
import type { PriceAlert, PriceAlertStatus } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { PRICE_ALERT_STATUS } from '@/features/production/lib/labels';
import { formatDateTime } from '@/lib/format';
import { productionPaths } from '@/features/production/lib/routes';
import { Empty, ErrorNote, Loading, StatusPill, TextPromptModal } from '@/components/data/ui';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { MetaPager } from '@/components/data/MetaPager';

const FILTERS: { key: PriceAlertStatus | 'ALL'; label: string }[] = [
  { key: 'OPEN', label: 'Mới' },
  { key: 'CHANGE_REQUESTED', label: 'Đã hỏi Reviewer' },
  { key: 'RESOLVED', label: 'Đã xử lý' },
  { key: 'ALL', label: 'Tất cả' },
];

/**
 * BR-47: episode prices outside the valid range. The Admin may ask the Reviewer's opinion (the Reviewer answers in
 * a project note), then sets the price again itself (PATCH /episodes/:id/coin-price), or accepts the price as is.
 */
export function PriceAlertsPanel() {
  const [filter, setFilter] = useState<PriceAlertStatus | 'ALL'>('OPEN');
  const [page, setPage] = useState(1);
  const alerts = useResource(`price-alerts:${filter}:${page}`, () =>
    productionService.listPriceAlerts(page, filter === 'ALL' ? undefined : filter),
  );
  const [asking, setAsking] = useState<PriceAlert | null>(null);
  const [accepting, setAccepting] = useState<PriceAlert | null>(null);
  // Another Admin may have handled the alert meanwhile (409): close the dialogs and show the list as it is now.
  const { busy, run } = useAction({
    onStale: () => {
      setAsking(null);
      setAccepting(null);
      return alerts.reload();
    },
  });

  const requestChange = async (note: string) => {
    if (!asking) return;
    if (await run(() => productionService.requestPriceChange(asking.id, note), 'Đã gửi câu hỏi cho Reviewer')) {
      setAsking(null);
      await alerts.reload();
    }
  };
  const resolve = async (alert: PriceAlert) => {
    if (await run(() => productionService.resolvePriceAlert(alert.id), 'Đã chấp nhận giá này')) {
      setAccepting(null);
      await alerts.reload();
    }
  };

  return (
    <section className="bg-card rounded-2xl border border-sky-100 dark:border-white/10 overflow-hidden">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-bold text-foreground">Cảnh báo giá Coin</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Giá tập ngoài khoảng cho phép. Admin hỏi ý kiến Reviewer rồi tự đặt lại giá, hoặc chấp nhận giá.</p>
        </div>
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-muted border border-border">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filter === f.key
                  ? 'bg-white dark:bg-sky-600 text-sky-800 dark:text-white font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>
      <div className="p-5">
        {alerts.error && <ErrorNote message={alerts.error} onRetry={alerts.reload} />}
        {alerts.loading && !alerts.data && <Loading />}
        {alerts.data?.data.length === 0 && <Empty>Không có cảnh báo nào.</Empty>}
        <ul className="divide-y divide-slate-100 dark:divide-white/5">
          {alerts.data?.data.map((a) => (
            <li key={a.id} className="py-3 text-xs flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <Link
                  href={productionPaths.episode('/reviewer', a.episode.movie.id, a.episode.id)}
                  className="font-semibold text-foreground hover:underline"
                >
                  {a.episode.movie.title} - tập {a.episode.episodeNumber}: {a.episode.title}
                </Link>
                <p className="text-muted-foreground">
                  Giá đặt <b>{a.coinPrice}</b> Coin, khoảng hợp lệ {a.rangeMin}–{a.rangeMax}
                  {a.episode.coinPrice !== a.coinPrice && ` · giá hiện tại ${a.episode.coinPrice ?? '-'}`}
                </p>
                <p className="text-muted-foreground">
                  {a.setBy.fullName} · {formatDateTime(a.createdAt)}
                </p>
                {a.adminNote && <p className="text-muted-foreground">Đã hỏi Reviewer: {a.adminNote}</p>}
              </div>
              <div className="flex items-center gap-2">
                <StatusPill {...PRICE_ALERT_STATUS[a.status]} />
                {a.status === 'OPEN' && (
                  <Button size="sm" variant="secondary" disabled={busy} onClick={() => setAsking(a)}>
                    Hỏi ý kiến Reviewer
                  </Button>
                )}
                {a.status !== 'RESOLVED' && (
                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => setAccepting(a)}>
                    Chấp nhận giá
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {alerts.data && <MetaPager meta={alerts.data.meta} onPage={setPage} />}
      </div>
      <ConfirmModal
        open={!!accepting}
        title="Chấp nhận giá ngoài khoảng"
        description={
          accepting &&
          `Giữ giá ${accepting.coinPrice} Coin cho ${accepting.episode.movie.title} - tập ${accepting.episode.episodeNumber} dù ngoài khoảng ${accepting.rangeMin}–${accepting.rangeMax}. Cảnh báo được đóng.`
        }
        confirmLabel="Chấp nhận giá"
        busy={busy}
        onClose={() => setAccepting(null)}
        onConfirm={() => accepting && void resolve(accepting)}
      />
      <TextPromptModal
        open={!!asking}
        title="Hỏi ý kiến Reviewer về giá"
        subtitle="Reviewer góp ý bằng ghi chú dự án; sau đó bạn tự đặt lại giá Coin của tập."
        label="Câu hỏi cho Reviewer"
        confirmLabel="Gửi câu hỏi"
        busy={busy}
        onClose={() => setAsking(null)}
        onConfirm={requestChange}
      />
    </section>
  );
}
