'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { contractService } from '@/services/contractService';
import type { Contract } from '@/types/contract';
import { useAction } from '@/hooks/useAction';
import { CONTRACT_STATUS } from '../../lib/labels';
import { formatDateTime, formatVnd } from '@/lib/format';
import { parseVnd } from './CostRequestCard';
import { StatusPill } from '@/components/data/ui';

/** One round of a hand-off's contract negotiation: the cost proposed (if any) and who has signed so far. */
export function ContractCard({
  contract: c,
  canDecide = false,
  onChanged,
}: {
  contract: Contract;
  /** Admin may sign (agree) or counter-propose (disagree) a round the studio just signed. */
  canDecide?: boolean;
  onChanged?: () => Promise<unknown>;
}) {
  const [countering, setCountering] = useState(false);
  const [price, setPrice] = useState('');
  const { busy, run } = useAction();
  const priceVnd = parseVnd(price);

  const sign = async () => {
    if (await run(() => contractService.sign(c.id), 'Đã ký, hợp đồng hoàn tất')) await onChanged?.();
  };
  const counter = async () => {
    if (!(priceVnd > 0)) return;
    if (await run(() => contractService.counter(c.id, priceVnd), 'Đã gửi mức giá mới cho studio')) {
      setCountering(false);
      setPrice('');
      await onChanged?.();
    }
  };

  return (
    <li className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3.5 text-xs space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-slate-500 dark:text-slate-400">
          Vòng {c.round} · Studio {c.handoff.studio.name} · {formatDateTime(c.createdAt)}
        </p>
        <StatusPill {...CONTRACT_STATUS[c.status]} />
      </div>
      {c.costVnd !== null && (
        <p>
          Chi phí {c.proposedBy === 'ADMIN' ? 'Admin đề xuất' : 'Studio báo giá'}:{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-100">{formatVnd(c.costVnd)}</span>
        </p>
      )}
      <p className="text-slate-600 dark:text-slate-300">
        {c.studioSignedAt && `Studio ký lúc ${formatDateTime(c.studioSignedAt)}. `}
        {c.adminSignedAt && c.adminSignedBy && `${c.adminSignedBy.fullName} (Admin) ký lúc ${formatDateTime(c.adminSignedAt)}.`}
        {!c.studioSignedAt && !c.adminSignedAt && 'Chưa bên nào ký.'}
      </p>
      {canDecide && c.status === 'STUDIO_SIGNED' && !countering && (
        <div className="flex gap-2 pt-1">
          <Button type="button" size="sm" onClick={sign} disabled={busy}>
            Đồng ý &amp; ký
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => setCountering(true)} disabled={busy}>
            Đề xuất giá khác
          </Button>
        </div>
      )}
      {canDecide && c.status === 'STUDIO_SIGNED' && countering && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end pt-1">
          <FormField label="Giá mới (₫)">
            <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className={fieldInputClass} aria-label="Giá mới" />
          </FormField>
          <Button type="button" size="sm" onClick={counter} disabled={busy || !(priceVnd > 0)}>
            Gửi studio
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => setCountering(false)} disabled={busy}>
            Thôi
          </Button>
        </div>
      )}
    </li>
  );
}
