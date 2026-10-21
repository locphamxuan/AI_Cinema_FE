'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { formatDateTime, formatDay, formatNumber } from '@/features/production/lib/format';
import type { Tone } from '@/features/production/lib/labels';
import { Empty, ErrorNote, Loading, Panel, StatusPill } from '@/features/production/components/shared/ui';
import { billingAdminService } from '@/services/billingAdminService';
import type { AdminSubscription, SubscriptionCycle, SubscriptionEndReason, SubscriptionStatus } from '@/types/billing';
import { Pager } from './Pager';

export const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'Chờ thanh toán', tone: 'neutral' },
  ACTIVE: { label: 'Đang chạy', tone: 'emerald' },
  PAST_DUE: { label: 'Gia hạn lỗi', tone: 'amber' },
  CANCELLED: { label: 'Đã huỷ', tone: 'rose' },
  EXPIRED: { label: 'Hết hạn', tone: 'neutral' },
};

const END_REASON: Record<SubscriptionEndReason, string> = {
  CANCELLED_BY_MEMBER: 'Member huỷ',
  CANCELLED_BY_ADMIN: 'Admin huỷ',
  PAYMENT_FAILED: 'Hết hạn vì gia hạn thiếu Coin',
  NOT_RENEWED: 'Hết kỳ, không gia hạn',
};

const OPEN: SubscriptionStatus[] = ['PENDING', 'ACTIVE', 'PAST_DUE'];

