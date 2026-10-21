'use client';

import { useState } from 'react';
import { HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Panel } from '@/features/production/components/shared/ui';
import { useAction } from '@/features/production/hooks/useAction';
import { formatNumber } from '@/features/production/lib/format';
import { seasonLabel } from '@/lib/seasonLabel';
import { tokenRequestService } from '@/services/tokenRequestService';
import type { ProjectDetail } from '@/types/production';

const MAX_TOKENS = 1_000_000_000;

/** A Creator asks the Reviewer for more Token for a season, e.g. after the studio refused the amount offered. */
export function TokenRequestForm({ project, onSent }: { project: ProjectDetail; onSent: () => void }) {
  const [seasonId, setSeasonId] = useState(project.seasons[0]?.id ?? '');
  const [tokens, setTokens] = useState('');
  const [reason, setReason] = useState('');
  const { busy, run } = useAction();
  const amount = Number(tokens);
  const amountValid = Number.isInteger(amount) && amount >= 1 && amount <= MAX_TOKENS;
  const reasonValid = reason.trim().length >= 5;
  const fee = project.seasonFees?.find((f) => f.seasonId === seasonId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonId || !amountValid || !reasonValid) return;
    const sent = await run(
      () => tokenRequestService.create(project.id, { seasonId, requestedTokens: amount, reason: reason.trim() }),
      'Đã gửi yêu cầu cho Reviewer',
    );
    if (sent) {
      setTokens('');
      setReason('');
      onSent();
    }
  };

  return (
    <div id="xin-them-token">
    <Panel title="Xin thêm Token" description="Khi Studio không chấp nhận mức Token, hoặc sau khi đổi Studio đã hết Token, gửi Reviewer số Token cần thêm cho mùa đó. Reviewer và Admin nhận thông báo.">
      <form onSubmit={submit} className="space-y-3">
        <FormField label="Mùa">
          <select value={seasonId} onChange={(e) => setSeasonId(e.target.value)} className={fieldInputClass}>
            {project.seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {seasonLabel(s.seasonNumber, s.episodes.length, s.title)}
              </option>
            ))}
          </select>
        </FormField>
        {fee && (
          <p className="text-[11px] text-slate-500">
            Đã cấp: {formatNumber(fee.totalTokens)} Token
            {fee.lostTokens > 0 && <> · mất do đổi Studio: {formatNumber(fee.lostTokens)}</>} · còn dùng được:{' '}
            {formatNumber(fee.availableTokens)} Token.
          </p>
        )}
        <FormField label="Số Token cần thêm">
          <input type="number" min={1} max={MAX_TOKENS} value={tokens} onChange={(e) => setTokens(e.target.value)} className={fieldInputClass} />
        </FormField>
        <FormField label="Lý do (Studio trả lời gì, mức Studio đề nghị…)">
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} className={fieldTextareaClass} />
        </FormField>
        {tokens && !amountValid && <p className="text-xs text-amber-600">Số Token là số nguyên dương.</p>}
        <Button type="submit" size="sm" className="w-full" disabled={busy || !seasonId || !amountValid || !reasonValid}>
          <HandCoins className="w-3.5 h-3.5" aria-hidden="true" /> Gửi Reviewer
        </Button>
      </form>
    </Panel>
    </div>
  );
}