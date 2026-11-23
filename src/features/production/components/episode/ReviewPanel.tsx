'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { productionService } from '@/services/productionService';
import type { ReviewSheet } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { REVIEWED_EPISODE, isIn } from '../../lib/capabilities';
import { AI_PARTS, LABEL_TYPE } from '../../lib/labels';
import { formatDateTime, formatDuration } from '@/lib/format';
import { Facts, Panel, TextPromptModal } from '@/components/data/ui';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { LabelPanel } from './LabelPanel';
import { CompliancePanel } from './CompliancePanel';

/**
 * Steps 8–11 on one delivered version: the review sheet, approve or send back to the studio (BR-16, BR-18),
 * the AI label (BR-40) and the compliance check (BR-42, CompliancePanel). `canAct` is the Reviewer in charge while the studio works.
 */
export function ReviewPanel({ sheet, canAct, onChanged }: { sheet: ReviewSheet; canAct: boolean; onChanged: () => Promise<void> }) {
  const [requesting, setRequesting] = useState(false);
  const [approving, setApproving] = useState(false);
  const { busy, run } = useAction();
  const status = sheet.episode.status;
  const underReview = status === 'IN_REVIEW' && sheet.ingestStatus === 'READY';
  const reviewed = isIn(status, REVIEWED_EPISODE) && sheet.isApprovedVersion;

  const approve = async () => {
    if (await run(() => productionService.review(sheet.id, 'APPROVED'), 'Đã duyệt bản này')) {
      setApproving(false);
      await onChanged();
    }
  };
  const requestChanges = async (comments: string) => {
    if (await run(() => productionService.review(sheet.id, 'CHANGES_REQUESTED', comments), 'Đã gửi yêu cầu sửa cho Studio')) {
      setRequesting(false);
      await onChanged();
    }
  };

  const { durationCheck: d, aiDisclosure: ai } = sheet;

  return (
    <div className="space-y-5">
      <Panel
        title={`Phiếu duyệt - bản ${sheet.version}`}
        actions={
          canAct &&
          (underReview || reviewed) && (
            <>
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => setRequesting(true)}>
                Yêu cầu sửa
              </Button>
              {underReview && (
                <Button size="sm" variant="success" disabled={busy} onClick={() => setApproving(true)}>
                  Duyệt
                </Button>
              )}
            </>
          )
        }
      >
        <Facts
          stacked
          items={[
            [
              'Thời lượng',
              <span key="d" className={d.warning ? 'text-amber-600 font-semibold' : undefined}>
                {d.warning && 'Lệch mục tiêu: '}
                {formatDuration(d.actualSeconds)} / mục tiêu {formatDuration(d.targetSeconds)}
                {d.deviationSeconds !== null && ` (${d.deviationSeconds > 0 ? '+' : ''}${formatDuration(d.deviationSeconds)})`}
              </span>,
            ],
            ['Phần do AI tạo', ai.aiGeneratedParts.map((p) => AI_PARTS.find((x) => x.value === p)?.label ?? p).join(', ')],
            ['Nhãn đề xuất', LABEL_TYPE[sheet.proposedLabelType]],
            ['Không mô phỏng người/sự kiện thật', <Pledged key="likeness" given={ai.noRealPersonLikeness} />],
            ['Không dùng tác phẩm có bản quyền', <Pledged key="copyright" given={ai.noCopyrightedMaterial} />],
          ]}
        />
        {sheet.contentReviews.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-secondary-foreground">Lịch sử duyệt bản này</p>
            {sheet.contentReviews.map((r) => (
              <div key={r.id} className="rounded-lg bg-muted/60 p-2 text-xs">
                <p className={r.decision === 'APPROVED' ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                  {r.decision === 'APPROVED' ? 'Duyệt' : 'Yêu cầu sửa'} · {r.reviewer.fullName} · {formatDateTime(r.createdAt)}
                </p>
                {r.comments && <p className="text-muted-foreground mt-0.5">{r.comments}</p>}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {(sheet.aiContentLabel || (canAct && reviewed)) && <LabelPanel sheet={sheet} canAct={canAct && reviewed} onChanged={onChanged} />}
      {(sheet.complianceChecks.length > 0 || (canAct && sheet.isApprovedVersion && status === 'LABELED')) && (
        <CompliancePanel sheet={sheet} canAct={canAct && sheet.isApprovedVersion && status === 'LABELED'} onChanged={onChanged} />
      )}

      <ConfirmModal
        open={approving}
        title={`Duyệt bản ${sheet.version}`}
        description="Bản này thành bản được duyệt của tập."
        details={[
          ['Phiên bản', `Bản ${sheet.version}`],
          ['Nhãn AI Studio đề xuất', LABEL_TYPE[sheet.proposedLabelType]],
        ]}
        consequence="bước tiếp theo là gắn nhãn AI và kiểm tra tuân thủ pháp lý."
        confirmLabel="Duyệt bản này"
        busy={busy}
        onClose={() => setApproving(false)}
        onConfirm={() => void approve()}
      />
      <TextPromptModal
        open={requesting}
        title="Yêu cầu Studio sửa"
        subtitle="Tài khoản Studio nhận thông báo kèm nhận xét này trên Studio Web và nộp bản mới. Phim bản cuối đã xác nhận (nếu có) sẽ bị huỷ xác nhận."
        label="Nhận xét (ví dụ: phút 03:10 nhân vật bị méo mặt…)"
        confirmLabel="Gửi yêu cầu sửa"
        danger
        busy={busy}
        onClose={() => setRequesting(false)}
        onConfirm={requestChanges}
      />
    </div>
  );
}

/** Whether the studio signed one of its BR-41 pledges in the delivery. */
function Pledged({ given }: { given: boolean }) {
  return given ? <span>Studio đã cam kết</span> : <span className="text-rose-600 font-semibold">Studio chưa cam kết</span>;
}
