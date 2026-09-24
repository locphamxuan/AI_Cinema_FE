import { useState } from 'react';
import { Clock } from 'lucide-react';
import type { EpisodePackage, QuotaRequest } from '@/types/workflow';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { canRequestQuota, pendingQuotaRequest } from '@/features/workflow/lib/quota';

const STATUS: Record<QuotaRequest['status'], { label: string; tone: 'amber' | 'emerald' | 'rose' }> = {
  pending: { label: 'Chờ duyệt', tone: 'amber' },
  approved: { label: 'Đã cấp', tone: 'emerald' },
  rejected: { label: 'Từ chối', tone: 'rose' },
};

export interface QuotaRequestPanelProps {
  currentPackage: EpisodePackage;
}

/** Lets the Creator ask the Reviewer for more tokens and follow earlier requests. */
export function QuotaRequestPanel({ currentPackage }: QuotaRequestPanelProps) {
  const requestQuota = useWorkflowStore((s) => s.requestQuota);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isSending, setIsSending] = useState(false);

  const pending = pendingQuotaRequest(currentPackage);
  const canRequest = canRequestQuota(currentPackage);
  const requested = Number(amount);
  const isValid = Number.isInteger(requested) && requested > 0 && reason.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSending(true);
    const sent = await requestQuota(currentPackage.id, requested, reason.trim());
    setIsSending(false);
    if (!sent) return;
    setAmount('');
    setReason('');
    toast.success('Đã gửi yêu cầu', `Reviewer sẽ xem xét việc cấp thêm ${requested} token.`);
  };

  return (
    <section aria-labelledby="quota-request-heading" className="space-y-3">
      <h4 id="quota-request-heading" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        Xin thêm token
      </h4>

      {pending && (
        <p role="status" className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
          <Clock className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          Đang chờ Reviewer duyệt yêu cầu {pending.requested_amount} token.
        </p>
      )}

      {canRequest && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
          <FormField label="Số token cần thêm">
            <input
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="VD: 500"
              className={`${fieldInputClass} font-mono tabular-nums`}
            />
          </FormField>
          <FormField label="Lý do">
            <textarea
              rows={3}
              required
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Vì sao hạn mức hiện tại không đủ…"
              className={fieldTextareaClass}
            />
          </FormField>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!isValid || isSending}>
              {isSending ? 'Đang gửi…' : 'Gửi yêu cầu'}
            </Button>
          </div>
        </form>
      )}

      {!canRequest && !pending && (
        <p className="text-xs text-slate-500 dark:text-slate-400">Chỉ xin thêm được khi tập đã được cấp token và đang sản xuất.</p>
      )}

      {currentPackage.quota_requests.length > 0 && (
        <ul className="space-y-2">
          {currentPackage.quota_requests.map((r) => (
            <li key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {r.status === 'approved' ? `${r.granted_amount} / ${r.requested_amount}` : r.requested_amount} token
                </span>
                <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-300">{r.reason}</p>
              {r.decision_note && (
                <p className="text-slate-500 dark:text-slate-400">
                  {r.decided_by_name}: {r.decision_note}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
