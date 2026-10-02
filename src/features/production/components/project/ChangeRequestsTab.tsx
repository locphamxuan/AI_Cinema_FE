'use client';

import { useState } from 'react';
import { Check, MessageSquarePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { productionService } from '@/services/productionService';
import type { ChangeRequest } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { CHANGE_REQUEST_STATUS } from '../../lib/labels';
import { formatDateTime } from '../../lib/format';
import { Empty, ErrorNote, Loading, Panel, StatusPill, TextPromptModal } from '../shared/ui';
import { useProject } from './ProjectContext';

/** BR-55: the Admin proposes changes, the Reviewer in charge accepts or rejects them (with a reason). */
export function ChangeRequestsTab() {
  const { project, caps, reload } = useProject();
  const requests = useResource(`changes:${project.id}`, () => productionService.listChangeRequests(project.id));
  const [rejecting, setRejecting] = useState<ChangeRequest | null>(null);
  const { busy, run } = useAction();

  const refresh = () => Promise.all([requests.reload(), reload()]);

  const accept = async (cr: ChangeRequest) => {
    if (await run(() => productionService.acceptChange(cr.id), 'Đã chấp nhận đề xuất')) await refresh();
  };
  const reject = async (response: string) => {
    if (!rejecting) return;
    if (await run(() => productionService.rejectChange(rejecting.id, response), 'Đã từ chối đề xuất')) {
      setRejecting(null);
      await refresh();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Panel className="lg:col-span-2" title="Đề xuất sửa dự án" description="Admin không sửa trực tiếp; Reviewer phụ trách quyết định.">
        {requests.error && <ErrorNote message={requests.error} onRetry={requests.reload} />}
        {requests.loading && !requests.data && <Loading />}
        {requests.data?.length === 0 && <Empty>Chưa có đề xuất nào.</Empty>}
        <ul className="space-y-3">
          {requests.data?.map((cr) => (
            <li key={cr.id} className="rounded-xl border border-slate-200 dark:border-white/10 p-3 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-slate-500 dark:text-slate-400">
                  {cr.requestedBy.fullName} · {formatDateTime(cr.createdAt)}
                  {cr.episode && ` · Tập ${cr.episode.episodeNumber}: ${cr.episode.title}`}
                </p>
                <StatusPill {...CHANGE_REQUEST_STATUS[cr.status]} />
              </div>
              <p className="whitespace-pre-line text-slate-800 dark:text-slate-200">{cr.content}</p>
              {cr.reviewerResponse && (
                <p className="rounded-lg bg-slate-50 dark:bg-white/5 p-2 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">{cr.resolvedBy?.fullName ?? 'Reviewer'}:</span> {cr.reviewerResponse}
                </p>
              )}
              {caps.manage && cr.status === 'OPEN' && (
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="secondary" disabled={busy} onClick={() => setRejecting(cr)}>
                    <X className="w-3.5 h-3.5" aria-hidden="true" /> Từ chối
                  </Button>
                  <Button size="sm" variant="success" disabled={busy} onClick={() => accept(cr)}>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" /> Chấp nhận
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Panel>

      {caps.suggest && project.status !== 'CANCELLED' && <ProposeForm onDone={refresh} />}

      <TextPromptModal
        open={!!rejecting}
        title="Từ chối đề xuất"
        label="Lý do (Admin sẽ nhận được)"
        confirmLabel="Từ chối"
        minLength={1}
        danger
        busy={busy}
        onClose={() => setRejecting(null)}
        onConfirm={reject}
      />
    </div>
  );
}

function ProposeForm({ onDone }: { onDone: () => Promise<unknown> }) {
  const { project } = useProject();
  const [content, setContent] = useState('');
  const [episodeId, setEpisodeId] = useState('');
  const { busy, run } = useAction();
  const episodes = project.seasons.flatMap((s) => s.episodes);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await run(() => productionService.proposeChange(project.id, content.trim(), episodeId || undefined), 'Đã gửi đề xuất cho Reviewer')) {
      setContent('');
      setEpisodeId('');
      await onDone();
    }
  };

  return (
    <Panel title="Đề xuất mới">
      <form onSubmit={submit} className="space-y-3">
        <FormField label="Về tập (tuỳ chọn)">
          <select value={episodeId} onChange={(e) => setEpisodeId(e.target.value)} className={fieldInputClass}>
            <option value="">Cả dự án</option>
            {episodes.map((ep) => (
              <option key={ep.id} value={ep.id}>
                Tập {ep.episodeNumber}: {ep.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Nội dung đề xuất">
          <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} maxLength={5000} required className={fieldTextareaClass} />
        </FormField>
        <Button type="submit" className="w-full" disabled={busy || content.trim().length < 5}>
          <MessageSquarePlus className="w-4 h-4" aria-hidden="true" /> Gửi đề xuất
        </Button>
      </form>
    </Panel>
  );
}
