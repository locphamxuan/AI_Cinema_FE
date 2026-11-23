'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { MetaPager } from '@/components/data/MetaPager';
import { Empty, ErrorNote, Loading, Panel, StatusPill } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { useAction } from '@/hooks/useAction';
import { useCan } from '@/hooks/useCan';
import { useResource } from '@/hooks/useResource';
import { COIN_ENTRY_LABEL } from '@/lib/coinEntry';
import { formatDateTime, formatNumber } from '@/lib/format';
import { PERMISSION } from '@/lib/permissions';
import { financeService } from '@/services/financeService';
import { WalletModal } from '@/features/billing-admin/components/CoinLedgerPanel';
import type { Tone } from '@/features/production/lib/labels';
import type { RiskFlag, RiskFlagStatus } from '@/types/finance';
import type { CoinEntryType } from '@/types/billing';
import { vnd } from './financeFormat';

const STATUS: Record<RiskFlagStatus, { label: string; tone: Tone }> = {
  OPEN: { label: 'Chờ xử lý', tone: 'amber' },
  CONFIRMED: { label: 'Đã xác nhận rủi ro', tone: 'rose' },
  DISMISSED: { label: 'Đã bỏ qua', tone: 'neutral' },
};

type Decision = 'CONFIRMED' | 'DISMISSED';

