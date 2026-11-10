'use client';

import { useState } from 'react';
import { X, FileSignature, Building2 } from 'lucide-react';
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
  const { busy, run } = useAction();
  const offer = parseVnd(counter);
  // The dashboard row carries no budget; it is read only for the contract being opened.
  const costs = useResource(`costs:${project.id}`, () => productionService.getCosts(project.id));
  // A studio change's hand-off already holds the proposed fee; the signed cost replaces it (BE assertAffordable).
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
  const sign = async () => finish(await run(() => contractService.sign(c.id), waitsOnHandoff ? 'Đã ký, Studio mới bắt đầu sản xuất' : 'Đã ký, hợp đồng hoàn tất và dự án vào sản xuất'));
  const propose = async () => finish(await run(() => contractService.counter(c.id, offer), 'Đã gửi mức giá mới cho Studio'));

  return (
    <div role="dialog" aria-modal="true" aria-label="Ký duyệt hợp đồng" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#111420] border border-white/[0.1] shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E50914]/20 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Ký Duyệt Hợp Đồng Studio</h3>
              <p className="text-xs text-slate-400">Vòng {c.round} · Studio ký lúc {formatDateTime(c.studioSignedAt)}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-xl bg-black/40 border border-white/[0.06] p-4 text-xs space-y-3">
          <p className="font-bold text-white text-sm">{project.title}</p>
          <p className="flex items-center gap-1.5 text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Studio: <strong className="text-white">{c.studio.name}</strong>
          </p>
          <p className="text-slate-300">
            Giá Studio đề xuất: <strong className="text-emerald-400 font-mono text-sm">{formatVnd(c.costVnd)}</strong>
            <span className="text-slate-400"> · ngân sách còn lại {remainingVnd !== null ? formatVnd(remainingVnd) : readError ? 'không đọc được' : 'đang tải…'}</span>
          </p>
          <div className="pt-2 border-t border-white/[0.06]">
            <h4 className="font-bold text-slate-200 mb-1">Điều khoản</h4>
            <p className="text-slate-300 whitespace-pre-line leading-relaxed">{c.terms}</p>
          </div>
        </div>

        <label className="block text-xs space-y-1.5">
          <span className="font-bold text-slate-200">Hoặc đề xuất giá khác (₫, bội số 1.000, tối đa ngân sách còn lại)</span>
          <input
            inputMode="numeric"
            value={counter}
            onChange={(e) => setCounter(e.target.value)}
            aria-label="Giá đề xuất mới"
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#E50914]"
          />
          {readError && <span role="alert" className="block text-rose-400">{readError} Chưa thể đề xuất giá khác; vẫn có thể ký theo giá Studio.</span>}
        </label>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-white/20 text-slate-300 hover:text-white hover:bg-white/5 font-semibold text-xs cursor-pointer">
            Đóng
          </button>
          <button type="button" disabled={busy || !offerValid} onClick={propose} className="px-4 py-2 rounded-xl border border-[#E50914]/40 text-white hover:bg-white/5 font-semibold text-xs cursor-pointer disabled:opacity-50">
            Gửi giá đề xuất
          </button>
          <button type="button" disabled={busy || c.costVnd === null} onClick={sign} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#B81D24] text-white text-xs font-bold shadow-lg cursor-pointer disabled:opacity-50">
            <FileSignature className="w-4 h-4" /> Đồng ý &amp; ký
          </button>
        </div>
      </div>
    </div>
  );
}
