'use client';

import { useState } from 'react';
import { FileSignature, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { formatDateTime, formatVnd } from '@/lib/format';
import { parseVnd } from '@/features/production/components/shared/CostRequestCard';
import { contractService } from '@/services/contractService';
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
  const offerValid = remainingVnd !== null && offer > 0 && offer <= remainingVnd;
  const readError = costs.error ?? handoffs.error;

  const finish = async (done: unknown) => {
    if (!done) return;
    await onChanged();
    onClose();
  };
  const sign = async () =>
    finish(
      await run(
        () => contractService.sign(c.id, signFile || undefined),
        waitsOnHandoff ? 'Đã ký, Studio mới bắt đầu sản xuất' : 'Đã ký, hợp đồng hoàn tất và dự án vào sản xuất',
      ),
    );
  const propose = async () => finish(await run(() => contractService.counter(c.id, offer, signFile || undefined), 'Đã gửi mức giá mới cho Studio'));

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth="max-w-2xl"
      icon={<FileSignature className="w-5 h-5" />}
      title="Ký duyệt hợp đồng Studio"
      subtitle={`Vòng ${c.round} · Studio ký lúc ${formatDateTime(c.studioSignedAt)}`}
    >
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.03] p-4 text-xs space-y-3">
        <p className="font-bold text-slate-900 dark:text-white text-sm">{project.title}</p>
        <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-slate-400" /> Studio: <strong className="text-slate-900 dark:text-white">{c.studio.name}</strong>
        </p>
        <p className="text-slate-600 dark:text-slate-300">
          Giá Studio đề xuất: <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{formatVnd(c.costVnd)}</strong>
          <span className="text-slate-500 dark:text-slate-400"> · ngân sách còn lại {remainingVnd !== null ? formatVnd(remainingVnd) : readError ? 'không đọc được' : 'đang tải…'}</span>
        </p>
        <div className="pt-2.5 border-t border-slate-200/80 dark:border-white/[0.06]">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Điều khoản</h4>
          <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">{c.terms}</p>
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
          placeholder="Ví dụ: 150000000"
          className={fieldInputClass}
        />
      </FormField>

      <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-white/[0.06] text-xs">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-800 dark:text-slate-200">File PDF hợp đồng đã ký của AI Cinema</label>
          <button
            type="button"
            className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            onClick={() => contractService.downloadDocument(c.id, 'STUDIO')}
          >
            Tải bản Studio đã ký (PDF)
          </button>
        </div>
        <input
          type="file"
          accept=".pdf,application/pdf"
          aria-label="File PDF đã ký"
          onChange={(e) => setSignFile(e.target.files?.[0] || null)}
          className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
        <Button type="button" variant="secondary" onClick={onClose} className="rounded-full">
          Đóng
        </Button>
        <Button type="button" variant="secondary" disabled={busy || !offerValid} onClick={propose} className="rounded-full">
          Gửi giá đề xuất
        </Button>
        <Button type="button" disabled={busy || c.costVnd === null} onClick={sign} className="rounded-full bg-[#121212] text-white hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
          <FileSignature className="w-4 h-4" /> Đồng ý &amp; ký
        </Button>
      </div>
    </Modal>
  );
}
