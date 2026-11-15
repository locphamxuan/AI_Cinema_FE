'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldTextareaClass } from '@/components/ui/FormField';
import { projectNoteService } from '@/services/scriptService';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { formatDateTime } from '@/lib/format';
import { ErrorNote, Loading, Panel } from '@/components/data/ui';
import { BACKEND_ROLE_LABEL } from '@/features/admin/roles';
import type { UserRole } from '@/types/production';
import { NOTE_PROJECT, isIn } from '../../lib/capabilities';
import { useProject } from './ProjectContext';

const MAX = 2000;

/**
 * MF-1 §1: the Admin and the lead Creator align on the idea and direction of the movie before and while the
 * script is written; the Reviewer in charge follows along and may answer. Everyone else on the project reads.
 */
export function ProjectNotesPanel() {
  const { project, caps } = useProject();
  const notes = useResource(`project-notes:${project.id}`, () => projectNoteService.list(project.id));
  const [message, setMessage] = useState('');
  const { busy, run } = useAction();
  const canWrite = caps.note && isIn(project.status, NOTE_PROJECT);

  const send = async () => {
    const next = await run(() => projectNoteService.send(project.id, message.trim()), 'Đã gửi trao đổi');
    if (next) {
      setMessage('');
      await notes.reload();
    }
  };

  return (
    <Panel
      title="Trao đổi ý tưởng"
      description="Admin và Creator chính thống nhất ý tưởng, hướng phim trước khi viết kịch bản; Reviewer phụ trách cùng theo dõi."
    >
      {notes.error && <ErrorNote message={notes.error} onRetry={notes.reload} />}
      {notes.loading && !notes.data && <Loading />}
      {notes.data && notes.data.length === 0 && <p className="text-xs text-slate-500">Chưa có trao đổi nào.</p>}
      {notes.data && notes.data.length > 0 && (
        <ul className="space-y-3" aria-label="Trao đổi ý tưởng của dự án">
          {notes.data.map((note) => (
            <li key={note.id} className="rounded-xl border border-slate-200 dark:border-white/10 p-3 text-xs">
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {note.author?.fullName ?? 'Người dùng đã xoá'}
                {note.author && (
                  <span className="ml-1.5 font-normal text-slate-500">({BACKEND_ROLE_LABEL[note.author.role as UserRole] ?? note.author.role})</span>
                )}
                <span className="ml-2 font-normal text-slate-500">{formatDateTime(note.createdAt)}</span>
              </p>
              <p className="mt-1 whitespace-pre-line text-slate-600 dark:text-slate-300">{note.message}</p>
            </li>
          ))}
        </ul>
      )}
      {canWrite && (
        <div className="mt-3 space-y-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300" htmlFor={`project-note-${project.id}`}>
            Nội dung trao đổi
          </label>
          <textarea
            id={`project-note-${project.id}`}
            rows={3}
            maxLength={MAX}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={fieldTextareaClass}
            placeholder="Ví dụ: giữ tông trầm, đẩy cao trào ở tập cuối; nhân vật chính là bác sĩ trẻ."
          />
          <Button size="sm" onClick={send} disabled={busy || !message.trim()}>
            <Send className="w-3.5 h-3.5" aria-hidden="true" /> Gửi trao đổi
          </Button>
        </div>
      )}
    </Panel>
  );
}
