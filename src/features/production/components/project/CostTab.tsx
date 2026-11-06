'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { productionService } from '@/services/productionService';
import type { CostLedger } from '@/types/cost';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { OPEN_PROJECT, isIn } from '../../lib/capabilities';
import { COST_ENTRY } from '../../lib/labels';
import { formatDateTime, formatVnd } from '../../lib/format';
import { parseVnd } from '../shared/CostRequestCard';
import { Empty, ErrorNote, Loading, Panel } from '../shared/ui';
import { CostRequestPanel } from './CostRequestPanel';
import { useProject } from './ProjectContext';

/**
 * Production cost in VND (BR-45, BR-46): the budget the Admin set, what studios hold (the fee each brief offered,
 * or what a replaced studio kept) and what is left for a new fee. Studios are paid a fixed agreed fee, never a
 * share of revenue.
 */
export function CostTab() {
  const { project, caps, reload } = useProject();
  const ledger = useResource(`costs:${project.id}:${project.updatedAt}`, () => productionService.getCosts(project.id));
  const open = isIn(project.status, [...OPEN_PROJECT, 'UNDER_REVISION']);
  const refresh = async () => {
    await Promise.all([ledger.reload(), reload()]);
  };
  const summary = ledger.data ?? { ...project.cost, entries: [] };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Panel title="Ngân sách sản xuất" description="Admin đặt khi lên ý tưởng. Studio nhận mức phí trọn gói đã thoả thuận, không chia doanh thu.">
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Figure label="Tổng ngân sách" value={summary.budgetVnd} tone="sky" />
            <Figure label="Đã cam kết với Studio" value={summary.committedVnd} tone="slate" />
            <Figure label="Còn lại" value={summary.remainingVnd} tone="emerald" />
          </dl>
        </Panel>

        <Panel title="Lịch sử ngân sách" description="Mỗi lần đặt, cấp thêm hoặc điều chỉnh là một dòng mới; không sửa, không xoá dòng cũ.">
          {ledger.error && <ErrorNote message={ledger.error} onRetry={ledger.reload} />}
          {ledger.loading && !ledger.data && <Loading />}
          {ledger.data && <LedgerTable ledger={ledger.data} />}
        </Panel>

        <CostRequestPanel canAsk={caps.costRequest && open} onGranted={refresh} />
      </div>

      {caps.costAdjust && open && <BudgetForm funded={summary.budgetVnd > 0} committedVnd={summary.committedVnd} budgetVnd={summary.budgetVnd} onSaved={refresh} />}
    </div>
  );
}

const TONES = {
  sky: 'bg-sky-50 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300',
  slate: 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-100',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
} as const;

function Figure({ label, value, tone }: { label: string; value: number; tone: keyof typeof TONES }) {
  return (
    <div className={`rounded-xl p-3 ${TONES[tone]}`}>
      <dt className="text-[11px] text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-lg font-bold">{formatVnd(value)}</dd>
    </div>
  );
}

function LedgerTable({ ledger }: { ledger: CostLedger }) {
  if (ledger.entries.length === 0) return <Empty>Admin chưa đặt ngân sách. Dự án chỉ được giao cho Creator sau khi có ngân sách.</Empty>;
  return (
    <table className="w-full text-xs">
      <thead className="text-slate-500 dark:text-slate-400 text-left">
        <tr>
          <th className="py-2 font-medium">Loại</th>
          <th className="py-2 font-medium text-right">Số tiền</th>
          <th className="py-2 pl-4 font-medium">Lý do</th>
          <th className="py-2 font-medium hidden md:table-cell">Người ghi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
        {ledger.entries.map((e) => (
          <tr key={e.id}>
            <td className="py-2 text-slate-700 dark:text-slate-200">{COST_ENTRY[e.entryType]}</td>
            <td className={`py-2 text-right font-mono ${Number(e.amountVnd) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {Number(e.amountVnd) > 0 ? '+' : ''}
              {formatVnd(e.amountVnd)}
            </td>
            <td className="py-2 pl-4 text-slate-600 dark:text-slate-300">{e.reason ?? '-'}</td>
            <td className="py-2 hidden md:table-cell text-slate-500">
              {e.createdBy.fullName}
              <br />
              <span className="text-xs">{formatDateTime(e.createdAt)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** The Admin sets the budget once, then corrects it with a reason; it may not drop below what studios hold. */
function BudgetForm({
  funded,
  budgetVnd,
  committedVnd,
  onSaved,
}: {
  funded: boolean;
  budgetVnd: number;
  committedVnd: number;
  onSaved: () => Promise<void>;
}) {
  const { project } = useProject();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const { busy, run } = useAction();
  const value = parseVnd(amount);
  const next = budgetVnd + value;
  const valid = funded
    ? value !== 0 && !Number.isNaN(value) && next > 0 && next >= committedVnd && reason.trim().length > 0
    : value > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entry = funded
      ? { entryType: 'CORRECTION' as const, amountVnd: value, reason: reason.trim() }
      : { entryType: 'BUDGET' as const, amountVnd: value, ...(reason.trim() ? { reason: reason.trim() } : {}) };
    if (await run(() => productionService.addCostEntry(project.id, entry), funded ? 'Đã điều chỉnh ngân sách' : 'Đã đặt ngân sách')) {
      setAmount('');
      setReason('');
      await onSaved();
    }
  };

  return (
    <Panel
      title={funded ? 'Điều chỉnh ngân sách' : 'Đặt ngân sách sản xuất'}
      description={funded ? 'Số âm để giảm. Ngân sách không được thấp hơn phần đã cam kết với Studio.' : 'Bội số 1.000 ₫. Reviewer được báo ngay.'}
    >
      <form onSubmit={submit} className="space-y-3">
        <FormField label={funded ? 'Số tiền điều chỉnh (₫)' : 'Ngân sách (₫)'}>
          <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} required className={fieldInputClass} aria-label="Số tiền" />
        </FormField>
        {funded && !Number.isNaN(value) && value !== 0 && <p className="text-[11px] text-slate-500">Ngân sách mới: {formatVnd(next)}</p>}
        <FormField label={funded ? 'Lý do (bắt buộc)' : 'Ghi chú (không bắt buộc)'}>
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} className={fieldTextareaClass} />
        </FormField>
        <Button type="submit" className="w-full" disabled={!valid || busy}>
          {funded ? 'Ghi điều chỉnh' : 'Đặt ngân sách'}
        </Button>
      </form>
    </Panel>
  );
}
