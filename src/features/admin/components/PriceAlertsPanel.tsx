'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, MessageSquareWarning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { productionService } from '@/services/productionService';
import type { PriceAlert, PriceAlertStatus } from '@/types/production';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { PRICE_ALERT_STATUS } from '@/features/production/lib/labels';
import { formatDateTime } from '@/features/production/lib/format';
import { productionPaths } from '@/features/production/lib/routes';
import { Empty, ErrorNote, Loading, StatusPill, TextPromptModal } from '@/features/production/components/shared/ui';

const FILTERS: { key: PriceAlertStatus | 'ALL'; label: string }[] = [
  { key: 'OPEN', label: 'Mới' },
  { key: 'CHANGE_REQUESTED', label: 'Đã yêu cầu đổi' },
  { key: 'RESOLVED', label: 'Đã xử lý' },
  { key: 'ALL', label: 'Tất cả' },
];

/** BR-47: episode prices outside the valid range. The Admin asks the Reviewer to change them, never edits them. */
export function PriceAlertsPanel() {
  const [filter, setFilter] = useState<PriceAlertStatus | 'ALL'>('OPEN');
  const alerts = useResource(`price-alerts:${filter}`, () => productionService.listPriceAlerts(1, filter === 'ALL' ? undefined : filter));
  const [asking, setAsking] = useState<PriceAlert | null>(null);
  const { busy, run } = useAction();

  const requestChange = async (note: string) => {
    if (!asking) return;
    if (await run(() => productionService.requestPriceChange(asking.id, note), 'Đã gửi yêu cầu đổi giá cho Reviewer')) {
      setAsking(null);
      await alerts.reload();
    }
  };
  const resolve = async (alert: PriceAlert) => {
    if (await run(() => productionService.resolvePriceAlert(alert.id), 'Đã chấp nhận giá này')) await alerts.reload();
  };

  return (
    <section className="bg-white dark:bg-[#0F1C27] rounded-2xl border border-sky-100 dark:border-white/10 overflow-hidden">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Cảnh báo giá Coin</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Giá tập ngoài khoảng cho phép · Reviewer phụ trách là người đổi giá.</p>
        </div>
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filter === f.key
                  ? 'bg-white dark:bg-sky-600 text-sky-800 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                  className="font-semibold text-slate-900 dark:text-white hover:underline"
                >
                  {a.episode.movie.title} - tập {a.episode.episodeNumber}: {a.episode.title}
                </Link>
                <p className="text-slate-600 dark:text-slate-300">
                  Giá đặt <b>{a.coinPrice}</b> Coin, khoảng hợp lệ {a.rangeMin}–{a.rangeMax}
                  {a.episode.coinPrice !== a.coinPrice && ` · giá hiện tại ${a.episode.coinPrice ?? '-'}`}
                </p>
                <p className="text-slate-400">
                  {a.setBy.fullName} · {formatDateTime(a.createdAt)}
                </p>
                {a.adminNote && <p className="text-slate-600 dark:text-slate-300">Đã nhắn Reviewer: {a.adminNote}</p>}
              </div>
              <div className="flex items-center gap-2">
                <StatusPill {...PRICE_ALERT_STATUS[a.status]} />
                {a.status === 'OPEN' && (
                  <Button size="sm" variant="secondary" disabled={busy} onClick={() => setAsking(a)}>
                    <MessageSquareWarning className="w-3.5 h-3.5" aria-hidden="true" /> Yêu cầu đổi giá
                  </Button>
                )}
                {a.status !== 'RESOLVED' && (
                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => resolve(a)}>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" /> Chấp nhận giá
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <TextPromptModal
        open={!!asking}
        title="Yêu cầu Reviewer đổi giá"
        label="Lời nhắn cho Reviewer"
        confirmLabel="Gửi"
        busy={busy}
        onClose={() => setAsking(null)}
        onConfirm={requestChange}
      />
    </section>
  );
}