/** MF-2: every member's plan; Staff reads, the Admin may also end one. */
export function SubscriptionsPanel() {
  const [status, setStatus] = useState<SubscriptionStatus | ''>('');
  const [page, setPage] = useState(1);
  const list = useResource(`admin:subscriptions:${status}:${page}`, () =>
    billingAdminService.listSubscriptions({ page, status: status || undefined }),
  );
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Panel
      title="Đăng ký gói"
      description="Gói của từng Member: kỳ hiện tại, tự gia hạn, các lần thu Coin."
      actions={
        <select
          aria-label="Lọc theo trạng thái"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as SubscriptionStatus | '');
            setPage(1);
          }}
          className={`${fieldInputClass} py-1 text-xs w-40`}
        >
          <option value="">Mọi trạng thái</option>
          {(Object.keys(SUBSCRIPTION_STATUS) as SubscriptionStatus[]).map((s) => (
            <option key={s} value={s}>
              {SUBSCRIPTION_STATUS[s].label}
            </option>
          ))}
        </select>
      }
    >
      {list.error && <ErrorNote message={list.error} onRetry={list.reload} />}
      {list.loading && !list.data && <Loading />}
      {list.data?.data.length === 0 && <Empty>Không có đăng ký nào.</Empty>}
      {list.data && list.data.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-slate-500 dark:text-slate-400 text-left">
              <tr>
                <th className="py-2 font-medium">Member</th>
                <th className="py-2 font-medium">Gói</th>
                <th className="py-2 font-medium">Trạng thái</th>
                <th className="py-2 font-medium">Hết kỳ</th>
                <th className="py-2 font-medium text-right">Giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {list.data.data.map((row) => (
                <tr key={row.id}>
                  <td className="py-2">
                    <button type="button" onClick={() => setOpenId(row.id)} className="text-left hover:underline cursor-pointer">
                      <span className="block font-medium text-slate-900 dark:text-white">{row.user.fullName}</span>
                      <span className="block text-[11px] text-slate-500">{row.user.email}</span>
                    </button>
                  </td>
                  <td className="py-2">
                    {row.plan.name}
                    {row.source === 'REWARD' && <span className="ml-1 text-[10px] text-purple-600">(vòng quay)</span>}
                  </td>
                  <td className="py-2">
                    <StatusPill {...SUBSCRIPTION_STATUS[row.status]} />
                  </td>
                  <td className="py-2">{formatDay(row.currentPeriodEnd)}</td>
                  <td className="py-2 text-right font-mono">{formatNumber(row.priceCoins)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pager meta={list.data.meta} onPage={setPage} />
        </div>
      )}
      {openId && <SubscriptionModal id={openId} onClose={() => setOpenId(null)} onChanged={list.reload} />}
    </Panel>
  );
}

function SubscriptionModal({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => Promise<void> }) {
  const detail = useResource(`admin:subscription:${id}`, () => billingAdminService.subscription(id));
  const canCancel = useCan()(PERMISSION.BILLING_SUBSCRIPTION_CANCEL);
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const { busy, run } = useAction();
  const sub = detail.data;

  const cancel = async () => {
    if (await run(() => billingAdminService.cancelSubscription(id, reason.trim() || undefined), 'Đã kết thúc gói')) {
      await Promise.all([detail.reload(), onChanged()]);
      setConfirming(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Chi tiết đăng ký gói" maxWidth="max-w-2xl">
      {detail.error && <ErrorNote message={detail.error} onRetry={detail.reload} />}
      {detail.loading && !sub && <Loading />}
      {sub && (
        <div className="space-y-4 text-xs">
          <SubscriptionFacts sub={sub} />
          <CycleTable cycles={sub.cycles} />
          {canCancel && OPEN.includes(sub.status) && !confirming && (
            <div className="flex justify-end">
              <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
                Kết thúc gói ngay
              </Button>
            </div>
          )}
          {confirming && (
            <div className="space-y-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
              <p className="text-rose-700 dark:text-rose-300">Member mất quyền xem trọn bộ ngay, Coin đã thu không được hoàn.</p>
              <FormField label="Lý do (ghi vào nhật ký)">
                <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className={fieldTextareaClass} />
              </FormField>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="secondary" onClick={() => setConfirming(false)}>
                  Thôi
                </Button>
                <Button size="sm" variant="danger" disabled={busy} onClick={() => void cancel()}>
                  Xác nhận kết thúc
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function SubscriptionFacts({ sub }: { sub: AdminSubscription }) {
  const facts: [string, string][] = [
    ['Member', `${sub.user.fullName} · ${sub.user.email}`],
    ['Gói', `${sub.plan.name}${sub.source === 'REWARD' ? ' (tặng từ vòng quay)' : ''}`],
    ['Trạng thái', SUBSCRIPTION_STATUS[sub.status].label + (sub.endReason ? ` - ${END_REASON[sub.endReason]}` : '')],
    ['Bắt đầu', formatDateTime(sub.startedAt)],
    ['Hết kỳ hiện tại', formatDateTime(sub.currentPeriodEnd)],
    ['Tự gia hạn', sub.autoRenew ? `Bật - lần tới ${formatDateTime(sub.nextRenewalAt)}` : 'Tắt'],
    ['Đã gia hạn', `${sub.renewalsCompleted} lần`],
  ];
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
      {facts.map(([k, v]) => (
        <div key={k}>
          <dt className="text-slate-500">{k}</dt>
          <dd className="font-medium text-slate-900 dark:text-white">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function CycleTable({ cycles }: { cycles: SubscriptionCycle[] }) {
  if (cycles.length === 0) return <Empty>Chưa thu Coin kỳ nào.</Empty>;
  return (
    <table className="w-full">
      <thead className="text-slate-500 text-left">
        <tr>
          <th className="py-1 font-medium">Kỳ</th>
          <th className="py-1 font-medium">Thời gian</th>
          <th className="py-1 font-medium">Kết quả</th>
          <th className="py-1 font-medium text-right">Coin chính + thưởng</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
        {cycles.map((c) => (
          <tr key={c.id}>
            <td className="py-1">#{c.cycleNumber}</td>
            <td className="py-1">
              {formatDay(c.periodStart)} → {formatDay(c.periodEnd)}
            </td>
            <td className="py-1">{c.status === 'PAID' ? 'Đã thu' : (c.failureReason ?? 'Không thu được')}</td>
            <td className="py-1 text-right font-mono">
              {c.mainCoinsCharged} + {c.bonusCoinsCharged}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
