'use client';

import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { StudioHandoff } from '@/types/production';
import { formatDateTime, formatNumber } from '../../lib/format';

const EMAIL_STATUS = {
  QUEUED: { label: 'Đang gửi', tone: 'amber' },
  SENT: { label: 'Đã gửi email', tone: 'emerald' },
  FAILED: { label: 'Gửi email lỗi', tone: 'rose' },
} as const;

/** The studio's answer through its portal link, or why there is none. */
function ResponseBadge({ handoff, current }: { handoff: StudioHandoff; current: boolean }) {
  if (handoff.studioResponse === 'ACCEPTED') return <Badge tone="emerald">Studio đã nhận</Badge>;
  if (handoff.studioResponse === 'DECLINED') return <Badge tone="rose">Studio từ chối</Badge>;
  if (!current) return null;
  return handoff.portalActive ? <Badge tone="amber">Chờ studio trả lời</Badge> : <Badge tone="neutral">Chưa có link cổng studio</Badge>;
}

/** One hand-off (or studio change) in the history: studio, email, brief and the studio's answer. */
export function HandoffCard({ handoff: h, current, onDownload }: { handoff: StudioHandoff; current: boolean; onDownload: () => void }) {
  return (
    <li className="rounded-xl border border-slate-200 dark:border-white/10 p-3 text-xs space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-slate-900 dark:text-white">
          {h.studioName} {current && <Badge tone="purple">Hiện tại</Badge>}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <ResponseBadge handoff={h} current={current} />
          {h.emailMessage && <Badge tone={EMAIL_STATUS[h.emailMessage.status].tone}>{EMAIL_STATUS[h.emailMessage.status].label}</Badge>}
          {h.briefFileKey && (
            <Button size="sm" variant="ghost" onClick={onDownload}>
              <Download className="w-3.5 h-3.5" aria-hidden="true" /> Brief
            </Button>
          )}
        </div>
      </div>
      <p className="text-slate-500 dark:text-slate-400">
        {h.studioEmail}
        {h.studioContact && ` · ${h.studioContact}`} · Phí in trong brief: {formatNumber(h.productionFeeTokens)} Token
      </p>
      {h.changeReason && <p className="text-slate-600 dark:text-slate-300">Lý do đổi: {h.changeReason}</p>}
      {h.studioResponse === 'DECLINED' && (
        <p className="text-rose-600">
          Lý do studio từ chối ({formatDateTime(h.respondedAt)}): {h.declineReason}
        </p>
      )}
      {h.studioResponse === 'ACCEPTED' && <p className="text-emerald-600">Studio nhận dự án lúc {formatDateTime(h.respondedAt)}</p>}
      {h.emailMessage?.errorMessage && <p className="text-rose-600">{h.emailMessage.errorMessage}</p>}
      <p className="text-slate-400">
        {h.createdBy.fullName} · {formatDateTime(h.createdAt)}
      </p>
    </li>
  );
}
