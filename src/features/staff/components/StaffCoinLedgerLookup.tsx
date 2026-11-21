'use client';

import { useState } from 'react';
import { billingAdminService } from '@/services/billingAdminService';
import type { CoinEntryType } from '@/types/billing';
import { useResource } from '@/hooks/useResource';
import { COIN_ENTRY_LABEL, COIN_ENTRY_TYPES } from '@/lib/coinEntry';
import { formatDateTime } from '@/lib/format';
import { Panel, Empty, Loading, ErrorNote } from '@/components/data/ui';
import { MetaPager } from '@/components/data/MetaPager';

/** Read-only Coin ledger lookup for Staff. Wallet/user IDs are intentionally hidden (sensitive data). */
export function StaffCoinLedgerLookup() {
  const [entryType, setEntryType] = useState<CoinEntryType | ''>('');
  const [page, setPage] = useState(1);
  const ledger = useResource(`staff:ledger:${entryType}:${page}`, () =>
    billingAdminService.ledger({ page, entryType: entryType || undefined }),
  );

  return (
    <Panel
      title="Giao dịch Coin"
      description="Sổ cái chỉ ghi thêm: mỗi dòng là một lần Coin vào hoặc ra ví. ID ví/thành viên được ẩn với Staff (dữ liệu nhạy cảm)."
      actions={
        <select
          aria-label="Lọc theo loại giao dịch"
          value={entryType}
          onChange={(e) => {
            setEntryType(e.target.value as CoinEntryType | '');
            setPage(1);
          }}
          className="border border-input bg-background px-2 py-1 text-xs rounded-md focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Mọi loại giao dịch</option>
          {COIN_ENTRY_TYPES.map((t) => (
            <option key={t} value={t}>{COIN_ENTRY_LABEL[t]}</option>
          ))}
        </select>
      }
    >
      {ledger.error && <ErrorNote message={ledger.error} onRetry={ledger.reload} />}
      {ledger.loading && !ledger.data && <Loading label="Đang tải sổ cái Coin…" />}
      {ledger.data?.data.length === 0 && <Empty>Chưa có giao dịch nào.</Empty>}
      {ledger.data && ledger.data.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs table-cells">
            <thead className="text-muted-foreground text-left">
              <tr>
                <th className="py-2 font-medium">Thời gian</th>
                <th className="py-2 font-medium">Loại</th>
                <th className="py-2 font-medium hidden md:table-cell">Mô tả</th>
                <th className="py-2 font-medium text-right">Coin chính</th>
                <th className="py-2 font-medium text-right">Coin thưởng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {ledger.data.data.map((line) => (
                <tr key={line.id}>
                  <td className="py-2 whitespace-nowrap">{formatDateTime(line.createdAt)}</td>
                  <td className="py-2">{COIN_ENTRY_LABEL[line.entryType]}</td>
                  <td className="py-2 hidden md:table-cell text-muted-foreground">{line.description ?? '-'}</td>
                  <td className="py-2 text-right tabular-nums">{line.mainAmount >= 0 ? '+' : ''}{line.mainAmount}</td>
                  <td className="py-2 text-right tabular-nums">{line.bonusAmount >= 0 ? '+' : ''}{line.bonusAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <MetaPager meta={ledger.data.meta} onPage={setPage} />
        </div>
      )}
    </Panel>
  );
}
