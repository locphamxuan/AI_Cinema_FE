'use client';

import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/format';
import type { AiAnswerLog } from '@/types/support';
import { handsOff, percent } from './aiLabels';

/** One AI answer: who asked, the question and the answer, what it cited, and the Admin's rating. */
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
  const member = a.conversation.member;
  return (
    <li className="grid grid-cols-1 gap-3 py-4 lg:grid-cols-[1fr_15rem]">
      <div className="min-w-0 space-y-2 text-sm">
        <p className="text-xs text-muted-foreground">
          {formatDateTime(a.createdAt)} · {member.fullName} ({member.email})
          {a.conversation.satisfactionRating !== null && ` · Member chấm cuộc hỗ trợ ${a.conversation.satisfactionRating}/5`}
        </p>
        <p className="font-medium">{a.question ?? 'Không còn câu hỏi gốc'}</p>
        <p className="line-clamp-3 whitespace-pre-line text-muted-foreground">{a.answer}</p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Độ tin cậy {percent(a.confidence)}</span>
          {handsOff(a.resolution) && <Badge tone="amber">Đã chuyển nhân viên</Badge>}
          {a.sources.map((s, i) => (
            <Badge key={`${s.articleId}-${i}`} tone="neutral">
              {s.title}
            </Badge>
          ))}
        </div>
        {a.feedbackNote && <p className="text-xs text-muted-foreground">Ghi chú đánh giá: {a.feedbackNote}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant={a.feedback === 'HELPFUL' ? 'success' : 'secondary'} aria-pressed={a.feedback === 'HELPFUL'} disabled={busy} onClick={onHelpful}>
            <ThumbsUp className="size-3.5" aria-hidden="true" /> Hữu ích
          </Button>
          <Button size="sm" variant={a.feedback === 'NOT_HELPFUL' ? 'danger' : 'secondary'} aria-pressed={a.feedback === 'NOT_HELPFUL'} disabled={busy} onClick={onNotHelpful}>
            <ThumbsDown className="size-3.5" aria-hidden="true" /> Chưa tốt
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={onView}>
          Xem cả hội thoại
        </Button>
        {a.feedback === 'NOT_HELPFUL' && (
          <Button size="sm" variant="ghost" onClick={onDraft}>
            Thêm bài vào Kho tri thức
          </Button>
        )}
        {a.feedbackBy && <p className="text-center text-[11px] text-muted-foreground">Đánh giá bởi {a.feedbackBy.fullName}</p>}
      </div>
    </li>
  );
}
