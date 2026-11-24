'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { MAX_CONTRACT_VND, contractService } from '@/services/contractService';
import { toast } from '@/components/ui/Toast';
import { SignatureImageInput } from './SignatureImageInput';
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
  /** Admin and Reviewer may download the signed copies (BE CONTRACT_DOCUMENT_READ). */
  canDownload?: boolean;
  /** The cost of a round; hidden from Creators, who never see production costs. */
  showCost?: boolean;
  onChanged?: () => Promise<unknown>;
}) {
  const [countering, setCountering] = useState(false);
  const [confirming, setConfirming] = useState<'sign' | 'counter' | null>(null);
  const [price, setPrice] = useState('');
  const [signFile, setSignFile] = useState<File | null>(null);
  const [counterFile, setCounterFile] = useState<File | null>(null);
  const { busy, run } = useAction({ onStale: onChanged });
  const priceVnd = parseVnd(price);
  const docs = useResource(canDownload ? `contract-docs:${c.id}` : null, () => contractService.documents(c.id));
  const priceProblem = !price.trim()
    ? null
    : !(priceVnd > 0)
      ? 'Nhập số tiền dương, là bội số của 1.000 ₫ (ví dụ 120.000.000).'
      : priceVnd > MAX_CONTRACT_VND
        ? `Tối đa ${formatVnd(MAX_CONTRACT_VND)}.`
        : priceVnd === c.costVnd
          ? 'Giá này bằng giá Studio đề xuất; hãy bấm "Đồng ý và ký".'
          : null;

  const canSign = canDecide && c.status === 'STUDIO_SIGNED';
  // BE ADMIN_OFFER_FROM: the Admin may propose a cost before the studio filled one (SENT) or after it signed.
  const canCounter = canDecide && (c.status === 'SENT' || c.status === 'STUDIO_SIGNED');
  const priceOk = priceVnd > 0 && priceVnd <= MAX_CONTRACT_VND && priceVnd !== c.costVnd;
  const downloadTemplate = async () => {
    if (!(await contractService.downloadTemplate(c))) toast.error('Không tải được hợp đồng', 'Thử lại sau.');
  };
  const download = async (side: 'ADMIN' | 'STUDIO' | 'FINAL', fileName: string) => {
    if (!(await contractService.downloadDocument(c.id, side, fileName))) toast.error('Không tải được bản hợp đồng', 'Thử lại sau.');
  };

  const sign = async () => {
    if (!signFile) return;
    if (await run(() => contractService.sign(c.id, signFile), 'Đã ký, hợp đồng hoàn tất')) {
      setConfirming(null);
      await docs.reload();
      await onChanged?.();
    }
  };
  const counter = async () => {
    if (!priceOk || !counterFile) return;
    if (await run(() => contractService.counter(c.id, priceVnd, counterFile), 'Đã gửi mức giá mới cho Studio')) {
      setConfirming(null);
      setCountering(false);
      setPrice('');
      setCounterFile(null);
      await docs.reload();
      await onChanged?.();
    }
  };

  return (
    <li className="rounded-xl border border-border bg-muted/60 p-3.5 text-xs space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground">
          Vòng {c.round} · Studio {c.studio.name} · {formatDateTime(c.createdAt)}
        </p>
        <StatusPill {...CONTRACT_STATUS[c.status]} />
      </div>
      {showCost && c.costVnd !== null && (
        <p>
          Chi phí {c.proposedBy === 'ADMIN' ? 'Admin đề xuất' : 'Studio báo giá'}:{' '}
          <span className="font-semibold text-foreground">{formatVnd(c.costVnd)}</span>
        </p>
      )}
      {c.terms && <p className="whitespace-pre-line text-muted-foreground">Điều khoản: {c.terms}</p>}
      <p className="text-muted-foreground">
        {c.studioSignedAt && `Studio ký lúc ${formatDateTime(c.studioSignedAt)}. `}
        {c.adminSignedAt && c.adminSignedBy && `${c.adminSignedBy.fullName} (Admin) ký lúc ${formatDateTime(c.adminSignedAt)}.`}
        {!c.studioSignedAt && !c.adminSignedAt && 'Chưa bên nào ký; chờ Studio ký trên Studio Web (giá in sẵn là ngân sách tối đa).'}
      </p>
      {c.status === 'SIGNED' && c.handoff && (
        <p className="text-emerald-700 dark:text-emerald-300">Đã tự động giao việc cho Studio: dự án vào sản xuất, các tập chờ Studio nộp phim.</p>
      )}

      {canDownload && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
          <span className="text-muted-foreground font-medium">Bản hợp đồng (cùng mẫu):</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-6 text-[11px] px-2 flex items-center gap-1"
            onClick={() => void downloadTemplate()}
          >
            Hợp đồng chưa ký (bản Studio nhận)
          </Button>
          {docs.data?.map((doc) => (
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
          {canSign && <SignatureImageInput label="Ảnh chữ ký AI Cinema (ký theo giá Studio)" onChange={setSignFile} />}
          <div className="flex flex-wrap gap-2">
            {canSign && (
              <Button
                type="button"
                size="sm"
                onClick={() => setConfirming('sign')}
                disabled={busy || !signFile}
              >
                Đồng ý và ký
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
            <SignatureImageInput label="Ảnh chữ ký AI Cinema cho giá mới" onChange={setCounterFile} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setCountering(false)} disabled={busy}>
              Huỷ
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setConfirming('counter')}
              disabled={busy || !priceOk || !counterFile}
            >
              Gửi giá cho Studio
            </Button>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirming === 'counter'}
        title="Ký hợp đồng với giá mới"
        description="Hệ thống đặt ảnh chữ ký AI Cinema vào hợp đồng với giá mới và gửi vòng mới cho Studio trên Studio Web."
        details={[
          ['Studio', c.studio.name],
          ['Giá hiện tại', c.costVnd !== null ? formatVnd(c.costVnd) : 'Ngân sách tối đa'],
          ['Giá mới', formatVnd(priceVnd)],
        ]}
        consequence="vòng này khép lại; Studio ký đồng ý hoặc trả giá khác. Chữ ký đã gửi không rút lại được."
        confirmLabel="Ký và gửi giá"
        busy={busy}
        onClose={() => setConfirming(null)}
        onConfirm={() => void counter()}
      />
      <ConfirmModal
        open={confirming === 'sign'}
        title="Đồng ý giá và ký hợp đồng"
        description="Hệ thống đặt ảnh chữ ký AI Cinema vào ô Bên A của bản hợp đồng Studio đã ký."
        details={[
          ['Studio', c.studio.name],
          ['Vòng', `Vòng ${c.round}`],
          ['Giá ký', c.costVnd !== null ? formatVnd(c.costVnd) : 'Ngân sách tối đa'],
        ]}
        consequence={`hợp đồng đủ 2 chữ ký, dự án chuyển sang Đang sản xuất và tự động giao việc cho ${c.studio.name} với phí bằng giá ký. Không thể hoàn tác.`}
        confirmLabel="Đồng ý và ký"
        busy={busy}
        onClose={() => setConfirming(null)}
        onConfirm={() => void sign()}
      />
    </li>
  );
}
