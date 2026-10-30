'use client';

import Link from 'next/link';
import { Download, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { seasonLabel } from '@/lib/seasonLabel';
import type { HandoffMaterial, StudioHandoff } from '@/types/production';
import { MATERIAL_KIND, MILESTONE_STATUS } from '../../lib/labels';
import { formatBytes, formatDateTime, formatNumber } from '../../lib/format';
import { canMove } from '../../lib/milestones';
import { productionPaths, type ProductionBase } from '../../lib/routes';
import { StatusPill } from '../shared/ui';

const EMAIL_STATUS = {
  QUEUED: { label: 'Đang gửi', tone: 'amber' },
  SENT: { label: 'Đã gửi email', tone: 'emerald' },
  FAILED: { label: 'Gửi email lỗi', tone: 'rose' },
} as const;

const scopeLabel = (h: Pick<StudioHandoff, 'season'>, episodeCount?: number) =>
  h.season ? seasonLabel(h.season.seasonNumber, episodeCount, h.season.title) : 'Cả dự án';

/** One hand-off (or studio change) on the Studio timeline: who it went to, what was sent, every milestone and Submission. */
export function HandoffCard({
  handoff: h,
  movieId,
  episodeCount,
  base,
  onBrief,
  onMaterial,
  onMilestone,
}: {
  handoff: StudioHandoff;
  movieId: string;
  /** Episodes of the handed-off season: one episode reads as a whole film. */
  episodeCount?: number;
  base: ProductionBase;
  onBrief: () => void;
  onMaterial: (material: HandoffMaterial) => void;
  /** Present when the viewer may move the milestone. */
  onMilestone?: () => void;
}) {
  const status = MILESTONE_STATUS[h.milestoneStatus];
  return (
    <li className="rounded-xl border border-sky-100 dark:border-white/10 p-4 text-xs space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {h.studio.name} <Badge tone="blue">{scopeLabel(h, episodeCount)}</Badge>
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Giao ngày {formatDateTime(h.createdAt)} bởi {h.createdBy.fullName} · {h.studio.email} · ngân sách trong brief:{' '}
            {formatNumber(Number(h.productionFeeTokens))} Token
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill {...status} />
          {h.emailMessage && <Badge tone={EMAIL_STATUS[h.emailMessage.status].tone}>{EMAIL_STATUS[h.emailMessage.status].label}</Badge>}
          {onMilestone && canMove(h) && (
            <Button size="sm" variant="secondary" onClick={onMilestone}>
              Cập nhật mốc
            </Button>
          )}
        </div>
      </div>

      {h.changeReason && <p className="text-slate-600 dark:text-slate-300">Lý do đổi Studio: {h.changeReason}</p>}
      {Number(h.lostTokens) > 0 && (
        <p className="text-rose-600">
          Đã đổi sang Studio khác: {formatNumber(Number(h.lostTokens))} Token đã gửi cho Studio này bị mất, không hoàn.
        </p>
      )}
      {h.emailMessage?.errorMessage && <p className="text-rose-600">{h.emailMessage.errorMessage}</p>}
      {h.filmSentAt && (
        <p className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-2">
          {h.filmSentNote ?? 'Studio đã gửi phim qua email.'} · {formatDateTime(h.filmSentAt)}
          {h.milestoneStatus !== 'DELIVERED' && ' · Chờ Creator nộp bản phim.'}
        </p>
      )}
      {h.filmLinks.length > 0 && (
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Phim Studio đã gửi</p>
          <ul className="space-y-1">
            {h.filmLinks.map((link) => (
              <li key={link.id} className="flex items-center gap-2">
                <Link
                  href={productionPaths.episode(base, movieId, link.episodeId)}
                  className="shrink-0 font-medium text-sky-700 dark:text-sky-300 hover:underline"
                >
                  Tập {link.episode.episodeNumber}
                </Link>
                <span className="flex-1 min-w-0 truncate">
                  {link.fileName} <span className="text-slate-400">· {link.version} · {formatDateTime(link.sentAt)}</span>
                </span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Xem phim tập ${link.episode.episodeNumber}`}
                  className="text-slate-500 hover:text-sky-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Đã giao những gì</p>
        <ul className="space-y-1">
          {h.briefFileKey && (
            <li className="flex items-center gap-2">
              <span className="flex-1">Brief PDF</span>
              <Button size="sm" variant="ghost" onClick={onBrief} aria-label="Tải brief">
                <Download className="w-3.5 h-3.5" />
              </Button>
            </li>
          )}
          {h.materials.map((m) => (
            <li key={m.id} className="flex items-center gap-2">
              <span className="flex-1 min-w-0 truncate">
                {m.fileName} <span className="text-slate-400">· {MATERIAL_KIND[m.kind]} · {formatBytes(Number(m.sizeBytes))}</span>
              </span>
              <Button size="sm" variant="ghost" onClick={() => onMaterial(m)} aria-label={`Tải ${m.fileName}`}>
                <Download className="w-3.5 h-3.5" />
              </Button>
            </li>
          ))}
          {!h.briefFileKey && h.materials.length === 0 && <li className="text-slate-400">Không có tệp.</li>}
        </ul>
      </div>

      <div>
        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Các mốc</p>
        <ol className="space-y-1 border-l border-slate-200 dark:border-white/10 pl-3">
          {h.milestoneEvents.map((event) => (
            <li key={event.id}>
              <span className="font-medium text-slate-800 dark:text-slate-100">{MILESTONE_STATUS[event.toStatus].label}</span>
              <span className="text-slate-400">
                {' '}
                · {formatDateTime(event.createdAt)} · {event.changedBy.fullName}
              </span>
              {event.note && <p className="text-slate-600 dark:text-slate-300">{event.note}</p>}
              {event.mediaAsset && (
                <Link
                  href={productionPaths.episode(base, movieId, event.mediaAsset.episodeId)}
                  className="text-sky-700 dark:text-sky-300 hover:underline"
                >
                  Submission v{event.mediaAsset.version}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </li>
  );
}
