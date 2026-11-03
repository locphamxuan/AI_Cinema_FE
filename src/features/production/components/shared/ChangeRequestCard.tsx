'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { changeRequestService } from '@/services/teamService';
import type { ChangeRequest } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { CHANGE_REQUEST_STATUS, CHANGE_REQUEST_TYPE } from '../../lib/labels';
import { downloadFile } from '../../lib/download';
import { formatDateTime, formatNumber } from '../../lib/format';
import { StatusPill, TextPromptModal } from './ui';

/** One request to the Admin: what was asked and why, the proof, and the Admin's decision (BR-55). */
export function ChangeRequestCard({
  request: cr,
  canDecide = false,
  projectHref,
  onDecided,
}: {
  request: ChangeRequest;
  /** The Admin may approve or reject an open request. */
  canDecide?: boolean;
  /** Link to the project, shown in the Admin's inbox where requests of many projects meet. */
  projectHref?: string;
  onDecided?: () => Promise<unknown>;
}) {
  const [rejecting, setRejecting] = useState(false);
  const { busy, run } = useAction();

  const approve = async () => {
    if (await run(() => changeRequestService.approve(cr.id), 'Đã duyệt đề xuất')) await onDecided?.();
  };
  const reject = async (response: string) => {
    if (await run(() => changeRequestService.reject(cr.id, response), 'Đã từ chối đề xuất')) {
      setRejecting(false);
      await onDecided?.();
    }
  };
  const proof = async () => {
    await downloadFile(() => changeRequestService.downloadProof(cr.id), cr.attachmentName ?? 'giay-to');
  };

  return (
    <li className="rounded-xl border border-sky-100 dark:border-white/10 p-3 text-xs space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-slate-500 dark:text-slate-400">
          {cr.requestedBy.fullName} · {formatDateTime(cr.createdAt)}
          {cr.season && ` · Mùa ${cr.season.seasonNumber}`}
          {cr.episode && ` · Tập ${cr.episode.episodeNumber}: ${cr.episode.title}`}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700 dark:text-slate-200">{CHANGE_REQUEST_TYPE[cr.requestType]}</span>
          <StatusPill {...CHANGE_REQUEST_STATUS[cr.status]} />
        </div>
      </div>
      {cr.movie && projectHref && (
        <Link href={projectHref} className="font-semibold text-sky-700 dark:text-sky-300 hover:underline">
          {cr.movie.title}
        </Link>
      )}
      <div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">Nội dung</p>
        <p className="whitespace-pre-line text-slate-800 dark:text-slate-200">{cr.content}</p>
      </div>
      <div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">Lý do</p>
        <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{cr.reason}</p>
      </div>
      {cr.requestedTokens !== null && <p className="font-semibold text-amber-700 dark:text-amber-300">Xin thêm {formatNumber(Number(cr.requestedTokens))} Token</p>}
      {cr.attachmentName && (
        <Button size="sm" variant="ghost" onClick={proof}>
          <Download className="w-3.5 h-3.5" aria-hidden="true" /> Giấy tờ: {cr.attachmentName}
        </Button>
      )}
      {cr.adminResponse && (
        <p className="rounded-lg bg-slate-50 dark:bg-white/5 p-2 text-slate-600 dark:text-slate-300">
          <span className="font-semibold">{cr.resolvedBy?.fullName ?? 'Admin'}:</span> {cr.adminResponse}
        </p>
      )}
      {canDecide && cr.status === 'OPEN' && (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => setRejecting(true)}>
            <X className="w-3.5 h-3.5" aria-hidden="true" /> Từ chối
          </Button>
          <Button size="sm" variant="success" disabled={busy} onClick={approve}>
            <Check className="w-3.5 h-3.5" aria-hidden="true" /> Duyệt
          </Button>
        </div>
      )}
      <TextPromptModal
        open={rejecting}
        title="Từ chối đề xuất"
        subtitle={cr.movie?.title}
        label="Lý do (người đề xuất sẽ nhận được)"
        confirmLabel="Từ chối"
        minLength={1}
        danger
        busy={busy}
        onClose={() => setRejecting(false)}
        onConfirm={reject}
      />
    </li>
  );
}
