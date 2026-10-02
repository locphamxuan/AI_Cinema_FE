'use client';

import { useState } from 'react';
import { History, MinusCircle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { formatNumber } from '@/features/production/lib/format';
import { productionPaths } from '@/features/production/lib/routes';
import { Empty, ErrorNote, Loading, Panel } from '@/features/production/components/shared/ui';
import { TokenHistoryTable, TokenTotalsCards } from '@/features/reviewer-token/components/TokenWalletView';
import { reviewerTokenService } from '@/services/reviewerTokenService';
import type { ReviewerBudgetRow, ReviewerTokenEntryType } from '@/types/reviewer-token';

type Dialog = { reviewer: ReviewerBudgetRow; mode: ReviewerTokenEntryType | 'history' };

/** The Admin grants Token to Reviewers, takes back what is left, and follows how each one spends it. */
export function ReviewerTokensPanel() {
  const reviewers = useResource('admin:reviewer-tokens', reviewerTokenService.listReviewers);
  const [dialog, setDialog] = useState<Dialog | null>(null);

  return (
    <Panel
      title="Token của Reviewer"
      description="Reviewer chỉ cấp phí sản xuất trong số Token bạn đã cấp; bạn nhận thông báo mỗi lần Reviewer cấp Token cho một phim."
    >
      {reviewers.error && <ErrorNote message={reviewers.error} onRetry={reviewers.reload} />}
      {reviewers.loading && !reviewers.data && <Loading />}
      {reviewers.data?.length === 0 && <Empty>Chưa có tài khoản Reviewer nào.</Empty>}
      {reviewers.data && reviewers.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-slate-500 dark:text-slate-400 text-left">
              <tr>
                <th className="py-2 font-medium">Reviewer</th>
                <th className="py-2 font-medium text-right">Đã cấp</th>
                <th className="py-2 font-medium text-right hidden sm:table-cell">Đã dùng</th>
                <th className="py-2 font-medium text-right">Còn lại</th>
                <th className="py-2 w-40" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {reviewers.data.map((r) => (
                <tr key={r.id}>
                  <td className="py-2">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {r.fullName} {!r.isActive && <span className="text-[10px] text-rose-600">(đã khoá)</span>}
                    </p>
                    <p className="text-[11px] text-slate-500">{r.email}</p>
                  </td>
                  <td className="py-2 text-right font-mono">{formatNumber(r.grantedTokens)}</td>
                  <td className="py-2 text-right font-mono hidden sm:table-cell">{formatNumber(r.allocatedTokens)}</td>
                  <td className="py-2 text-right font-mono font-semibold text-purple-700 dark:text-purple-300">{formatNumber(r.balanceTokens)}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" aria-label={`Cấp Token cho ${r.fullName}`} onClick={() => setDialog({ reviewer: r, mode: 'GRANT' })}>
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Thu hồi Token của ${r.fullName}`}
                      disabled={r.balanceTokens <= 0}
                      onClick={() => setDialog({ reviewer: r, mode: 'REVOKE' })}
                    >
                      <MinusCircle className="w-3.5 h-3.5 text-rose-600" />
                    </Button>
                    <Button size="sm" variant="ghost" aria-label={`Lịch sử Token của ${r.fullName}`} onClick={() => setDialog({ reviewer: r, mode: 'history' })}>
                      <History className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialog && dialog.mode !== 'history' && (
        <EntryModal reviewer={dialog.reviewer} entryType={dialog.mode} onClose={() => setDialog(null)} onDone={reviewers.reload} />
      )}
      {dialog?.mode === 'history' && <HistoryModal reviewer={dialog.reviewer} onClose={() => setDialog(null)} />}
    </Panel>
  );
}

function EntryModal({
  reviewer,
  entryType,
  onClose,
  onDone,
}: {
  reviewer: ReviewerBudgetRow;
  entryType: ReviewerTokenEntryType;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const { busy, run } = useAction();
  const revoke = entryType === 'REVOKE';
  const value = Number(amount);
  const valid =
    Number.isInteger(value) && value > 0 && (!revoke || (value <= reviewer.balanceTokens && reason.trim().length > 0));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () => reviewerTokenService.addEntry(reviewer.id, { entryType, amountTokens: value, ...(reason.trim() ? { reason: reason.trim() } : {}) }),
      revoke ? 'Đã thu hồi Token' : 'Đã cấp Token',
    );
    if (done) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={revoke ? 'Thu hồi Token' : 'Cấp Token'} subtitle={`${reviewer.fullName} · còn ${formatNumber(reviewer.balanceTokens)} Token`}>
      <form onSubmit={submit} className="space-y-4">
        <FormField label={revoke ? `Số Token thu hồi (tối đa ${formatNumber(reviewer.balanceTokens)})` : 'Số Token cấp'}>
          <input type="number" min={1} max={revoke ? reviewer.balanceTokens : undefined} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} required className={fieldInputClass} />
        </FormField>
        <FormField label={revoke ? 'Lý do (bắt buộc)' : 'Ghi chú (tuỳ chọn)'}>
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} className={fieldTextareaClass} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" variant={revoke ? 'danger' : 'primary'} disabled={!valid || busy}>
            {revoke ? 'Thu hồi' : 'Cấp Token'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function HistoryModal({ reviewer, onClose }: { reviewer: ReviewerBudgetRow; onClose: () => void }) {
  const wallet = useResource(`admin:reviewer-tokens:${reviewer.id}`, () => reviewerTokenService.walletOf(reviewer.id));
  return (
    <Modal open onClose={onClose} title={`Token của ${reviewer.fullName}`} maxWidth="max-w-3xl">
      {wallet.error && <ErrorNote message={wallet.error} onRetry={wallet.reload} />}
      {wallet.loading && !wallet.data && <Loading />}
      {wallet.data && (
        <div className="space-y-4">
          <TokenTotalsCards totals={wallet.data} rateVnd={wallet.data.tokenRateVnd} />
          <TokenHistoryTable wallet={wallet.data} projectHref={(id) => productionPaths.project('/reviewer', id, 'fee')} />
        </div>
      )}
    </Modal>
  );
}
