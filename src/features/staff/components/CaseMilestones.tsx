import { useState } from 'react';
import { formatDateTime } from '@/lib/format';
import type { SupportCase } from '@/types/support';
import { autoCloseAt, awaitsStaffReply, CLOSE_REASON, formatSpan } from '../caseTiming';

/**
 * Where the case stands and who it waits on, in plain words: the milestones it passed (with times), then one
 * line for what happens next — so a Staff member never has to guess whether a case is open, waiting on them,
 * or waiting on the member.
 */
export function CaseMilestones({ c }: { c: SupportCase }) {
  // Read once per opened case: the spans are minutes, not seconds.
  const [now] = useState(() => Date.now());
  const steps: [string, string | null][] = [
    ['Gửi yêu cầu', c.createdAt],
    ['Chuyển nhân viên', c.escalatedAt],
    ['Nhận yêu cầu', c.claimedAt],
    ['Trả lời đầu tiên', c.firstStaffReplyAt ?? null],
    ['Báo đã giải quyết', c.resolvedAt],
    ['Kết thúc', c.closedAt],
  ];
  return (
    <div className="space-y-2">
      <ol aria-label="Các mốc xử lý" className="grid grid-cols-3 gap-x-3 gap-y-1.5 text-[11px] sm:grid-cols-6">
        {steps.map(([label, at]) => (
          <li key={label} className={at ? 'text-foreground' : 'text-muted-foreground/60'}>
            <span className={`mb-1 block h-1 rounded-full ${at ? 'bg-primary' : 'bg-muted'}`} aria-hidden="true" />
            <span className="block font-medium">{label}</span>
            <span className="block tabular-nums">{at ? formatDateTime(at) : 'Chưa có'}</span>
          </li>
        ))}
      </ol>
      <NextStep c={c} now={now} />
    </div>
  );
}

function NextStep({ c, now }: { c: SupportCase; now: number }) {
  const line = (tone: string, text: string, extra?: string | null) => (
    <p className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${tone}`}>
      {text}
      {extra && <span className="mt-1 block text-muted-foreground">{extra}</span>}
    </p>
  );
  const note = c.resolutionNote ? `Ghi chú gửi Member: ${c.resolutionNote}` : null;
  switch (c.status) {
    case 'AI_HANDLING':
      return line('bg-muted/60', `Trợ lý AI đang trả lời (${c.aiTurns} lượt). Yêu cầu chỉ vào hàng chờ khi AI hoặc Member yêu cầu nhân viên.`);
    case 'WAITING_FOR_STAFF':
      return line('bg-warning/10 text-foreground', `Chưa ai nhận, Member đã chờ ${formatSpan(now - new Date(c.escalatedAt ?? c.createdAt).getTime())}. Bấm "Nhận yêu cầu" để trả lời.`);
    case 'STAFF_HANDLING':
      return awaitsStaffReply(c)
        ? line('bg-warning/10 text-foreground', `Member nhắn lúc ${formatDateTime(c.lastMemberMessageAt)} và đang chờ nhân viên trả lời.`)
        : line('bg-muted/60', 'Nhân viên đã trả lời tin mới nhất. Xong việc thì bấm "Đã giải quyết xong" để Member xác nhận.');
    case 'RESOLVED': {
      const at = autoCloseAt(c);
      return line(
        'bg-success/10 text-foreground',
        `Đang chờ Member xác nhận. Member chọn "Vẫn cần hỗ trợ" thì yêu cầu quay lại hàng chờ; không phản hồi thì tự đóng${at ? ` lúc ${formatDateTime(at.toISOString())}` : ''}.`,
        note,
      );
    }
    case 'CLOSED': {
      const rating = c.satisfactionRating ? `Member đánh giá ${c.satisfactionRating}/5${c.satisfactionComment ? `: "${c.satisfactionComment}"` : ''}` : null;
      return line('bg-muted/60', `Đã kết thúc: ${c.closeReason ? CLOSE_REASON[c.closeReason] : 'không rõ lý do'}. Không gửi thêm tin được.`, [note, rating].filter(Boolean).join(' · ') || null);
    }
  }
}
