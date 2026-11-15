'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { productionService } from '@/services/productionService';
import type { Episode } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { formatDateTime } from '@/lib/format';
import { Panel, TextPromptModal } from '@/components/data/ui';

/** Where the episode stands on the way to the Final Film, in words. */
function stateOf(episode: Episode): string {
  if (episode.status !== 'COMPLIANCE_PASSED') {
    return 'Phim Final được xác nhận sau khi Reviewer duyệt bản Studio nộp, gắn nhãn AI và đạt 4 mục kiểm tra tuân thủ.';
  }
  if (episode.finalConfirmedAt) return `Reviewer đã xác nhận Phim Final lúc ${formatDateTime(episode.finalConfirmedAt)}; chờ Admin đặt giá & publish.`;
  return 'Đã đạt kiểm tra tuân thủ; Reviewer xác nhận Phim Final để chuyển sang Admin.';
}

/**
 * MF-1 §5–6: the Reviewer in charge confirms the checked, labeled and priced version as the Final Film, and the
 * Admin is told. The Admin publishes it (Publish panel) or sends it back through the Reviewer with a reason; the
 * Reviewer then asks the studio for changes on the review sheet, which clears the confirmation.
 */
export function FinalFilmPanel({
  episode,
  canConfirm,
  canSendBack,
  onChanged,
}: {
  episode: Episode;
  /** The Reviewer in charge while the studio works. */
  canConfirm: boolean;
  /** The Admin (episode:publish). */
  canSendBack: boolean;
  onChanged: () => Promise<void>;
}) {
  const [sendingBack, setSendingBack] = useState(false);
  const { busy, run } = useAction();
  const checked = episode.status === 'COMPLIANCE_PASSED';
  const confirmable = canConfirm && checked && !episode.finalConfirmedAt;
  const returnable = canSendBack && checked && !!episode.finalConfirmedAt;

  const confirm = async () => {
    if (await run(() => productionService.confirmFinalFilm(episode.id), 'Đã xác nhận Phim Final, Admin được báo')) await onChanged();
  };
  const sendBack = async (reason: string) => {
    if (await run(() => productionService.rejectFinalFilm(episode.id, reason), 'Đã trả Phim Final lại cho Reviewer')) {
      setSendingBack(false);
      await onChanged();
    }
  };

  return (
    <Panel title="Phim Final" description={stateOf(episode)}>
      <div className="space-y-3 text-xs">
        {episode.finalRejectionNote && !episode.finalConfirmedAt && (
          <p role="note" className="rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-2.5 text-rose-700 dark:text-rose-300">
            <span className="font-semibold">Admin trả lại Phim Final:</span> {episode.finalRejectionNote}
            {canConfirm && ' - yêu cầu Studio sửa ở phiếu duyệt (Yêu cầu sửa), rồi xác nhận lại bản mới.'}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {confirmable && (
            <Button size="sm" variant="success" disabled={busy} onClick={confirm}>
              Xác nhận Phim Final
            </Button>
          )}
          {returnable && (
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setSendingBack(true)}>
              Trả lại qua Reviewer
            </Button>
          )}
        </div>
      </div>
      <TextPromptModal
        open={sendingBack}
        title="Trả Phim Final lại qua Reviewer"
        subtitle={`Tập ${episode.episodeNumber}: ${episode.title}`}
        label="Lý do (Reviewer sẽ trao đổi với Studio để sửa)"
        confirmLabel="Trả lại"
        danger
        busy={busy}
        onClose={() => setSendingBack(false)}
        onConfirm={sendBack}
      />
    </Panel>
  );
}
