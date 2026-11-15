'use client';

import { MessagesSquare } from 'lucide-react';
import { ErrorNote, Loading } from '@/components/data/ui';
import { Modal } from '@/components/ui/Modal';
import { useResource } from '@/hooks/useResource';
import { staffSupportService } from '@/services/staffSupportService';
import { CaseTranscript } from '@/features/staff/components/CaseTranscript';
import { CASE_STATUS } from '@/features/staff/supportLabels';

/** The whole support case an AI answer belongs to, read only. */
export function ConversationModal({ conversationId, onClose }: { conversationId: string; onClose: () => void }) {
  const detail = useResource(`support:case:${conversationId}`, () => staffSupportService.getDetail(conversationId));
  const c = detail.data?.conversation;
  return (
    <Modal
      open
      onClose={onClose}
      maxWidth="max-w-2xl"
      icon={<MessagesSquare className="size-5" />}
      title={c ? `Hội thoại với ${c.memberFullName}` : 'Hội thoại'}
      subtitle={c ? `${CASE_STATUS[c.status].label} · chỉ đọc` : undefined}
    >
      {detail.error && <ErrorNote message={detail.error} onRetry={detail.reload} />}
      {detail.loading && !detail.data && <Loading />}
      {detail.data && (
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <CaseTranscript messages={detail.data.messages} />
        </div>
      )}
    </Modal>
  );
}
