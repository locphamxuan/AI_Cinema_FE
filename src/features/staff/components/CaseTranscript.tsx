import { formatDateTime } from '@/lib/format';
import type { SupportMessage } from '@/types/support';

const SENDER: Record<SupportMessage['senderType'], string> = {
  MEMBER: 'Member',
  AI_CHATBOT: 'AI',
  SUPPORT_AGENT: 'Nhân viên',
  SYSTEM: 'Hệ thống',
};

/** The messages of a case, oldest first, as the backend stored them; internal notes are marked as such. */
export function CaseTranscript({ messages }: { messages: SupportMessage[] }) {
  if (!messages.length) return <p className="py-8 text-center text-sm text-muted-foreground">Chưa có tin nhắn.</p>;
  return (
    <ol className="space-y-3" aria-label="Hội thoại">
      {messages.map((m) => {
        if (m.senderType === 'SYSTEM') {
          return (
            <li key={m.id} className="text-center text-[11px] text-muted-foreground">
              {m.content} · {formatDateTime(m.createdAt)}
            </li>
          );
        }
        const fromMember = m.senderType === 'MEMBER';
        const tone = m.isInternal
          ? 'border border-dashed border-warning/50 bg-warning/10'
          : fromMember
            ? 'bg-muted'
            : m.senderType === 'AI_CHATBOT'
              ? 'bg-primary/8 ring-1 ring-primary/15'
              : 'bg-primary text-primary-foreground';
        return (
          <li key={m.id} className={`flex flex-col ${fromMember ? 'items-start' : 'items-end'}`}>
            <span className="mb-1 text-[11px] text-muted-foreground">
              {m.isInternal ? 'Ghi chú nội bộ' : SENDER[m.senderType]} · {formatDateTime(m.createdAt)}
            </span>
            <p className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-line ${tone}`}>{m.content}</p>
          </li>
        );
      })}
    </ol>
  );
}
