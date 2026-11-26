'use client';

import React from 'react';
import { billingAdminService } from '@/services/billingAdminService';
import type { SubscriptionStatus } from '@/types/billing';
import { useResource } from '@/hooks/useResource';
import { Panel, Empty, ErrorNote, Loading } from '@/components/data/ui';
import { formatDay, formatNumber } from '@/lib/format';
import { MetaPager } from '@/components/data/MetaPager';

const PAGE_SIZE = 20;

const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, string> = {
  PENDING: 'Chờ thanh toán',
  ACTIVE: 'Đang chạy',
  PAST_DUE: 'Gia hạn lỗi',
  CANCELLED: 'Đã huỷ',
  EXPIRED: 'Hết hạn',
};

/** Read-only subscription lookup for Staff. Member email is intentionally hidden (sensitive data). */
export function StaffSubscriptionsLookup() {
  const [status, setStatus] = React.useState<SubscriptionStatus | ''>('');
  const [page, setPage] = React.useState(1);
  const list = useResource(`staff:subscriptions:${status}:${page}`, () =>
    billingAdminService.listSubscriptions({ page, status: status || undefined }),
  );
  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? { totalItems: 0, currentPage: 1, totalPages: 1, itemsPerPage: PAGE_SIZE };

  return (
    <Panel
      title="Đăng ký gói"
      description={`Gói của từng Member (${meta.totalItems}). Email của Member được ẩn với Staff (dữ liệu nhạy cảm).`}
      actions={
        <select
          aria-label="Lọc theo trạng thái"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as SubscriptionStatus | '');
            setPage(1);
          }}
          className="border border-input bg-background px-2 py-1 text-xs rounded-md focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Mọi trạng thái</option>
          {Object.entries(SUBSCRIPTION_STATUS).map(([key, label]) => (
            <option key={key} value={key as SubscriptionStatus}>
              {label}
            </option>
          ))}
        </select>
      }
    >
      {list.error && <ErrorNote message={list.error} onRetry={list.reload} />}
      {list.loading && !list.data && <Loading label="Đang tải danh sách đăng ký…" />}
      {list.data && rows.length === 0 && <Empty>Không có đăng ký nào.</Empty>}
      {rows.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs table-cells">
              <thead className="text-muted-foreground text-left">
                <tr>
                  <th className="py-2 font-medium">Member</th>
                  <th className="py-2 font-medium">Gói</th>
                  <th className="py-2 font-medium">Trạng thái</th>
                  <th className="py-2 font-medium">Hết kỳ</th>
                  <th className="py-2 font-medium text-right">Giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-accent/50">
                    <td className="py-2">
                      <span className="block font-medium text-foreground">{row.user.fullName}</span>
                      <p className="text-[11px] text-muted-foreground">Email được ẩn</p>
                    </td>
                    <td className="py-2">
                      {row.plan.name}
                      {row.source === 'REWARD' && <span className="ml-1 text-xs text-sky-700">(vòng quay)</span>}
                    </td>
                    <td className="py-2">{SUBSCRIPTION_STATUS[row.status]}</td>
                    <td className="py-2">{formatDay(row.currentPeriodEnd)}</td>
                    <td className="py-2 text-right tabular-nums">{formatNumber(row.priceCoins)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <MetaPager meta={meta} onPage={setPage} />
        </>
      )}
    </Panel>
  );
}
