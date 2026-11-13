'use client';

import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { contractService } from '@/services/contractService';
import type { Contract } from '@/types/contract';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { CONTRACT_STATUS } from '../../lib/labels';
import { formatDateTime, formatVnd } from '@/lib/format';
import { parseVnd } from './CostRequestCard';
import { StatusPill } from '@/components/data/ui';

/** One round of a project's contract negotiation: the cost proposed (if any), the terms and who has signed so far. */
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
  const [signFile, setSignFile] = useState<File | null>(null);
  const [counterFile, setCounterFile] = useState<File | null>(null);
  const { busy, run } = useAction();
  const priceVnd = parseVnd(price);
  const docs = useResource(`contract-docs:${c.id}`, () => contractService.documents(c.id));

  const sign = async () => {
    if (await run(() => contractService.sign(c.id, signFile || undefined), 'Đã ký, hợp đồng hoàn tất')) {
      await docs.reload();
      await onChanged?.();
    }
  };
  const counter = async () => {
    if (!(priceVnd > 0)) return;
    if (await run(() => contractService.counter(c.id, priceVnd, counterFile || undefined), 'Đã gửi mức giá mới cho studio')) {
      setCountering(false);
      setPrice('');
      setCounterFile(null);
      await docs.reload();
      await onChanged?.();
    }
  };

  return (
    <li className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3.5 text-xs space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-slate-500 dark:text-slate-400">
          Vòng {c.round} · Studio {c.studio.name} · {formatDateTime(c.createdAt)}
        </p>
        <StatusPill {...CONTRACT_STATUS[c.status]} />
      </div>
      {c.costVnd !== null && (
        <p>
          Chi phí {c.proposedBy === 'ADMIN' ? 'Admin đề xuất' : 'Studio báo giá'}:{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-100">{formatVnd(c.costVnd)}</span>
        </p>
      )}
      {c.terms && <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">Điều khoản: {c.terms}</p>}
      <p className="text-slate-600 dark:text-slate-300">
        {c.studioSignedAt && `Studio ký lúc ${formatDateTime(c.studioSignedAt)}. `}
        {c.adminSignedAt && c.adminSignedBy && `${c.adminSignedBy.fullName} (Admin) ký lúc ${formatDateTime(c.adminSignedAt)}.`}
        {!c.studioSignedAt && !c.adminSignedAt && 'Chưa bên nào ký; chờ Studio điền giá và ký trên Studio Web.'}
      </p>
      {c.status === 'SIGNED' && c.handoff && (
        <p className="text-emerald-700 dark:text-emerald-300">Đã tự bàn giao cho Studio: dự án vào sản xuất, các tập chờ Studio nộp phim.</p>
      )}

      {docs.data && docs.data.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-white/5">
          <span className="text-slate-500 font-medium">Tài liệu PDF:</span>
          {docs.data.map((doc) => (
            <Button
              key={doc.id}
              type="button"
              variant="outline"
              size="sm"
              className="h-6 text-[11px] px-2 flex items-center gap-1"
              onClick={() => contractService.downloadDocument(c.id, doc.side, doc.fileName)}
            >
              <FileDown className="w-3 h-3" />
              {doc.side === 'FINAL' ? 'Bản hoàn tất (đủ 2 chữ ký)' : doc.side === 'STUDIO' ? 'Bản Studio đã ký' : 'Bản AI Cinema ký'}
            </Button>
          ))}
        </div>
      )}

      {canDecide && c.status === 'STUDIO_SIGNED' && !countering && (
        <div className="space-y-2 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-[11px] text-slate-500 font-medium">Bản PDF Admin ký (tuỳ chọn):</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              aria-label="File PDF ký"
              onChange={(e) => setSignFile(e.target.files?.[0] || null)}
              className="text-[11px] file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-slate-100 dark:file:bg-white/10"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={sign} disabled={busy}>
              Đồng ý &amp; ký
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setCountering(true)} disabled={busy}>
              Đề xuất giá khác
            </Button>
          </div>
        </div>
      )}

      {canDecide && c.status === 'STUDIO_SIGNED' && countering && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FormField label="Giá mới (₫)">
              <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className={fieldInputClass} aria-label="Giá mới" />
            </FormField>
            <FormField label="File PDF đề xuất ký (tuỳ chọn)">
              <input
                type="file"
                accept=".pdf,application/pdf"
                aria-label="File PDF đề xuất ký"
                onChange={(e) => setCounterFile(e.target.files?.[0] || null)}
                className="text-[11px] mt-1 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-slate-100 dark:file:bg-white/10"
              />
            </FormField>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={counter} disabled={busy || !(priceVnd > 0)}>
              Gửi studio
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setCountering(false)} disabled={busy}>
              Thôi
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
