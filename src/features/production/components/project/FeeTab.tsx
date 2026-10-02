'use client';

import { useState } from 'react';
import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { productionService } from '@/services/productionService';
import { announceTokensChanged, reviewerTokenService } from '@/services/reviewerTokenService';
import type { TokenEntryType } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { OPEN_PROJECT, isIn } from '../../lib/capabilities';
import { FEE_ENTRY } from '../../lib/labels';
import { formatDateTime, formatNumber } from '../../lib/format';
import { Empty, ErrorNote, Loading, Panel } from '../shared/ui';
import { useProject } from './ProjectContext';

/** Production fee in Token: an append-only ledger, each entry at the rate of its day (BR-45, BR-46, BR-50). */
export function FeeTab() {
  const { project, caps, reload } = useProject();
  const ledger = useResource(`fee:${project.id}`, () => productionService.getFee(project.id));
  const settings = useResource(caps.feeAllocate ? 'settings' : null, productionService.getPlatformSettings);
  const wallet = useResource(caps.feeAllocate ? 'reviewer-tokens:me' : null, reviewerTokenService.mine);
  const balance = wallet.data?.balanceTokens;
  const total = ledger.data?.totalTokens ?? project.productionFeeTokens;
  const initial = total === 0;
  const canWrite =
    caps.feeAllocate && (initial ? project.status === 'DRAFT' : isIn(project.status, [...OPEN_PROJECT, 'UNDER_REVISION']));

  const [entryType, setEntryType] = useState<TokenEntryType>('TOP_UP');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const { busy, run } = useAction();
  const type: TokenEntryType = initial ? 'INITIAL' : entryType;
  const value = Number(amount);
  const amountValid = Number.isInteger(value) && value !== 0 && (type === 'CORRECTION' ? total + value > 0 : value > 0);
  // A fee is paid from the Reviewer's budget; lowering it gives Token back.
  const affordable = balance === undefined || value <= balance;
  const valid = amountValid && affordable && (type === 'INITIAL' || reason.trim().length > 0);
  const rate = settings.data?.tokenRateVnd;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () => productionService.addFeeEntry(project.id, { entryType: type, amountTokens: value, ...(reason.trim() ? { reason: reason.trim() } : {}) }),
      'Đã ghi phí sản xuất',
    );
    if (done) {
      setAmount('');
      setReason('');
      announceTokensChanged();
      await Promise.all([ledger.reload(), reload(), wallet.reload()]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Panel
        className="lg:col-span-2"
        title="Sổ phí sản xuất"
        description="Mỗi lần cấp hoặc điều chỉnh là một dòng mới; không sửa, không xoá dòng cũ."
      >
        {ledger.error && <ErrorNote message={ledger.error} onRetry={ledger.reload} />}
        {ledger.loading && !ledger.data && <Loading />}
        {ledger.data && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-purple-50 dark:bg-purple-500/10 p-3">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Tổng phí</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{formatNumber(ledger.data.totalTokens)} Token</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Quy đổi theo tỷ giá từng lần ghi</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatNumber(ledger.data.totalVnd)} ₫</p>
              </div>
            </div>
            {ledger.data.entries.length === 0 ? (
              <Empty>Chưa cấp phí. Cần cấp phí trước khi giao Content Creator (BR-12).</Empty>
            ) : (
              <table className="w-full text-xs">
                <thead className="text-slate-500 dark:text-slate-400 text-left">
                  <tr>
                    <th className="py-2 font-medium">Loại</th>
                    <th className="py-2 font-medium text-right">Token</th>
                    <th className="py-2 font-medium text-right hidden sm:table-cell">Tỷ giá</th>
                    <th className="py-2 pl-4 font-medium">Lý do</th>
                    <th className="py-2 font-medium hidden md:table-cell">Người ghi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {ledger.data.entries.map((e) => (
                    <tr key={e.id}>
                      <td className="py-2 text-slate-700 dark:text-slate-200">{FEE_ENTRY[e.entryType]}</td>
                      <td className={`py-2 text-right font-mono ${e.amountTokens < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {e.amountTokens > 0 ? '+' : ''}
                        {formatNumber(e.amountTokens)}
                      </td>
                      <td className="py-2 text-right hidden sm:table-cell text-slate-500">{formatNumber(e.rateVnd)} ₫</td>
                      <td className="py-2 pl-4 text-slate-600 dark:text-slate-300">{e.reason ?? '—'}</td>
                      <td className="py-2 hidden md:table-cell text-slate-500">
                        {e.createdBy.fullName}
                        <br />
                        <span className="text-[10px]">{formatDateTime(e.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </Panel>

      {canWrite && (
        <Panel title={initial ? 'Cấp phí lần đầu' : 'Cấp thêm / điều chỉnh'} description={rate ? `1 Token = ${formatNumber(rate)} ₫` : undefined}>
          <form onSubmit={submit} className="space-y-3">
            {!initial && (
              <div role="radiogroup" aria-label="Loại ghi" className="flex gap-3 text-xs">
                {(['TOP_UP', 'CORRECTION'] as const).map((t) => (
                  <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="entry-type" checked={entryType === t} onChange={() => setEntryType(t)} />
                    {FEE_ENTRY[t]}
                  </label>
                ))}
              </div>
            )}
            <FormField label={type === 'CORRECTION' ? 'Số Token (âm để giảm)' : 'Số Token'}>
              <input type="number" step={1} value={amount} onChange={(e) => setAmount(e.target.value)} required className={fieldInputClass} />
            </FormField>
            {rate && amountValid && <p className="text-[11px] text-slate-500">≈ {formatNumber(value * rate)} ₫</p>}
            {balance !== undefined && (
              <p className={`text-[11px] ${affordable ? 'text-slate-500' : 'text-rose-600'}`}>
                Bạn còn {formatNumber(balance)} Token{!affordable && ' — không đủ, hãy xin Admin cấp thêm'}.
              </p>
            )}
            {type !== 'INITIAL' && (
              <FormField label="Lý do (bắt buộc, BR-46)">
                <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} className={fieldTextareaClass} />
              </FormField>
            )}
            <Button type="submit" className="w-full" disabled={!valid || busy}>
              <Coins className="w-4 h-4" aria-hidden="true" /> Ghi phí
            </Button>
          </form>
        </Panel>
      )}
    </div>
  );
}
