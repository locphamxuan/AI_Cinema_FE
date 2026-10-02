'use client';

import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { MediaAsset } from '@/types/production';
import { INGEST_STATUS, LABEL_TYPE, SOURCE_METHOD } from '../../lib/labels';
import { formatBytes, formatDateTime, formatDuration } from '../../lib/format';
import { Empty, StatusPill } from '../shared/ui';

const JOB_LABEL = { DOWNLOAD: 'Tải về', TRANSCODE: 'Chuyển mã', VALIDATE: 'Kiểm tra' } as const;

/** Every version the studio delivered, newest first; picking one opens it in the player and review sheet. */
export function MediaVersions({
  versions,
  selectedId,
  approvedId,
  onSelect,
  onRetry,
  busy,
}: {
  versions: MediaAsset[];
  selectedId: string | null;
  approvedId: string | null;
  onSelect: (id: string) => void;
  /** Present when the viewer may process a failed latest version again. */
  onRetry?: (id: string) => void;
  busy?: boolean;
}) {
  if (versions.length === 0) return <Empty>Studio chưa giao bản nào.</Empty>;

  return (
    <ul className="space-y-2">
      {versions.map((v, i) => {
        const running = v.ingestJobs.find((j) => j.status === 'RUNNING' || j.status === 'QUEUED');
        const selected = v.id === selectedId;
        return (
          <li key={v.id}>
            <div
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              onClick={() => onSelect(v.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(v.id);
                }
              }}
              className={`rounded-xl border p-3 text-xs space-y-1.5 cursor-pointer transition ${
                selected
                  ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-500/10'
                  : 'border-slate-200 dark:border-white/10 hover:border-purple-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Bản {v.version}
                  {v.id === approvedId && <span className="ml-2 text-emerald-600">✓ bản được duyệt</span>}
                </p>
                <StatusPill {...INGEST_STATUS[v.ingestStatus]} />
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                {SOURCE_METHOD[v.sourceMethod]} · {formatDuration(v.durationSeconds)} · {formatBytes(v.fileSizeBytes)}
                {v.qualities.length > 0 && ` · ${v.qualities.join('/')}`} · Nhãn đề xuất: {LABEL_TYPE[v.proposedLabelType]}
              </p>
              {running && (
                <p className="text-blue-600 dark:text-blue-400">
                  {JOB_LABEL[running.jobType]}
                  {running.progressPercent !== null && ` ${running.progressPercent}%`}…
                </p>
              )}
              {v.failureReason && <p className="text-rose-600">{v.failureReason}</p>}
              {v.submissionNote && <p className="text-slate-600 dark:text-slate-300">Ghi chú: {v.submissionNote}</p>}
              <div className="flex items-center justify-between gap-2">
                <p className="text-slate-400">
                  {v.studioHandoff ? `Studio ${v.studioHandoff.studioName}` : `${v.submittedBy?.fullName ?? '—'} (giao thay studio)`} ·{' '}
                  {formatDateTime(v.createdAt)}
                </p>
                {onRetry && i === 0 && v.ingestStatus === 'FAILED' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetry(v.id);
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Xử lý lại
                  </Button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
