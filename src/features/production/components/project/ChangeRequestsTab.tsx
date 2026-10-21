'use client';

import { useState } from 'react';
import { Check, MessageSquarePlus, X, ShieldAlert, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { productionService } from '@/services/productionService';
import type { ChangeRequest } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { CHANGE_REQUEST_STATUS } from '../../lib/labels';
import { formatDateTime } from '../../lib/format';
import { Empty, ErrorNote, Loading, StatusPill, TextPromptModal } from '../shared/ui';
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

  const openCount = requests.data?.filter((r) => r.status === 'OPEN').length ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Main: list */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Đề xuất cho Admin</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Đề xuất điều chỉnh dự án, xin cấp thêm kinh phí Token hoặc thay đổi lịch trình.</p>
            </div>
            {openCount > 0 && (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {openCount} mở
              </span>
            )}
          </div>

          <div className="p-5 space-y-3">
            {requests.error && <ErrorNote message={requests.error} onRetry={requests.reload} />}
            {requests.loading && !requests.data && <Loading />}
            {requests.data?.length === 0 && <Empty>Chưa có đề xuất nào.</Empty>}

            {requests.data?.map((cr) => {
              const isOpen = cr.status === 'OPEN';
              return (
                <div
                  key={cr.id}
                  className={`rounded-xl border p-4 text-xs space-y-3 transition-all ${
                    isOpen
                      ? 'border-amber-200 dark:border-amber-500/25 bg-amber-50/30 dark:bg-amber-500/[0.04]'
                      : cr.status === 'ACCEPTED'
                        ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-500/[0.03]'
                        : 'border-slate-200 dark:border-white/8 bg-slate-50/30 dark:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isOpen
                        ? <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        : cr.status === 'ACCEPTED'
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      }
                      <p className="text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{cr.requestedBy.fullName}</span>
                        {' · '}{formatDateTime(cr.createdAt)}
                        {cr.episode && (
                          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500">
                            Tập {cr.episode.episodeNumber}: {cr.episode.title}
                          </span>
                        )}
                      </p>
                    </div>
                    <StatusPill {...CHANGE_REQUEST_STATUS[cr.status]} />
                  </div>

                  <div className="rounded-lg bg-white dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 p-3">
                    <p className="whitespace-pre-line text-slate-800 dark:text-slate-200 leading-relaxed">{cr.content}</p>
                  </div>

                  {cr.reviewerResponse && (
                    <div className="rounded-lg bg-white dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Phản hồi của Reviewer</p>
                      <p className="text-slate-600 dark:text-slate-300">
                        <span className="font-semibold">{cr.resolvedBy?.fullName ?? 'Reviewer'}:</span>{' '}{cr.reviewerResponse}
                      </p>
                    </div>
                  )}

                  {caps.manage && cr.status === 'OPEN' && (
                    <div className="flex gap-2 justify-end pt-1">
                      <Button size="sm" variant="secondary" disabled={busy} onClick={() => setRejecting(cr)}>
                        <X className="w-3.5 h-3.5" aria-hidden="true" /> Từ chối
                      </Button>
                      <Button size="sm" variant="success" disabled={busy} onClick={() => accept(cr)}>
                        <Check className="w-3.5 h-3.5" aria-hidden="true" /> Chấp nhận
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar: propose form */}
      {(caps.suggest || caps.manage || caps.creator) && project.status !== 'CANCELLED' && (
        <ProposeForm onDone={refresh} />
      )}

      <TextPromptModal
        open={!!rejecting}
        title="Từ chối đề xuất"
        label="Lý do phản hồi"
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
  const [reason, setReason] = useState('');
  const [fileName, setFileName] = useState('');
  const [episodeId, setEpisodeId] = useState('');
  const { busy, run } = useAction();
  const episodes = project.seasons.flatMap((s) => s.episodes);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullProposal = [
      content.trim(),
      reason.trim() ? `\n\n📌 Lý do: ${reason.trim()}` : '',
      fileName.trim() ? `\n📎 Giấy tờ/minh họa đính kèm: ${fileName.trim()}` : '',
    ].join('');

    if (await run(() => productionService.proposeChange(project.id, fullProposal, episodeId || undefined), 'Đã gửi đề xuất')) {
      setContent('');
      setReason('');
      setFileName('');
      setEpisodeId('');
      await onDone();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <MessageSquarePlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tạo đề xuất</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Xin cấp thêm kinh phí, gia hạn hoặc chỉnh sửa dự án.</p>
        </div>
      </div>
      <div className="p-5">
        <form onSubmit={submit} className="space-y-3.5">
          <FormField label="Áp dụng cho tập (tuỳ chọn)">
            <select value={episodeId} onChange={(e) => setEpisodeId(e.target.value)} className={fieldInputClass}>
              <option value="">Toàn bộ dự án</option>
              {episodes.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  Tập {ep.episodeNumber}: {ep.title}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Nội dung đề xuất">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ví dụ: Xin cấp bổ sung 200.000 Token để thuê thêm studio hỗ trợ kỹ xảo 3D..."
              maxLength={3000}
              required
              className={fieldTextareaClass}
            />
          </FormField>
          <FormField label="Lý do đề xuất">
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Giải trình nguyên nhân phát sinh..."
              maxLength={2000}
              className={fieldTextareaClass}
            />
          </FormField>
          <FormField label="Giấy tờ / Hồ sơ minh họa (tuỳ chọn)">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Tên tài liệu hoặc link minh chứng..."
              maxLength={255}
              className={fieldInputClass}
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={busy || content.trim().length < 5}>
            <MessageSquarePlus className="w-4 h-4" aria-hidden="true" /> Gửi đề xuất cho Admin
          </Button>
        </form>
      </div>
    </div>
  );
}
