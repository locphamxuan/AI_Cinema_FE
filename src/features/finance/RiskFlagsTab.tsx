'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MetaPager } from '@/components/data/MetaPager';
import { Empty, ErrorNote, Loading, Panel, StatusPill } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { COIN_ENTRY_LABEL } from '@/lib/coinEntry';
import { formatDateTime, formatNumber } from '@/lib/format';
import { financeService } from '@/services/financeService';
import { WalletModal } from '@/features/billing-admin/components/WalletModal';
import type { Tone } from '@/features/production/lib/labels';
import type { RiskDecision, RiskFlag, RiskFlagStatus, RiskScanResult } from '@/types/finance';
import type { CoinEntryType } from '@/types/billing';
import { RiskFlagActionModal } from './RiskFlagActionModal';
import { vnd } from './financeFormat';

const STATUS: Record<RiskFlagStatus, { label: string; tone: Tone }> = {
  OPEN: { label: 'Chờ xử lý', tone: 'amber' },
  ACCOUNT_LOCKED: { label: 'Đã khoá tài khoản', tone: 'rose' },
  DISMISSED: { label: 'Đã bỏ qua', tone: 'neutral' },
  CONFIRMED: { label: 'Đã xác nhận rủi ro', tone: 'rose' },
};

/** Rules no longer run, still named on the flags they raised. */
const RETIRED_RULES: Record<string, string> = { LARGE_ADJUSTMENT: 'Điều chỉnh Coin bằng tay (quy tắc đã bỏ)' };

const ACCOUNTS_PAGE = '/admin/permissions?tab=accounts';

/** What the scan toast says: how many new risky transactions, and by which rule. */
export function scanSummary(result: RiskScanResult): { title: string; description?: string } {
  if (result.created === 0) return { title: 'Không có giao dịch rủi ro mới' };
  return {
    title: `Tìm thấy ${result.created} giao dịch rủi ro mới`,
    description: result.rules.map((r) => `${r.description}: ${r.created}`).join('. '),
  };
}

/** Coin transactions the risk rules flagged: the Admin locks the member account to stop it, or dismisses the flag. */
export function RiskFlagsTab() {
  const [status, setStatus] = useState<RiskFlagStatus | ''>('OPEN');
  const [ruleCode, setRuleCode] = useState('');
  const [page, setPage] = useState(1);
  const rules = useResource('finance:risk:rules', financeService.riskRules);
  const flags = useResource(`finance:risk:flags:${status}:${ruleCode}:${page}`, () =>
    financeService.riskFlags(page, 20, status || undefined, ruleCode || undefined),
  );
  const [acting, setActing] = useState<{ flag: RiskFlag; decision: RiskDecision } | null>(null);
  const [walletOf, setWalletOf] = useState<RiskFlag['coinTransaction']['wallet']['user'] | null>(null);
  const { busy, run } = useAction();

  const scan = async () => {
    const res = await run(() => financeService.scan());
    if (!res) return;
    const { title, description } = scanSummary(res);
    if (res.created > 0) toast.warning(title, description);
    else toast.success(title);
    await flags.reload();
  };

  const act = async (note: string) => {
    if (!acting) return;
    const { flag, decision } = acting;
    const locking = decision === 'ACCOUNT_LOCKED';
    await run(
      () => financeService.review(flag.id, decision, note),
      locking ? `Đã khoá tài khoản ${flag.coinTransaction.wallet.user.fullName}` : 'Đã bỏ qua giao dịch',
    );
    setActing(null);
    // A flag another Admin handled first answers 409 (shown as a toast): the list is reloaded either way.
    await flags.reload();
  };

  const ruleText = (code: string) => rules.data?.find((r) => r.code === code)?.description ?? RETIRED_RULES[code] ?? code;

  return (
    <Panel
      title="Giao dịch rủi ro"
      description="Giao dịch Coin bất thường do hệ thống tự phát hiện (quét mỗi giờ). Khoá tài khoản để chặn, hoặc bỏ qua nếu bình thường."
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
      {flags.data?.data.length === 0 && <Empty>Không có giao dịch rủi ro nào theo bộ lọc này.</Empty>}
      {flags.data && flags.data.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-medium">Thời điểm</th>
                <th className="py-2 pr-3 font-medium">Tài khoản</th>
                <th className="py-2 pr-3 font-medium">Giao dịch</th>
                <th className="py-2 pr-3 text-right font-medium">Coin chính / thưởng</th>
                <th className="py-2 pr-3 text-right font-medium">Giá trị</th>
                <th className="py-2 pr-3 font-medium">Lý do</th>
                <th className="py-2 pr-3 font-medium">Trạng thái</th>
                <th className="py-2 text-right font-medium">
                  <span className="sr-only">Thao tác</span>
                </th>
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
                      {!member.isActive && <p className="mt-0.5 font-medium text-destructive">Đang bị khoá</p>}
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
                      {f.reviewedBy && (
                        <p className="mt-1 text-muted-foreground">
                          {f.reviewedBy.fullName}
                          {f.reviewedAt && ` · ${formatDateTime(f.reviewedAt)}`}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button size="sm" variant="ghost" aria-label={`Xem ví của ${member.fullName}`} onClick={() => setWalletOf(member)}>
                          Xem ví
                        </Button>
                        {f.status === 'OPEN' && (
                          <Button size="sm" variant="secondary" disabled={busy} onClick={() => setActing({ flag: f, decision: 'DISMISSED' })}>
                            Bỏ qua
                          </Button>
                        )}
                        {f.status === 'OPEN' && member.isActive && (
                          <Button size="sm" variant="danger" disabled={busy} onClick={() => setActing({ flag: f, decision: 'ACCOUNT_LOCKED' })}>
                            Khoá tài khoản
                          </Button>
                        )}
                        {!member.isActive && (
                          <Link href={ACCOUNTS_PAGE} className="self-center px-2 font-medium text-primary underline-offset-2 hover:underline">
                            Mở khoá ở trang Tài khoản
                          </Link>
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

      {acting && (
        <RiskFlagActionModal flag={acting.flag} decision={acting.decision} busy={busy} onClose={() => setActing(null)} onConfirm={(note) => void act(note)} />
      )}
      {walletOf && <WalletModal userId={walletOf.id} account={walletOf} onClose={() => setWalletOf(null)} />}
    </Panel>
  );
}
