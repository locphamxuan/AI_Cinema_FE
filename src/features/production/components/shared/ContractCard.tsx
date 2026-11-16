'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { MAX_CONTRACT_VND, contractPdfProblem, contractService } from '@/services/contractService';
import { toast } from '@/components/ui/Toast';
import { ContractPdfInput } from './ContractPdfInput';
import type { Contract } from '@/types/contract';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { CONTRACT_STATUS } from '../../lib/labels';
import { formatDateTime, formatVnd } from '@/lib/format';
import { parseVnd } from './CostRequestCard';
import { StatusPill } from '@/components/data/ui';
import { ConfirmModal } from '@/components/data/ConfirmModal';

/** One round of a project's contract negotiation: the cost proposed (if any), the terms and who has signed so far. */
export function ContractCard({
  contract: c,
  canDecide = false,
  canDownload = false,
  showCost = true,
  onChanged,
}: {
  contract: Contract;
  /** Admin may sign (agree) or counter-propose (disagree) a round the studio just signed. */
  canDecide?: boolean;
  /** Admin and Reviewer may download the signed PDFs (BE CONTRACT_DOCUMENT_READ). */
  canDownload?: boolean;
  /** The cost of a round; hidden from Creators, who never see production costs. */
  showCost?: boolean;
  onChanged?: () => Promise<unknown>;
}) {
  const [countering, setCountering] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [price, setPrice] = useState('');
  const [signFile, setSignFile] = useState<File | null>(null);
  const [counterFile, setCounterFile] = useState<File | null>(null);
  const { busy, run } = useAction();
  const priceVnd = parseVnd(price);
  const docs = useResource(canDownload ? `contract-docs:${c.id}` : null, () => contractService.documents(c.id));
  const priceProblem = !price.trim()
    ? null
    : !(priceVnd > 0)
      ? 'Nhập số tiền dương, là bội số của 1.000 ₫ (ví dụ 120.000.000).'
      : priceVnd > MAX_CONTRACT_VND
        ? `Tối đa ${formatVnd(MAX_CONTRACT_VND)}.`
        : null;

  const canSign = canDecide && c.status === 'STUDIO_SIGNED';
  // BE ADMIN_OFFER_FROM: the Admin may propose a cost before the studio filled one (SENT) or after it signed.
  const canCounter = canDecide && (c.status === 'SENT' || c.status === 'STUDIO_SIGNED');
  const download = async (side: 'ADMIN' | 'STUDIO' | 'FINAL', fileName: string) => {
    if (!(await contractService.downloadDocument(c.id, side, fileName))) toast.error('Không tải được file PDF', 'Thử lại sau.');
  };

  const sign = async () => {
    if (!signFile || contractPdfProblem(signFile)) return;
    if (await run(() => contractService.sign(c.id, signFile), 'Đã ký, hợp đồng hoàn tất')) {
      setConfirming(false);
      await docs.reload();
      await onChanged?.();
    }
  };
  const counter = async () => {
    if (!(priceVnd > 0) || priceVnd > MAX_CONTRACT_VND || !counterFile || contractPdfProblem(counterFile)) return;
    if (await run(() => contractService.counter(c.id, priceVnd, counterFile), 'Đã gửi mức giá mới cho studio')) {
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
      {showCost && c.costVnd !== null && (
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
              variant="secondary"
              size="sm"
              className="h-6 text-[11px] px-2 flex items-center gap-1"
              onClick={() => void download(doc.side, doc.fileName)}
            >
              {doc.side === 'FINAL' ? 'Bản hoàn tất (đủ 2 chữ ký)' : doc.side === 'STUDIO' ? 'Bản Studio đã ký' : 'Bản AI Cinema ký'}
            </Button>
          ))}
        </div>
      )}

      {(canSign || canCounter) && !countering && (
        <div className="space-y-2.5 border-t border-border pt-2.5">
          {canSign && <ContractPdfInput label="Bản PDF Admin đã ký theo giá Studio" file={signFile} onChange={setSignFile} />}
          <div className="flex flex-wrap gap-2">
            {canSign && (
              <Button
                type="button"
                size="sm"
                onClick={() => setConfirming(true)}
                disabled={busy || !signFile || !!contractPdfProblem(signFile)}
              >
                Đồng ý &amp; ký
              </Button>
            )}
            <Button type="button" size="sm" variant="secondary" onClick={() => setCountering(true)} disabled={busy}>
              Đề xuất giá khác
            </Button>
          </div>
        </div>
      )}

      {canCounter && countering && (
        <div className="space-y-2.5 border-t border-border pt-2.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Giá mới (₫)" hint="Bội số của 1.000 ₫." error={priceProblem}>
              <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className={fieldInputClass} aria-label="Giá mới" />
            </FormField>
            <ContractPdfInput label="Bản PDF đã ký cho giá mới" file={counterFile} onChange={setCounterFile} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setCountering(false)} disabled={busy}>
              Huỷ
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={counter}
              disabled={busy || !(priceVnd > 0) || priceVnd > MAX_CONTRACT_VND || !counterFile || !!contractPdfProblem(counterFile)}
            >
              Gửi giá cho Studio
            </Button>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirming}
        title="Đồng ý giá và ký hợp đồng"
        description={`Ký theo giá Studio báo${c.costVnd !== null ? ` (${formatVnd(c.costVnd)})` : ''}. Hợp đồng hoàn tất và dự án tự bàn giao cho Studio ${c.studio.name}; không thể hoàn tác.`}
        confirmLabel="Đồng ý & ký"
        busy={busy}
        onClose={() => setConfirming(false)}
        onConfirm={() => void sign()}
      />
    </li>
  );
}
