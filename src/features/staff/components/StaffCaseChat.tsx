'use client';

import { useState } from 'react';
import { ErrorNote, Facts, Loading, StatusPill, TextPromptModal } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { useAction } from '@/hooks/useAction';
import { useCan } from '@/hooks/useCan';
import { useResource } from '@/hooks/useResource';
import { formatDateTime } from '@/lib/format';
import { PERMISSION } from '@/lib/permissions';
import { staffSupportService } from '@/services/staffSupportService';
import { CASE_STATUS, ESCALATION, PRIORITY, caseActions } from '../supportLabels';
import { AUTO_CLOSE_HOURS } from '../caseTiming';
import { AssignCaseModal } from './AssignCaseModal';
import { CaseMilestones } from './CaseMilestones';
import { CaseTranscript } from './CaseTranscript';
import { MemberContextPanel } from './MemberContextPanel';
import { StaffCaseComposer } from './StaffCaseComposer';

type View = 'chat' | 'member';

/** One case: who and why, the transcript or the member's context, and what this account may do on it. */
export function StaffCaseChat({
  caseId,
  currentUserId,
  isAdmin,
  onChanged,
}: {
  caseId: string;
  currentUserId?: string;
  isAdmin: boolean;
  onChanged: () => Promise<void>;
}) {
  const can = useCan();
  const detail = useResource(`staff:support:detail:${caseId}`, () => staffSupportService.getDetail(caseId));
  const [view, setView] = useState<View>('chat');
  const [resolving, setResolving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  // Another Staff member may have claimed or closed the case meanwhile: a 409 shows the case as it is now.
  const { busy, run } = useAction({ onStale: () => Promise.all([detail.reload(), onChanged()]) });

  if (detail.error) return <div className="p-4"><ErrorNote message={detail.error} onRetry={detail.reload} /></div>;
  if (!detail.data) return <Loading />;

  const c = detail.data.conversation;
  const allowed = caseActions(c, {
    id: currentUserId,
    isAdmin,
    canManage: can(PERMISSION.SUPPORT_CASE_MANAGE),
    canAssign: can(PERMISSION.SUPPORT_CASE_ASSIGN),
  });
  const after = async (done: unknown) => {
    if (!done) return;
    await Promise.all([detail.reload(), onChanged()]);
  };
  const act = async (call: 'claim' | 'release') =>
    after(await run(() => staffSupportService[call](c.id), call === 'claim' ? 'Đã nhận yêu cầu' : 'Đã trả yêu cầu về hàng chờ'));
  const resolve = async (note: string) => {
    setResolving(false);
    await after(await run(() => staffSupportService.resolve(c.id, note), 'Đã báo Member: chờ Member xác nhận'));
  };

  return (
    <>
      <header className="space-y-3 border-b border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{c.memberFullName}</h2>
            <p className="text-xs text-muted-foreground">
              {c.assignedAgentName ? `Người nhận: ${c.assignedAgentName}` : 'Chưa ai nhận'} · Cập nhật {formatDateTime(c.lastMessageAt ?? c.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusPill {...PRIORITY[c.priority]} />
            <StatusPill {...CASE_STATUS[c.status]} />
          </div>
        </div>
        <CaseMilestones c={c} />
        {(c.escalationReason || c.aiSummary) && (
          <div className="space-y-1 rounded-lg bg-muted/60 px-3 py-2 text-xs">
            {c.escalationReason && <p><span className="font-medium">Lý do chuyển: </span>{ESCALATION[c.escalationReason]}{c.escalationNote ? ` — ${c.escalationNote}` : ''}</p>}
            {c.aiSummary && <p><span className="font-medium">Tóm tắt AI: </span>{c.aiSummary}</p>}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div role="tablist" aria-label="Nội dung yêu cầu" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-xs">
            {(['chat', 'member'] as View[]).map((v) => (
              <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`cursor-pointer rounded-md px-3 py-1 ${view === v ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground'}`}>
                {v === 'chat' ? 'Hội thoại' : 'Bối cảnh Member'}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allowed.claim && <Button size="sm" disabled={busy} onClick={() => void act('claim')}>Nhận yêu cầu</Button>}
            {allowed.resolve && <Button size="sm" variant="success" disabled={busy} onClick={() => setResolving(true)}>Đã giải quyết xong</Button>}
            {allowed.assign && <Button size="sm" variant="ghost" disabled={busy} onClick={() => setAssigning(true)}>Giao cho người khác</Button>}
            {allowed.release && <Button size="sm" variant="ghost" disabled={busy} onClick={() => void act('release')}>Trả về hàng chờ</Button>}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {view === 'chat' ? <CaseTranscript messages={detail.data.messages} /> : <MemberContextPanel caseId={c.id} />}
      </div>

      {view === 'chat' && allowed.reply && <StaffCaseComposer caseId={c.id} canSuggest={allowed.suggest} onSent={() => after(true)} />}
      {view === 'chat' && !allowed.reply && c.status === 'STAFF_HANDLING' && (
        <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Yêu cầu đang do {c.assignedAgentName ?? 'nhân viên khác'} xử lý; chỉ người nhận hoặc Admin trả lời được.
        </p>
      )}

      <TextPromptModal
        open={resolving}
        title="Đã giải quyết xong yêu cầu?"
        subtitle="Member nhận thông báo và chọn Đã giải quyết (yêu cầu đóng) hoặc Vẫn cần hỗ trợ (yêu cầu quay lại hàng chờ). Không phản hồi thì yêu cầu tự đóng."
        label="Ghi chú cách xử lý gửi Member (tuỳ chọn)"
        confirmLabel="Đã giải quyết xong"
        tone="success"
        required={false}
        busy={busy}
        onClose={() => setResolving(false)}
        onConfirm={(note) => void resolve(note)}
      >
        <Facts
          stacked
          items={[
            ['Member', c.memberFullName],
            ['Vấn đề', c.escalationReason ? ESCALATION[c.escalationReason] : 'Member cần hỗ trợ'],
            ['Tự đóng nếu im lặng', `sau ${AUTO_CLOSE_HOURS} giờ`],
          ]}
        />
      </TextPromptModal>
      {assigning && (
        <AssignCaseModal
          caseId={c.id}
          currentAgentId={c.assignedAgentId}
          onClose={() => setAssigning(false)}
          onAssigned={async () => {
            setAssigning(false);
            await after(true);
          }}
        />
      )}
    </>
  );
}
