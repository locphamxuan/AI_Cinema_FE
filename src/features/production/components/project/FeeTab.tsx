'use client';

import { useState } from 'react';
import { Coins, TrendingUp, Calculator, BarChart3 } from 'lucide-react';
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
import { Empty, ErrorNote, Loading } from '../shared/ui';
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

  const totalEpisodes = project.seasons.flatMap((s) => s.episodes).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Main: ledger */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="w-7 h-7 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Sổ phí sản xuất</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Mỗi lần cấp hoặc điều chỉnh là một dòng mới; không sửa, không xoá.</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {ledger.error && <ErrorNote message={ledger.error} onRetry={ledger.reload} />}
            {ledger.loading && !ledger.data && <Loading />}

            {ledger.data && (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/5 border border-purple-100 dark:border-purple-500/20 p-3.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Coins className="w-3 h-3 text-purple-500" />
                      <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wider">Tổng ngân sách</p>
                    </div>
                    <p className="text-lg font-black text-purple-700 dark:text-purple-300 font-mono leading-none">
                      {formatNumber(ledger.data.totalTokens)}
                    </p>
                    <p className="text-[10px] text-purple-400 mt-0.5">Token</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/8 p-3.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3 h-3 text-slate-400" />
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quy đổi VND</p>
                    </div>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono leading-none">
                      {formatNumber(ledger.data.totalVnd)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">₫</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/8 p-3.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calculator className="w-3 h-3 text-slate-400" />
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">TB / Mùa</p>
                    </div>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono leading-none">
                      {project.seasons.length > 0 ? formatNumber(Math.round(ledger.data.totalTokens / project.seasons.length)) : 0}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Token</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-500/10 dark:to-cyan-500/5 border border-teal-100 dark:border-teal-500/20 p-3.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Coins className="w-3 h-3 text-teal-500" />
                      <p className="text-[10px] font-semibold text-teal-500 uppercase tracking-wider">ĐG / Tập</p>
                    </div>
                    <p className="text-lg font-black text-teal-700 dark:text-teal-300 font-mono leading-none">
                      {totalEpisodes > 0 ? formatNumber(Math.round(ledger.data.totalTokens / totalEpisodes)) : 0}
                    </p>
                    <p className="text-[10px] text-teal-400 mt-0.5">Token</p>
                  </div>
                </div>

                {/* Ledger table */}
                {ledger.data.entries.length === 0 ? (
                  <Empty>Chưa cấp phí. Cần cấp phí trước khi giao Content Creator (BR-12).</Empty>
                ) : (
                  <div className="rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="text-[11px] text-slate-500 dark:text-slate-400 text-left bg-slate-50/60 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold">Loại</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Token</th>
                          <th className="px-4 py-2.5 font-semibold text-right hidden sm:table-cell">Tỷ giá</th>
                          <th className="px-4 py-2.5 font-semibold">Lý do</th>
                          <th className="px-4 py-2.5 font-semibold hidden md:table-cell">Người ghi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                        {ledger.data.entries.map((e) => (
                          <tr key={e.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-200 font-medium">{FEE_ENTRY[e.entryType]}</td>
                            <td className={`px-4 py-3 text-right font-black font-mono text-base ${e.amountTokens < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {e.amountTokens > 0 ? '+' : ''}{formatNumber(e.amountTokens)}
                            </td>
                            <td className="px-4 py-3 text-right hidden sm:table-cell text-slate-400 font-mono">{formatNumber(e.rateVnd)} ₫</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{e.reason ?? <span className="text-slate-400">—</span>}</td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <p className="text-slate-700 dark:text-slate-200 font-medium">{e.createdBy.fullName}</p>
                              <p className="text-[10px] text-slate-400">{formatDateTime(e.createdAt)}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar: fee form */}
      {canWrite && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{initial ? 'Cấp phí lần đầu' : 'Cấp thêm / điều chỉnh'}</h2>
              {rate && <p className="text-[11px] text-slate-400">1 Token = {formatNumber(rate)} ₫</p>}
            </div>
          </div>
          <div className="p-5">
            <form onSubmit={submit} className="space-y-4">
              {!initial && (
                <div role="radiogroup" aria-label="Loại ghi" className="flex gap-3 text-xs">
                  {(['TOP_UP', 'CORRECTION'] as const).map((t) => (
                    <label key={t} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border transition-all ${
                      entryType === t
                        ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-300'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                    }`}>
                      <input type="radio" name="entry-type" checked={entryType === t} onChange={() => setEntryType(t)} className="sr-only" />
                      {FEE_ENTRY[t]}
                    </label>
                  ))}
                </div>
              )}
              <FormField label={type === 'CORRECTION' ? 'Số Token (âm để giảm)' : 'Số Token'}>
                <input type="number" step={1} value={amount} onChange={(e) => setAmount(e.target.value)} required className={fieldInputClass} />
              </FormField>
              {rate && amountValid && (
                <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-white/5 rounded-lg px-3 py-2">
                  ≈ {formatNumber(value * rate)} ₫
                </p>
              )}
              {balance !== undefined && (
                <div className={`text-[11px] rounded-lg px-3 py-2 ${affordable ? 'bg-slate-50 dark:bg-white/5 text-slate-500' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                  Bạn còn {formatNumber(balance)} Token{!affordable && ' — không đủ, hãy xin Admin cấp thêm'}.
                </div>
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
          </div>
        </div>
      )}
    </div>
  );
}
