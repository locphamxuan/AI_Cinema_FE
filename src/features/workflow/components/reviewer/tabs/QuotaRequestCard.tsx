import { useState } from 'react';
import type { EpisodePackage, QuotaRequest } from '@/types/workflow';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { quotaUsage } from '@/features/workflow/lib/quota';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';

export interface QuotaRequestCardProps {
  episode: EpisodePackage;
  request: QuotaRequest;
  /** Project budget not yet granted — the most this request can receive. */
  availableBudget: number;
}

/** One pending top-up request: the Reviewer grants all or part of it, or turns it down with a reason. */
export function QuotaRequestCard({ episode, request, availableBudget }: QuotaRequestCardProps) {
  const { approveQuotaRequest, rejectQuotaRequest } = useWorkflowStore();
  const can = useCan();
  const [amount, setAmount] = useState(String(Math.min(request.requested_amount, availableBudget)));
  const [note, setNote] = useState('');
  const [isDeciding, setIsDeciding] = useState(false);

  const usage = quotaUsage(episode);
  const granted = Number(amount);
  const canApprove = Number.isInteger(granted) && granted > 0 && granted <= availableBudget;

  const decide = async (approve: boolean) => {
    setIsDeciding(true);
    const done = approve ? await approveQuotaRequest(request.id, granted, note.trim()) : await rejectQuotaRequest(request.id, note.trim());
    setIsDeciding(false);
    if (!done) return;
    if (approve) toast.success('Đã cấp thêm token', `${granted} token cho ${episode.title}.`);
    else toast.info('Đã từ chối yêu cầu', 'Creator sẽ thấy lý do trong phần phản hồi.');
  };

  return (
    <li className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{episode.title}</p>
          <p className="text-slate-500 dark:text-slate-400">
            {request.requested_by_name} xin thêm <span className="font-mono font-bold">{request.requested_amount}</span> token
          </p>
        </div>
        <span className="font-mono text-slate-600 dark:text-slate-300 tabular-nums">
          Đã dùng {usage.used} / {usage.allocated}
        </span>
      </div>
      <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-[#12141A] p-2.5 rounded-lg border border-slate-200 dark:border-white/10">{request.reason}</p>

      {can(PERMISSION.QUOTA_MANAGE) ? (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-3">
        <FormField label="Số token cấp">
          <input
            type="number"
            min={1}
            max={availableBudget}
            step={1}
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`${fieldInputClass} font-mono tabular-nums`}
          />
        </FormField>
        <FormField label="Ghi chú (bắt buộc khi từ chối)">
          <textarea rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} className={fieldTextareaClass} />
        </FormField>
      </div>
      {granted > availableBudget && (
        <p role="alert" className="text-rose-600 dark:text-rose-400">
          Ngân sách dự án chỉ còn {availableBudget.toLocaleString()} token.
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="danger" size="sm" onClick={() => decide(false)} disabled={isDeciding || !note.trim()}>
          Từ chối
        </Button>
        <Button variant="success" size="sm" onClick={() => decide(true)} disabled={isDeciding || !canApprove}>
          Cấp token
        </Button>
      </div>
        </>
      ) : (
        <p className="text-slate-500 dark:text-slate-400">Chờ Reviewer quyết định.</p>
      )}
    </li>
  );
}
