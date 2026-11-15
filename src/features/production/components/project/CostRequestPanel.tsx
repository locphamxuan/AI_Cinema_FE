'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { costRequestService } from '@/services/costRequestService';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { formatVnd } from '@/lib/format';
import { CostRequestCard, parseVnd } from '../shared/CostRequestCard';
import { FilePicker } from '../shared/FilePicker';
import { Empty, ErrorNote, Loading, Panel } from '@/components/data/ui';
import { useProject } from './ProjectContext';

const PROOF_ACCEPT = '.pdf,.docx,.txt,.png,.jpg,.jpeg,.webp';

/**
 * "Yêu cầu thêm chi phí sản xuất" of the project: when a studio wants more than the budget left, the Reviewer asks
 * the Admin with the studio quote attached; one open request at a time.
 */
export function CostRequestPanel({ canAsk, onGranted }: { canAsk: boolean; onGranted: () => Promise<void> }) {
  const { project } = useProject();
  const requests = useResource(`cost-requests:${project.id}:${project.updatedAt}`, () => costRequestService.forProject(project.id, 1, 20));
  const hasOpen = requests.data?.data.some((r) => r.status === 'OPEN') ?? false;
  const refresh = async () => {
    await Promise.all([requests.reload(), onGranted()]);
  };

  return (
    <Panel title="Yêu cầu thêm chi phí sản xuất" description="Reviewer gửi Admin khi Studio không đồng ý mức phí và giá Studio đòi vượt ngân sách còn lại.">
      {canAsk && !hasOpen && <CostRequestForm onSent={refresh} />}
      {canAsk && hasOpen && <p className="text-[11px] text-amber-600 mb-3">Đang có một yêu cầu chờ Admin duyệt; gửi yêu cầu mới sau khi có kết quả.</p>}
      {requests.error && <ErrorNote message={requests.error} onRetry={requests.reload} />}
      {requests.loading && !requests.data && <Loading />}
      {requests.data?.data.length === 0 && <Empty>Chưa có yêu cầu nào.</Empty>}
      <ul className="space-y-3 mt-3">
        {requests.data?.data.map((request) => (
          <CostRequestCard key={request.id} request={request} />
        ))}
      </ul>
    </Panel>
  );
}

function CostRequestForm({ onSent }: { onSent: () => Promise<void> }) {
  const { project } = useProject();
  const live = project.studioHandoffs.filter((h) => h.milestoneStatus !== 'SUPERSEDED');
  const [handoffId, setHandoffId] = useState(live[0]?.id ?? '');
  const [quote, setQuote] = useState('');
  const [requested, setRequested] = useState('');
  const [reason, setReason] = useState('');
  const [proof, setProof] = useState<File[]>([]);
  const { busy, run } = useAction();
  const quoteVnd = quote.trim() ? parseVnd(quote) : undefined;
  const requestedVnd = parseVnd(requested);
  const valid =
    requestedVnd > 0 && (quoteVnd === undefined || quoteVnd > 0) && reason.trim().length >= 5 && proof.length > 0;

  /** The gap between the quote and what the brief offered plus what is left. */
  const suggest = (text: string) => {
    setQuote(text);
    const value = parseVnd(text);
    const handoff = live.find((h) => h.id === handoffId);
    const gap = value - Number(handoff?.offeredFeeVnd ?? 0) - project.cost.remainingVnd;
    if (value > 0 && gap > 0 && !requested) setRequested(String(gap));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      requestedVnd,
      ...(quoteVnd ? { studioQuoteVnd: quoteVnd } : {}),
      ...(handoffId ? { handoffId } : {}),
      reason: reason.trim(),
      proof: proof[0],
    };
    if (await run(() => costRequestService.create(project.id, input), 'Đã gửi yêu cầu cho Admin')) {
      setQuote('');
      setRequested('');
      setReason('');
      setProof([]);
      await onSent();
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-slate-200/80 dark:border-white/[0.08] p-3">
      {live.length > 0 && (
        <FormField label="Đợt bàn giao">
          <select value={handoffId} onChange={(e) => setHandoffId(e.target.value)} className={fieldInputClass} aria-label="Đợt bàn giao">
            <option value="">Không gắn với Studio cụ thể</option>
            {live.map((h) => (
              <option key={h.id} value={h.id}>
                {h.studio.name} · đã đề xuất {formatVnd(h.offeredFeeVnd)}
              </option>
            ))}
          </select>
        </FormField>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Studio báo giá (₫, không bắt buộc)">
          <input inputMode="numeric" value={quote} onChange={(e) => suggest(e.target.value)} className={fieldInputClass} aria-label="Studio báo giá" />
        </FormField>
        <FormField label="Số tiền xin thêm (₫)">
          <input inputMode="numeric" value={requested} onChange={(e) => setRequested(e.target.value)} required className={fieldInputClass} aria-label="Số tiền xin thêm" />
        </FormField>
      </div>
      <p className="text-[11px] text-slate-500">Ngân sách còn lại: {formatVnd(project.cost.remainingVnd)}. Số tiền là bội số 1.000 ₫.</p>
      <FormField label="Lý do (Studio trả lời gì)">
        <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} minLength={5} maxLength={5000} required className={fieldTextareaClass} />
      </FormField>
      <FilePicker label="Báo giá / bằng chứng (bắt buộc)" accept={PROOF_ACCEPT} files={proof} onChange={setProof} multiple={false} hint="PDF, DOCX, TXT hoặc ảnh, tối đa 10 MB." />
      <Button type="submit" disabled={!valid || busy}>
        {busy ? 'Đang gửi…' : 'Gửi yêu cầu cho Admin'}
      </Button>
    </form>
  );
}
