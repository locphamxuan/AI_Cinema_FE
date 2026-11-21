'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { changeRequestService } from '@/services/teamService';
import type { ChangeRequest } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { CHANGE_REQUEST_STATUS, CHANGE_REQUEST_TYPE } from '../../lib/labels';
import { downloadFile } from '../../lib/download';
import { formatDateTime } from '@/lib/format';
import { StatusPill, TextPromptModal } from '@/components/data/ui';
import { ConfirmModal } from '@/components/data/ConfirmModal';

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
  const [approving, setApproving] = useState(false);
  const { busy, run } = useAction();

  const approve = async () => {
    if (await run(() => changeRequestService.approve(cr.id), 'Đã duyệt đề xuất')) {
      setApproving(false);
      await onDecided?.();
    }
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
        <p className="text-muted-foreground">
          {cr.requestedBy.fullName} · {formatDateTime(cr.createdAt)}
          {cr.season && ` · Mùa ${cr.season.seasonNumber}`}
          {cr.episode && ` · Tập ${cr.episode.episodeNumber}: ${cr.episode.title}`}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-medium text-secondary-foreground">{CHANGE_REQUEST_TYPE[cr.requestType]}</span>
          <StatusPill {...CHANGE_REQUEST_STATUS[cr.status]} />
        </div>
      </div>
      {cr.project && projectHref && (
        <Link href={projectHref} className="font-semibold text-sky-700 dark:text-sky-300 hover:underline">
          {cr.project.movie.title}
        </Link>
      )}
      <div>
        <p className="font-semibold text-secondary-foreground">Nội dung</p>
        <p className="whitespace-pre-line text-foreground">{cr.content}</p>
      </div>
      <div>
        <p className="font-semibold text-secondary-foreground">Lý do</p>
        <p className="whitespace-pre-line text-muted-foreground">{cr.reason}</p>
      </div>
      {cr.attachmentName && (
        <Button size="sm" variant="ghost" onClick={proof}>
          Giấy tờ: {cr.attachmentName}
        </Button>
      )}
      {cr.adminResponse && (
        <p className="rounded-lg bg-muted/60 p-2 text-muted-foreground">
          <span className="font-semibold">{cr.resolvedBy?.fullName ?? 'Admin'}:</span> {cr.adminResponse}
        </p>
      )}
      {canDecide && cr.status === 'OPEN' && (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => setRejecting(true)}>
            Từ chối
          </Button>
          <Button size="sm" variant="success" disabled={busy} onClick={() => setApproving(true)}>
            Duyệt
          </Button>
        </div>
      )}
      <ConfirmModal
        open={approving}
        title="Duyệt đề xuất chỉnh sửa"
        description={`${CHANGE_REQUEST_TYPE[cr.requestType]} của ${cr.requestedBy.fullName}. Người gửi được báo để thực hiện thay đổi.`}
        confirmLabel="Duyệt đề xuất"
        busy={busy}
        onClose={() => setApproving(false)}
        onConfirm={() => void approve()}
      />
      <TextPromptModal
        open={rejecting}
        title="Từ chối đề xuất"
        subtitle={cr.project?.movie.title}
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
