'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { Empty, ErrorNote, Loading, StatusPill, TextPromptModal } from '@/features/production/components/shared/ui';
import { Pager } from '@/features/production/components/shared/Pager';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { formatDateTime, formatNumber } from '@/features/production/lib/format';
import { announceTokensChanged } from '@/services/reviewerTokenService';
import { tokenRequestService } from '@/services/tokenRequestService';
import type { TokenRequest, TokenRequestStatus } from '@/types/token-request';

export const TOKEN_REQUEST_STATUS: Record<TokenRequestStatus, { label: string; tone: 'amber' | 'emerald' | 'rose' }> = {
  OPEN: { label: 'Chờ Reviewer', tone: 'amber' },
  APPROVED: { label: 'Đã cấp', tone: 'emerald' },
  REJECTED: { label: 'Từ chối', tone: 'rose' },
};

const FILTERS: { key: TokenRequestStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'OPEN', label: 'Đang chờ' },
  { key: 'APPROVED', label: 'Đã cấp' },
  { key: 'REJECTED', label: 'Từ chối' },
];

/**
 * Creator requests for more Token, newest first, by status. `canAnswer` lets the Reviewer grant or refuse;
 * `movieId` narrows to one project; `projectHref` links each row to its project.
 */
export function TokenRequestList({
  canAnswer = false,
  movieId,
  projectHref,
  refreshKey = 0,
}: {
  canAnswer?: boolean;
  movieId?: string;
  projectHref?: (movieId: string) => string;
  refreshKey?: number;
}) {
  const [status, setStatus] = useState<TokenRequestStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [approving, setApproving] = useState<TokenRequest | null>(null);
  const [rejecting, setRejecting] = useState<TokenRequest | null>(null);
  const { busy, run } = useAction();
  const filter = status === 'ALL' ? undefined : status;
  const list = useResource(`token-requests:${movieId ?? 'all'}:${status}:${page}:${refreshKey}`, () =>
    movieId ? tokenRequestService.forProject(movieId, page, 10, filter) : tokenRequestService.list(page, 10, filter),
  );

  const rows = list.data?.data ?? [];

  const reject = async (response: string) => {
    if (!rejecting) return;
    if (await run(() => tokenRequestService.reject(rejecting.id, response), 'Đã từ chối yêu cầu')) {
      setRejecting(null);
      await list.reload();
    }
  };

  return (
    <div className="space-y-3">
      <div role="group" aria-label="Trạng thái yêu cầu" className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={status === f.key}
            onClick={() => { setStatus(f.key); setPage(1); }}
            className={`px-2.5 py-1 rounded-full text-xs border cursor-pointer ${
              status === f.key ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {list.error && <ErrorNote message={list.error} onRetry={list.reload} />}
      {list.loading && !list.data && <Loading />}
      {list.data && rows.length === 0 && <Empty>Chưa có yêu cầu thêm Token nào.</Empty>}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="rounded-xl border border-sky-100 dark:border-white/10 p-3 text-xs space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900 dark:text-white">
                {projectHref ? (
                  <Link href={projectHref(r.project.id)} className="text-sky-700 dark:text-sky-500 hover:underline">{r.project.movie.title}</Link>
                ) : (
                  r.project.movie.title
                )}{' '}
                · Mùa {r.season.seasonNumber} · xin <span className="font-mono">{formatNumber(r.requestedTokens)}</span> Token
              </p>
              <StatusPill {...TOKEN_REQUEST_STATUS[r.status]} />
            </div>
            <p className="text-slate-600 dark:text-slate-300">{r.reason}</p>
            <p className="text-[11px] text-slate-400">
              {r.requestedBy.fullName} · {formatDateTime(r.createdAt)}
              {r.resolvedBy && ` · ${r.resolvedBy.fullName} trả lời ${formatDateTime(r.resolvedAt)}`}
            </p>
            {r.status === 'APPROVED' && <p className="text-emerald-600">Đã cấp {formatNumber(r.grantedTokens ?? 0)} Token cho mùa {r.season.seasonNumber}.</p>}
            {r.reviewerResponse && <p className="text-rose-600">Lý do từ chối: {r.reviewerResponse}</p>}
            {canAnswer && r.status === 'OPEN' && (
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={() => setApproving(r)}>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" /> Cấp Token
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setRejecting(r)}>
                  <X className="w-3.5 h-3.5" aria-hidden="true" /> Từ chối
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <Pager page={page} totalPages={list.data?.meta?.totalPages ?? 1} onChange={setPage} />
      {approving && (
        <ApproveModal
          request={approving}
          onClose={() => setApproving(null)}
          onDone={async () => {
            setApproving(null);
            announceTokensChanged();
            await list.reload();
          }}
        />
      )}
      <TextPromptModal
        open={!!rejecting}
        title="Từ chối yêu cầu thêm Token"
        subtitle={rejecting ? `${rejecting.project.movie.title} · Mùa ${rejecting.season.seasonNumber}` : undefined}
        label="Lý do (Creator sẽ nhận được)"
        confirmLabel="Từ chối"
        danger
        busy={busy}
        onClose={() => setRejecting(null)}
        onConfirm={reject}
      />
    </div>
  );
}

function ApproveModal({ request, onClose, onDone }: { request: TokenRequest; onClose: () => void; onDone: () => Promise<void> }) {
  const [amount, setAmount] = useState(String(request.requestedTokens));
  const { busy, run } = useAction();
  const value = Number(amount);
  const valid = Number.isInteger(value) && value >= 1 && value <= request.requestedTokens;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (valid && (await run(() => tokenRequestService.approve(request.id, value), 'Đã cấp thêm Token'))) await onDone();
  };

  return (
    <Modal open onClose={onClose} title="Cấp thêm Token" subtitle={`${request.project.movie.title} · Mùa ${request.season.seasonNumber}`}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Ghi thành khoản “+ Token thêm” của mùa, trừ vào ví Token của bạn. Không cấp quá số Creator xin ({formatNumber(request.requestedTokens)}).
        </p>
        <FormField label="Số Token cấp">
          <input type="number" min={1} max={request.requestedTokens} value={amount} onChange={(e) => setAmount(e.target.value)} className={fieldInputClass} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={!valid || busy}>Cấp Token</Button>
        </div>
      </form>
    </Modal>
  );
}