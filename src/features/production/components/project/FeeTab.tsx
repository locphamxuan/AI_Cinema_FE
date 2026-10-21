'use client';

import { useState } from 'react';
import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { episodeCountsBySeason, seasonName } from '@/lib/seasonLabel';
import { productionService } from '@/services/productionService';
import { announceTokensChanged, reviewerTokenService } from '@/services/reviewerTokenService';
import type { SeasonFee } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { OPEN_PROJECT, isIn } from '../../lib/capabilities';
import { FEE_ENTRY } from '../../lib/labels';
import { formatDateTime, formatNumber } from '../../lib/format';
import { Empty, ErrorNote, Loading, Panel } from '../shared/ui';
import { useProject } from './ProjectContext';
import { SeasonFeeTable } from './SeasonFeeTable';

type AdjustType = 'TOP_UP' | 'CORRECTION';

/** Production fee in Token, priced per season: baseline = price × episodes, then "+… Token thêm" and corrections (BR-37, BR-45, BR-46). */
export function FeeTab() {
  const { project, caps, reload } = useProject();
  const ledger = useResource(`fee:${project.id}:${project.updatedAt}`, () => productionService.getFee(project.id));
  const settings = useResource(caps.feeAllocate ? 'settings' : null, productionService.getPlatformSettings);
  const wallet = useResource(caps.feeAllocate ? 'reviewer-tokens:me' : null, reviewerTokenService.mine);
  const balance = wallet.data?.balanceTokens;
  const total = ledger.data?.totalTokens ?? project.productionFeeTokens;
  const open = isIn(project.status, [...OPEN_PROJECT, 'UNDER_REVISION']);
  const canWrite = caps.feeAllocate && open;
  const rate = settings.data?.tokenRateVnd;
  const episodeCounts = episodeCountsBySeason(project.seasons);

  const [entryType, setEntryType] = useState<AdjustType>('TOP_UP');
  const [pickedSeasonId, setSeasonId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const { busy, run } = useAction();
  // Every extra fee belongs to a season: default to the one that is short, else the first.
  const seasonFees = ledger.data?.seasons ?? project.seasonFees;
  const seasonId =
    pickedSeasonId || seasonFees.find((s) => s.missingTokens > 0)?.seasonId || project.seasons[0]?.id || '';
  const value = Number(amount);
  const amountValid = Number.isInteger(value) && value !== 0 && (entryType === 'CORRECTION' ? total + value > 0 : value > 0);
  // A fee is paid from the Reviewer's budget; lowering it gives Token back.
  const affordable = balance === undefined || value <= balance;
  const valid = amountValid && affordable && total > 0 && seasonId !== '' && reason.trim().length > 0;

  const refresh = async () => {
    announceTokensChanged();
    await Promise.all([ledger.reload(), reload(), wallet.reload()]);
  };

  const allocate = async (season: SeasonFee) => {
    if (await run(() => productionService.addFeeEntry(project.id, { entryType: 'INITIAL', seasonId: season.seasonId }), `Đã cấp phí mùa ${season.seasonNumber}`)) {
      await refresh();
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        productionService.addFeeEntry(project.id, {
          entryType,
          amountTokens: value,
          reason: reason.trim(),
          seasonId,
        }),
      'Đã ghi phí sản xuất',
    );
    if (done) {
      setAmount('');
      setReason('');
      await refresh();
    }
  };

  const topUp = (season: SeasonFee) => {
    setEntryType('TOP_UP');
    setSeasonId(season.seasonId);
    const name = seasonName(season.seasonNumber, season.episodeCount).toLowerCase();
    // After a studio change the season may be fully priced yet have nothing left for the new studio (BR-59).
    setAmount(season.missingTokens > 0 ? String(season.missingTokens) : '');
    setReason(season.missingTokens > 0 ? `Bổ sung theo định mức ${name}` : `Ngân sách cho Studio mới của ${name}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Panel title="Phí theo mùa" description="Định mức = đơn giá 1 tập × số tập. Thêm tập hoặc tăng đơn giá thì cấp thêm một khoản “+… Token thêm” gắn với mùa.">
          <SeasonFeeTable seasons={seasonFees} canAllocate={canWrite} busy={busy} onAllocate={allocate} onTopUp={topUp} />
        </Panel>

        <Panel title="Lịch sử biến động" description="Mỗi lần cấp hoặc điều chỉnh là một dòng mới; không sửa, không xoá dòng cũ.">
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
                <Empty>Chưa cấp phí. Cần cấp phí cho mọi mùa trước khi giao Content Creator (BR-12).</Empty>
              ) : (
                <table className="w-full text-xs">
                  <thead className="text-slate-500 dark:text-slate-400 text-left">
                    <tr>
                      <th className="py-2 font-medium">Loại</th>
                      <th className="py-2 font-medium">Mùa</th>
                      <th className="py-2 font-medium text-right">Token</th>
                      <th className="py-2 pl-4 font-medium">Lý do</th>
                      <th className="py-2 font-medium hidden md:table-cell">Người ghi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {ledger.data.entries.map((e) => {
                      const amountTokens = Number(e.amountTokens);
                      return (
                        <tr key={e.id}>
                          <td className="py-2 text-slate-700 dark:text-slate-200">{FEE_ENTRY[e.entryType]}</td>
                          <td className="py-2 text-slate-500">
                            {e.season ? seasonName(e.season.seasonNumber, episodeCounts.get(e.season.id)) : 'Cả dự án'}
                          </td>
                          <td className={`py-2 text-right font-mono ${amountTokens < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {amountTokens > 0 ? '+' : ''}
                            {formatNumber(amountTokens)}
                          </td>
                          <td className="py-2 pl-4 text-slate-600 dark:text-slate-300">{e.reason ?? '-'}</td>
                          <td className="py-2 hidden md:table-cell text-slate-500">
                            {e.createdBy.fullName}
                            <br />
                            <span className="text-[10px]">{formatDateTime(e.createdAt)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}
        </Panel>
      </div>

      {canWrite && total > 0 && (
        <Panel title="Cấp thêm / điều chỉnh" description={rate ? `1 Token = ${formatNumber(rate)} ₫` : undefined}>
          <form onSubmit={submit} className="space-y-3">
            <div role="radiogroup" aria-label="Loại ghi" className="flex gap-3 text-xs">
              {(['TOP_UP', 'CORRECTION'] as const).map((t) => (
                <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="entry-type" checked={entryType === t} onChange={() => setEntryType(t)} />
                  {FEE_ENTRY[t]}
                </label>
              ))}
            </div>
            <FormField label="Mùa">
              <select value={seasonId} onChange={(e) => setSeasonId(e.target.value)} className={fieldInputClass} aria-label="Mùa">
                {project.seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {seasonName(s.seasonNumber, s.episodes.length)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={entryType === 'CORRECTION' ? 'Số Token (âm để giảm)' : 'Số Token'}>
              <input type="number" step={1} value={amount} onChange={(e) => setAmount(e.target.value)} required className={fieldInputClass} />
            </FormField>
            {rate && amountValid && <p className="text-[11px] text-slate-500">≈ {formatNumber(value * rate)} ₫</p>}
            {balance !== undefined && (
              <p className={`text-[11px] ${affordable ? 'text-slate-500' : 'text-rose-600'}`}>
                Bạn còn {formatNumber(balance)} Token{!affordable && ' - không đủ, hãy gửi đề xuất xin thêm kinh phí lên Admin'}.
              </p>
            )}
            {total === 0 && <p className="text-[11px] text-amber-600">Cấp phí theo đơn giá cho ít nhất một mùa trước.</p>}
            <FormField label="Lý do (bắt buộc, BR-46)">
              <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} className={fieldTextareaClass} />
            </FormField>
            <Button type="submit" className="w-full" disabled={!valid || busy}>
              <Coins className="w-4 h-4" aria-hidden="true" /> Ghi phí
            </Button>
          </form>
        </Panel>
      )}
    </div>
  );
}
