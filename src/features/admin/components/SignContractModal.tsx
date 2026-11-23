'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { formatDateTime, formatVnd } from '@/lib/format';
import { parseVnd } from '@/features/production/components/shared/CostRequestCard';
import { MAX_CONTRACT_VND, contractService } from '@/services/contractService';
import { toast } from '@/components/ui/Toast';
import { SignatureImageInput } from '@/features/production/components/shared/SignatureImageInput';
import { productionService } from '@/services/productionService';
import { studioService } from '@/services/studioService';
import type { ContractToSign } from '../adminPipeline';

/** The round the studio signed: the Admin signs to agree (the system then hands off) or proposes another cost. */
export function SignContractModal({ item, onClose, onChanged }: { item: ContractToSign; onClose: () => void; onChanged: () => Promise<void> }) {
  const { contract: c, project } = item;
  const [counter, setCounter] = useState('');
  const [signFile, setSignFile] = useState<File | null>(null);
  const { busy, run } = useAction();
  const offer = parseVnd(counter);
  const costs = useResource(`costs:${project.id}`, () => productionService.getCosts(project.id));
  const waitsOnHandoff = !!c.handoffId && c.handoff?.milestoneStatus === 'BRIEF_SENT';
  const handoffs = useResource(waitsOnHandoff ? `handoffs:${project.id}` : null, () => studioService.listHandoffs(project.id));
  const heldVnd = waitsOnHandoff ? Number(handoffs.data?.find((h) => h.id === c.handoffId)?.offeredFeeVnd ?? Number.NaN) : 0;
  const left = costs.data ? costs.data.remainingVnd + heldVnd : null;
  const remainingVnd = left !== null && !Number.isNaN(left) ? left : null;
  const offerValid = remainingVnd !== null && offer > 0 && offer <= Math.min(remainingVnd, MAX_CONTRACT_VND);
  const fileOk = !!signFile;
  const readError = costs.error ?? handoffs.error;

  const finish = async (done: unknown) => {
    if (!done) return;
    await onChanged();
    onClose();
  };
  const sign = async () =>
    fileOk &&
    finish(
      await run(
        () => contractService.sign(c.id, signFile!),
        waitsOnHandoff ? 'Đã ký, Studio mới bắt đầu sản xuất' : 'Đã ký, hợp đồng hoàn tất và dự án vào sản xuất',
      ),
    );
  const propose = async () =>
    fileOk && finish(await run(() => contractService.counter(c.id, offer, signFile!), 'Đã gửi mức giá mới cho Studio'));
  const downloadStudio = async () => {
    if (!(await contractService.downloadDocument(c.id, 'STUDIO'))) toast.error('Không tải được bản Studio đã ký', 'Thử lại sau.');
  };

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth="max-w-2xl"
      title="Ký duyệt hợp đồng Studio"
      subtitle={`Vòng ${c.round} · Studio ký lúc ${formatDateTime(c.studioSignedAt)}`}
    >
      <div className="rounded-2xl border border-border bg-muted/60 p-4 text-xs space-y-3">
        <p className="font-bold text-foreground text-sm">{project.title}</p>
        <p className="flex items-center gap-1.5 text-muted-foreground">
          Studio: <strong className="text-foreground">{c.studio.name}</strong>
        </p>
        <p className="text-muted-foreground">
          Giá Studio đề xuất: <strong className="text-emerald-600 dark:text-emerald-400 tabular-nums text-sm">{formatVnd(c.costVnd)}</strong>
          <span className="text-muted-foreground"> · ngân sách còn lại {remainingVnd !== null ? formatVnd(remainingVnd) : readError ? 'không đọc được' : 'đang tải…'}</span>
        </p>
        <div className="pt-2.5 border-t border-border">
          <h4 className="font-semibold text-foreground mb-1">Điều khoản</h4>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{c.terms}</p>
        </div>
      </div>

      <FormField
        label="Hoặc đề xuất giá khác (₫, bội số 1.000, tối đa ngân sách còn lại)"
        error={readError ? `${readError} Chưa thể đề xuất giá khác; vẫn có thể ký theo giá Studio.` : null}
      >
        <input
          inputMode="numeric"
          value={counter}
          onChange={(e) => setCounter(e.target.value)}
          aria-label="Giá đề xuất mới"
          placeholder="Ví dụ: 150.000.000"
          className={fieldInputClass}
        />
      </FormField>

      <div className="space-y-2 border-t border-border pt-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">Đọc bản Studio đã ký trước khi ký hoặc đề xuất giá. Bản đủ hai chữ ký có cùng mẫu với bản này.</span>
          <Button type="button" size="sm" variant="ghost" onClick={() => void downloadStudio()}>
            Tải bản Studio ký
          </Button>
        </div>
        <SignatureImageInput label="Ảnh chữ ký AI Cinema (ký theo giá Studio, hoặc cho giá mới bạn đề xuất)" onChange={setSignFile} />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-border">
        <Button type="button" variant="secondary" onClick={onClose} className="rounded-full">
          Đóng
        </Button>
        <Button type="button" variant="secondary" disabled={busy || !offerValid || !fileOk} onClick={propose} className="rounded-full">
          Gửi giá đề xuất
        </Button>
        <Button type="button" disabled={busy || c.costVnd === null || !fileOk} onClick={sign} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          Đồng ý và ký
        </Button>
      </div>
    </Modal>
  );
}
