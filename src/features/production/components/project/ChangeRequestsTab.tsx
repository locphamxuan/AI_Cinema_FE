'use client';

import { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { changeRequestService } from '@/services/teamService';
import type { ChangeRequestType } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { CHANGE_REQUEST_TYPE } from '../../lib/labels';
import { ChangeRequestCard } from '../shared/ChangeRequestCard';
import { FilePicker } from '../shared/FilePicker';
import { Empty, ErrorNote, Loading, Panel } from '../shared/ui';
import { useProject } from './ProjectContext';

/** BR-55: the Reviewer or a Creator sends the Admin a request with the reason and proof; the Admin decides. */
export function ChangeRequestsTab() {
  const { project, caps, reload } = useProject();
  const can = useCan();
  const requests = useResource(`changes:${project.id}`, () => changeRequestService.list(project.id));
  const refresh = () => Promise.all([requests.reload(), reload()]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Panel
        className="lg:col-span-2"
        title={caps.creator ? 'Đề xuất cho Reviewer & Admin' : 'Đề xuất cho Admin'}
        description={
          caps.creator
            ? 'Đề xuất chỉnh sửa dự án hoặc gia hạn gửi Admin (Reviewer được báo). Xin thêm Token khi Studio không chấp nhận: gửi Reviewer ở tab Studio.'
            : 'Đề xuất chỉnh sửa dự án, xin thêm kinh phí hoặc gia hạn, kèm lý do và giấy tờ minh hoạ. Chỉ Admin duyệt hoặc từ chối.'
        }
      >
        {requests.error && <ErrorNote message={requests.error} onRetry={requests.reload} />}
        {requests.loading && !requests.data && <Loading />}
        {requests.data?.length === 0 && <Empty>Chưa có đề xuất nào.</Empty>}
        <ul className="space-y-3">
          {requests.data?.map((request) => (
            <ChangeRequestCard key={request.id} request={request} canDecide={can(PERMISSION.PROJECT_CHANGE_REVIEW)} onDecided={refresh} />
          ))}
        </ul>
      </Panel>

      {caps.suggest && project.status !== 'CANCELLED' && <ProposeForm onDone={refresh} />}
    </div>
  );
}

function ProposeForm({ onDone }: { onDone: () => Promise<unknown> }) {
  const { project } = useProject();
  const [requestType, setRequestType] = useState<ChangeRequestType>('PROJECT_UPDATE');
  const [content, setContent] = useState('');
  const [reason, setReason] = useState('');
  const [tokens, setTokens] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [episodeId, setEpisodeId] = useState('');
  const [proof, setProof] = useState<File[]>([]);
  const { busy, run } = useAction();
  const budget = requestType === 'BUDGET_SUPPLEMENT';
  const episodes = project.seasons.filter((s) => !seasonId || s.id === seasonId).flatMap((s) => s.episodes);
  const tokensValid = Number.isInteger(Number(tokens)) && Number(tokens) > 0;
  const valid = content.trim().length >= 5 && reason.trim().length >= 5 && (!budget || (tokensValid && proof.length > 0));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        changeRequestService.propose(project.id, {
          requestType,
          content: content.trim(),
          reason: reason.trim(),
          ...(budget ? { requestedTokens: Number(tokens) } : {}),
          ...(seasonId ? { seasonId } : {}),
          ...(episodeId ? { episodeId } : {}),
          ...(proof[0] ? { proof: proof[0] } : {}),
        }),
      'Đã gửi đề xuất cho Admin',
    );
    if (done) {
      setContent('');
      setReason('');
      setTokens('');
      setProof([]);
      await onDone();
    }
  };

  return (
    <Panel title="Gửi đề xuất mới">
      <form onSubmit={submit} className="space-y-3">
        <FormField label="Loại đề xuất">
          <select value={requestType} onChange={(e) => setRequestType(e.target.value as ChangeRequestType)} className={fieldInputClass} aria-label="Loại đề xuất">
            {(Object.keys(CHANGE_REQUEST_TYPE) as ChangeRequestType[]).map((type) => (
              <option key={type} value={type}>
                {CHANGE_REQUEST_TYPE[type]}
              </option>
            ))}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Mùa (tuỳ chọn)">
            <select
              value={seasonId}
              onChange={(e) => {
                setSeasonId(e.target.value);
                setEpisodeId('');
              }}
              className={fieldInputClass}
              aria-label="Mùa"
            >
              <option value="">Cả dự án</option>
              {project.seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  Mùa {s.seasonNumber}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Tập (tuỳ chọn)">
            <select value={episodeId} onChange={(e) => setEpisodeId(e.target.value)} className={fieldInputClass} aria-label="Tập">
              <option value="">Tất cả</option>
              {episodes.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  Tập {ep.episodeNumber}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Nội dung đề xuất">
          <textarea rows={3} value={content} onChange={(e) => setContent(e.target.value)} maxLength={5000} required className={fieldTextareaClass} />
        </FormField>
        <FormField label="Lý do">
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={5000} required className={fieldTextareaClass} />
        </FormField>
        {budget && (
          <FormField label="Số Token xin thêm">
            <input type="number" min={1} step={1} value={tokens} onChange={(e) => setTokens(e.target.value)} required className={fieldInputClass} />
          </FormField>
        )}
        <FilePicker
          label={budget ? 'Giấy tờ minh hoạ (bắt buộc)' : 'Giấy tờ minh hoạ lý do (không bắt buộc)'}
          accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
          files={proof}
          onChange={setProof}
          multiple={false}
          hint="PDF, DOCX, TXT hoặc ảnh, tối đa 10 MB — ví dụ báo giá của Studio."
        />
        <Button type="submit" className="w-full" disabled={busy || !valid}>
          <MessageSquarePlus className="w-4 h-4" aria-hidden="true" /> Gửi đề xuất
        </Button>
      </form>
    </Panel>
  );
}
