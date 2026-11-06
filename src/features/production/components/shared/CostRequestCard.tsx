'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { costRequestService } from '@/services/costRequestService';
import type { CostRequest } from '@/types/cost';
import { useAction } from '../../hooks/useAction';
import { COST_REQUEST_STATUS } from '../../lib/labels';
import { downloadFile } from '../../lib/download';
import { formatDateTime, formatVnd } from '../../lib/format';
import { StatusPill, TextPromptModal } from './ui';

/** Whole thousands of VND typed in a field; NaN when it is not one. */
export function parseVnd(text: string): number {
  const value = Number(text.replace(/[.\s,]/g, ''));
  return Number.isInteger(value) && value % 1000 === 0 ? value : Number.NaN;
}

/** One "yêu cầu thêm chi phí sản xuất": what the studio quoted, what was asked and why, and the Admin's answer. */
export function CostRequestCard({
  request: cr,
  canDecide = false,
  projectHref,
  onDecided,
}: {
  request: CostRequest;
  /** The Admin may grant (in full or in part) or refuse an open request. */
  canDecide?: boolean;
  /** Link to the project, shown in the Admin's inbox where requests of many projects meet. */
  projectHref?: string;
  onDecided?: () => Promise<unknown>;
}) {
  const [granted, setGranted] = useState(String(cr.requestedVnd));
  const [note, setNote] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const { busy, run } = useAction();
  const grantedVnd = parseVnd(granted);
  const grantValid = grantedVnd > 0 && grantedVnd <= Number(cr.requestedVnd);

  const approve = async () => {
    const done = await run(
      () => costRequestService.approve(cr.id, { grantedVnd, ...(note.trim() ? { response: note.trim() } : {}) }),
      'Đã cấp thêm chi phí',
    );
    if (done) await onDecided?.();
  };
  const reject = async (response: string) => {
    if (await run(() => costRequestService.reject(cr.id, response), 'Đã từ chối yêu cầu')) {
      setRejecting(false);
      await onDecided?.();
    }
  };
  const proof = () => downloadFile(() => costRequestService.downloadProof(cr.id), cr.attachmentName ?? 'bao-gia');

  return (
    <li className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3.5 text-xs space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-slate-500 dark:text-slate-400">
          {cr.requestedBy.fullName} · {formatDateTime(cr.createdAt)}
          {cr.handoff && ` · Studio ${cr.handoff.studio.name}`}
        </p>
        <StatusPill {...COST_REQUEST_STATUS[cr.status]} />
      </div>
      {projectHref && (
        <Link href={projectHref} className="font-semibold text-sky-700 dark:text-sky-300 hover:underline">
          {cr.project.movie.title}
        </Link>
      )}
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div>
          <dt className="text-slate-500">Xin thêm</dt>
          <dd className="font-semibold text-amber-700 dark:text-amber-300">{formatVnd(cr.requestedVnd)}</dd>
        </div>
        {cr.studioQuoteVnd !== null && (
          <div>
            <dt className="text-slate-500">Studio báo giá</dt>
            <dd className="font-semibold text-slate-800 dark:text-slate-100">{formatVnd(cr.studioQuoteVnd)}</dd>
          </div>
        )}
        {cr.handoff && (
          <div>
            <dt className="text-slate-500">Phí đã đề xuất</dt>
            <dd className="font-semibold text-slate-800 dark:text-slate-100">{formatVnd(cr.handoff.offeredFeeVnd)}</dd>
          </div>
        )}
      </dl>
      <p className="text-slate-700 dark:text-slate-200 whitespace-pre-line">{cr.reason}</p>
      {cr.attachmentName && (
        <button type="button" onClick={proof} className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-300 hover:underline cursor-pointer">
          <Download className="w-3.5 h-3.5" aria-hidden="true" /> {cr.attachmentName}
        </button>
      )}
      {cr.status !== 'OPEN' && (
        <p className="text-slate-600 dark:text-slate-300">
          {cr.status === 'APPROVED' ? `Đã cấp ${formatVnd(cr.grantedVnd)}` : 'Từ chối'}
          {cr.resolvedBy && ` · ${cr.resolvedBy.fullName}`}
          {cr.adminResponse && `: ${cr.adminResponse}`}
        </p>
      )}
      {canDecide && cr.status === 'OPEN' && (
        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-2 items-end pt-1">
          <FormField label="Số tiền cấp (₫)">
            <input inputMode="numeric" value={granted} onChange={(e) => setGranted(e.target.value)} className={fieldInputClass} aria-label="Số tiền cấp" />
          </FormField>
          <FormField label="Ghi chú cho Reviewer (không bắt buộc)">
            <textarea rows={1} value={note} onChange={(e) => setNote(e.target.value)} maxLength={5000} className={fieldTextareaClass} />
          </FormField>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={approve} disabled={busy || !grantValid}>
              Cấp
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setRejecting(true)} disabled={busy}>
              Từ chối
            </Button>
          </div>
          {!grantValid && <p className="text-[11px] text-rose-600 sm:col-span-3">Số tiền là bội số 1.000 ₫, lớn hơn 0 và không vượt số xin.</p>}
        </div>
      )}
      <TextPromptModal
        open={rejecting}
        title="Từ chối yêu cầu thêm chi phí"
        subtitle={cr.project.movie.title}
        label="Lý do (Reviewer sẽ nhận được)"
        confirmLabel="Từ chối"
        minLength={2}
        danger
        busy={busy}
        onConfirm={reject}
        onClose={() => setRejecting(false)}
      />
    </li>
  );
}