/** Coin transactions the risk rules flagged: the Admin confirms the risk or dismisses it, with a note. */
export function RiskFlagsTab() {
  const canAdjust = useCan()(PERMISSION.COIN_ADJUST);
  const [status, setStatus] = useState<RiskFlagStatus | ''>('OPEN');
  const [ruleCode, setRuleCode] = useState('');
  const [page, setPage] = useState(1);
  const rules = useResource('finance:risk:rules', financeService.riskRules);
  const flags = useResource(`finance:risk:flags:${status}:${ruleCode}:${page}`, () =>
    financeService.riskFlags(page, 20, status || undefined, ruleCode || undefined),
  );
  const [reviewing, setReviewing] = useState<{ flag: RiskFlag; decision: Decision } | null>(null);
  const [note, setNote] = useState('');
  const [walletOf, setWalletOf] = useState<string | null>(null);
  const { busy, run } = useAction();

  const scan = async () => {
    const res = await run(() => financeService.scan());
    if (res) {
      toast.success(`Thêm ${res.created} giao dịch nghi vấn mới`);
      await flags.reload();
    }
  };

  const review = async () => {
    if (!reviewing) return;
    const { flag, decision } = reviewing;
    await run(() => financeService.review(flag.id, decision, note), decision === 'CONFIRMED' ? 'Đã xác nhận rủi ro' : 'Đã bỏ dấu nghi vấn');
    setReviewing(null);
    setNote('');
    // A flag another Admin handled first answers 409 (shown as a toast): the list is reloaded either way.
    await flags.reload();
  };

  const ruleText = (code: string) => rules.data?.find((r) => r.code === code)?.description ?? code;

  return (
    <Panel
      title="Giao dịch rủi ro"
      description="Giao dịch Coin bị các quy tắc rủi ro đánh dấu nghi vấn. Xác nhận khi cần theo dõi tiếp, bỏ qua khi là giao dịch bình thường."
      actions={
        <>
          <select
            aria-label="Lọc theo trạng thái"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as RiskFlagStatus | '');
              setPage(1);
            }}
            className={`${fieldInputClass} w-40 py-1.5 text-xs`}
          >
            <option value="">Mọi trạng thái</option>
            {(Object.keys(STATUS) as RiskFlagStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS[s].label}
              </option>
            ))}
          </select>
          <select
            aria-label="Lọc theo quy tắc"
            value={ruleCode}
            onChange={(e) => {
              setRuleCode(e.target.value);
              setPage(1);
            }}
            className={`${fieldInputClass} w-48 py-1.5 text-xs`}
          >
            <option value="">Mọi quy tắc</option>
            {rules.data?.map((r) => (
              <option key={r.code} value={r.code} title={r.description}>
                {r.description}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={() => void scan()} disabled={busy}>
            Kiểm tra ngay
          </Button>
        </>
      }
    >
      {flags.error && <ErrorNote message={flags.error} onRetry={flags.reload} />}
      {flags.loading && !flags.data && <Loading />}
      {flags.data?.data.length === 0 && <Empty>Không có giao dịch nghi vấn nào theo bộ lọc này.</Empty>}
      {flags.data && flags.data.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-medium">Thời điểm</th>
                <th className="py-2 pr-3 font-medium">Member</th>
                <th className="py-2 pr-3 font-medium">Giao dịch</th>
                <th className="py-2 pr-3 text-right font-medium">Coin chính / thưởng</th>
                <th className="py-2 pr-3 text-right font-medium">Giá trị Coin chính</th>
                <th className="py-2 pr-3 font-medium">Quy tắc và lý do</th>
                <th className="py-2 pr-3 font-medium">Trạng thái</th>
                <th className="py-2 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border align-top">
              {flags.data.data.map((f) => {
                const tx = f.coinTransaction;
                const member = tx.wallet.user;
                return (
                  <tr key={f.id}>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{formatDateTime(f.createdAt)}</td>
                    <td className="py-2.5 pr-3">
                      <p className="font-medium">{member.fullName}</p>
                      <p className="text-muted-foreground">{member.email}</p>
                    </td>
                    <td className="py-2.5 pr-3">{COIN_ENTRY_LABEL[tx.entryType as CoinEntryType] ?? tx.entryType}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums whitespace-nowrap">
                      {formatNumber(tx.mainAmount)} / {formatNumber(tx.bonusAmount)}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums whitespace-nowrap">{tx.rateVnd ? vnd(tx.mainAmount * tx.rateVnd) : '—'}</td>
                    <td className="max-w-64 py-2.5 pr-3">
                      <p className="font-medium">{ruleText(f.ruleCode)}</p>
                      <p className="text-muted-foreground">{f.reason}</p>
                      {f.reviewNote && <p className="mt-1 text-muted-foreground">Ghi chú: {f.reviewNote}</p>}
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusPill {...STATUS[f.status]} />
                      {f.reviewedBy && <p className="mt-1 text-muted-foreground">{f.reviewedBy.fullName}</p>}
                    </td>
                    <td className="py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="ghost" aria-label={`Mở ví của ${member.fullName}`} onClick={() => setWalletOf(member.id)}>
                          <Wallet className="size-3.5" aria-hidden="true" />
                        </Button>
                        {f.status === 'OPEN' && (
                          <>
                            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setReviewing({ flag: f, decision: 'DISMISSED' })}>
                              Bỏ qua
                            </Button>
                            <Button size="sm" variant="danger" disabled={busy} onClick={() => setReviewing({ flag: f, decision: 'CONFIRMED' })}>
                              Xác nhận rủi ro
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {flags.data && <MetaPager meta={flags.data.meta} onPage={setPage} />}

      <ConfirmModal
        open={!!reviewing}
        title={reviewing?.decision === 'CONFIRMED' ? 'Xác nhận giao dịch rủi ro?' : 'Bỏ dấu nghi vấn này?'}
        description={reviewing ? `${reviewing.flag.coinTransaction.wallet.user.fullName}: ${reviewing.flag.reason}` : ''}
        confirmLabel={reviewing?.decision === 'CONFIRMED' ? 'Xác nhận rủi ro' : 'Bỏ qua'}
        danger={reviewing?.decision === 'CONFIRMED'}
        busy={busy}
        onClose={() => {
          setReviewing(null);
          setNote('');
        }}
        onConfirm={() => void review()}
      >
        <FormField label="Ghi chú (tuỳ chọn)">
          <textarea rows={3} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} className={fieldTextareaClass} />
        </FormField>
      </ConfirmModal>

      {walletOf && <WalletModal userId={walletOf} canAdjust={canAdjust} onClose={() => setWalletOf(null)} onAdjusted={flags.reload} />}
    </Panel>
  );
}
