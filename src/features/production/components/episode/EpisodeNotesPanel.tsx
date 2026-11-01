'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldTextareaClass } from '@/components/ui/FormField';
import { productionService } from '@/services/productionService';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { formatDateTime } from '../../lib/format';
import { ErrorNote, Panel } from '../shared/ui';

const MAX = 2000;

/**
 * BR-67: the Creator holding an episode answers for it, but only the lead Creator talks to the studio. Here
 * the two exchange notes: what the studio must fix goes up to the lead, who answers once it is passed on.
 * `canWrite` is the holder or the lead; everyone else on the project only reads.
 */
export function EpisodeNotesPanel({
  episodeId,
  canWrite,
  isLead,
  leadName,
}: {
  episodeId: string;
  canWrite: boolean;
  isLead: boolean;
  leadName: string;
}) {
  const notes = useResource(`episode-notes:${episodeId}`, () => productionService.listEpisodeNotes(episodeId));
  const [message, setMessage] = useState('');
  const { busy, run } = useAction();

  const send = async () => {
    if (await run(() => productionService.sendEpisodeNote(episodeId, message.trim()), 'Đã gửi ghi chú')) {
      setMessage('');
      await notes.reload();
    }
  };

  return (
    <Panel
      title="Trao đổi về tập"
      description={
        isLead
          ? 'Creator phụ trách tập ghi lại phần Studio cần sửa; bạn báo Studio rồi trả lời ở đây.'
          : `Chỉ Creator chính làm việc với Studio. Ghi lại phần Studio cần sửa để ${leadName || 'Creator chính'} báo Studio.`
      }
    >
      {notes.error && <ErrorNote message={notes.error} onRetry={notes.reload} />}
      {notes.data && notes.data.length === 0 && <p className="text-xs text-slate-500">Chưa có ghi chú nào.</p>}
      {notes.data && notes.data.length > 0 && (
        <ul className="space-y-3" aria-label="Ghi chú của tập">
          {notes.data.map((note) => (
            <li key={note.id} className="rounded-xl border border-slate-200 dark:border-white/10 p-3 text-xs">
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {note.author?.fullName ?? 'Người dùng đã xoá'}
                <span className="ml-2 font-normal text-slate-500">{formatDateTime(note.createdAt)}</span>
              </p>
              <p className="mt-1 whitespace-pre-line text-slate-600 dark:text-slate-300">{note.message}</p>
            </li>
          ))}
        </ul>
      )}
      {canWrite && (
        <div className="mt-3 space-y-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300" htmlFor={`note-${episodeId}`}>
            {isLead ? 'Trả lời Creator phụ trách tập' : 'Ghi chú gửi Creator chính'}
          </label>
          <textarea
            id={`note-${episodeId}`}
            rows={3}
            maxLength={MAX}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={fieldTextareaClass}
            placeholder="Ví dụ: phút 1:20 lệch kịch bản, cần Studio dựng lại cảnh quán cà phê."
          />
          <Button size="sm" onClick={send} disabled={busy || !message.trim()}>
            <Send className="w-3.5 h-3.5" aria-hidden="true" /> Gửi ghi chú
          </Button>
        </div>
      )}
    </Panel>
  );
}
