'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { seasonLabel } from '@/lib/seasonLabel';
import type { HandoffMaterial, StudioHandoff } from '@/types/production';
import { waitingRound } from '../../lib/capabilities';
import { CONTRACT_STATUS, MATERIAL_KIND, MILESTONE_STATUS } from '../../lib/labels';
import { formatBytes, formatDateTime, formatVnd } from '@/lib/format';
import { productionPaths, type ProductionBase } from '../../lib/routes';
import { StatusPill } from '@/components/data/ui';

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
  canDecide = false,
  onBrief,
  onMaterial,
}: {
  handoff: StudioHandoff;
  movieId: string;
  /** Episodes of the handed-off season: one episode reads as a whole film. */
  episodeCount?: number;
  base: ProductionBase;
  /** The Admin, who signs or counter-proposes the round the new studio signed (contract:manage). */
  canDecide?: boolean;
  onBrief: () => void;
  onMaterial: (material: HandoffMaterial) => void;
}) {
  const status = MILESTONE_STATUS[h.milestoneStatus];
  const waiting = waitingRound(h);
  const signed = h.contracts?.some((c) => c.status === 'SIGNED');
  return (
    <li className="rounded-xl border border-sky-100 dark:border-white/10 p-4 text-xs space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {h.studio.name} <Badge tone="blue">{scopeLabel(h, episodeCount)}</Badge>
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Giao ngày {formatDateTime(h.createdAt)} bởi {h.createdBy.fullName} · {h.studio.email} ·{' '}
            {signed ? 'phí theo hợp đồng đã ký' : 'phí đề xuất trong brief'}: {formatVnd(h.offeredFeeVnd)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill {...status} />
          {h.emailMessage && <Badge tone={EMAIL_STATUS[h.emailMessage.status].tone}>{EMAIL_STATUS[h.emailMessage.status].label}</Badge>}
        </div>
      </div>

      {waiting && (
        <div role="status" className="rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 space-y-1">
          <p className="font-semibold text-amber-800 dark:text-amber-300">Đang chờ Studio mới báo giá và ký hợp đồng</p>
          <p className="text-amber-800/90 dark:text-amber-200/90">
            Vòng {waiting.round}: {CONTRACT_STATUS[waiting.status].label}
            {waiting.costVnd !== null && ` · ${formatVnd(waiting.costVnd)}`}. Studio bắt đầu sản xuất khi hợp đồng đủ chữ ký hai bên.
          </p>
          <Link href={productionPaths.project(base, movieId, 'contract')} className="inline-block font-semibold text-sky-700 dark:text-sky-300 hover:underline">
            {canDecide && waiting.status === 'STUDIO_SIGNED' ? 'Xem báo giá và ký hợp đồng' : 'Xem hợp đồng'}
          </Link>
        </div>
      )}
      {h.changeReason && <p className="text-slate-600 dark:text-slate-300">Lý do đổi Studio: {h.changeReason}</p>}
      {Number(h.forfeitedVnd) > 0 && (
        <p className="text-rose-600">
          Đã đổi sang Studio khác: Studio này giữ lại {formatVnd(h.forfeitedVnd)} (đã chi hoặc đền bù); phần còn lại trả về ngân sách.
        </p>
      )}
      {h.emailMessage?.errorMessage && <p className="text-rose-600">{h.emailMessage.errorMessage}</p>}

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
