'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/format';
import type { AiAnswerLog } from '@/types/support';
import { handsOff } from './aiLabels';

/** One AI answer: who asked, the question and the answer, the articles it used, and the Admin's rating. */
export function AnswerRow({
  answer: a,
  busy,
  onHelpful,
  onNotHelpful,
  onView,
  onDraft,
}: {
  answer: AiAnswerLog;
  busy: boolean;
  onHelpful: () => void;
  onNotHelpful: () => void;
  onView: () => void;
  onDraft: () => void;
}) {
  return (
    <li className="grid grid-cols-1 gap-3 py-4 lg:grid-cols-[1fr_14rem]">
      <div className="min-w-0 space-y-2 text-sm">
        <p className="text-xs text-muted-foreground">
          {formatDateTime(a.createdAt)} · {a.conversation.member.fullName}
        </p>
        <p className="font-medium">{a.question ?? 'Không còn câu hỏi gốc'}</p>
        <p className="line-clamp-3 whitespace-pre-line text-muted-foreground">{a.answer}</p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {handsOff(a.resolution) && <Badge tone="amber">Đã chuyển cho nhân viên</Badge>}
          {a.sources.length > 0 && <span className="text-muted-foreground">Dựa vào bài: {a.sources.map((s) => s.title).join(', ')}</span>}
        </div>
        {a.feedbackNote && <p className="text-xs text-muted-foreground">Ghi chú: {a.feedbackNote}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant={a.feedback === 'HELPFUL' ? 'success' : 'secondary'} aria-pressed={a.feedback === 'HELPFUL'} disabled={busy} onClick={onHelpful}>
            Tốt
          </Button>
          <Button size="sm" variant={a.feedback === 'NOT_HELPFUL' ? 'danger' : 'secondary'} aria-pressed={a.feedback === 'NOT_HELPFUL'} disabled={busy} onClick={onNotHelpful}>
            Chưa tốt
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={onView}>
          Xem cả cuộc trò chuyện
        </Button>
        {a.feedback === 'NOT_HELPFUL' && (
          <Button size="sm" variant="ghost" onClick={onDraft}>
            Viết bài kiến thức cho câu này
          </Button>
        )}
        {a.feedbackBy && <p className="text-center text-[11px] text-muted-foreground">Đánh giá bởi {a.feedbackBy.fullName}</p>}
      </div>
    </li>
  );
}
