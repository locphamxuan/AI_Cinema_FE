'use client';

import { useState } from 'react';
import { X, FileSignature, CheckCircle2, ShieldCheck, Key, Repeat, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { contractService } from '@/services/contractService';
import type { Contract } from '@/types/contract';
import { formatNumber } from '@/lib/format';
import { FormField, fieldInputClass } from '@/components/ui/FormField';

interface SignContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract | null;
  projectId?: string;
  onContractSigned?: () => void;
}

export function SignContractModal({
  isOpen,
  onClose,
  contract,
  projectId,
  onContractSigned,
}: SignContractModalProps) {
  const [isSigning, setIsSigning] = useState(false);
  const [isCountering, setIsCountering] = useState(false);
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterCostVnd, setCounterCostVnd] = useState('');
  const [digitalCertId] = useState('CERT-VN-AICINEMA-2026-9988');

  if (!isOpen) return null;

  const cost = contract?.costVnd ? Number(contract.costVnd) : 150_000_000;
  const studioName = contract?.studio?.name || 'Saigon VFX Studio Lab';

  // Admin agrees and signs
  const handleSign = async () => {
    setIsSigning(true);
    try {
      if (contract?.id) {
        await contractService.signContract(contract.id);
      }
      toast.success(
        'Ký Hợp Đồng B2B Thành Công!',
        `Hợp đồng sản xuất cùng ${studioName} đã có đủ 2 chữ ký số pháp lý và chính thức có hiệu lực.`
      );
      onContractSigned?.();
      onClose();
    } catch (err) {
      toast.error('Lỗi khi ký hợp đồng', err instanceof Error ? err.message : 'Vui lòng thử lại');
    } finally {
      setIsSigning(false);
    }
  };

  // Admin counters with a different cost
  const handleCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCost = Number(counterCostVnd);
    if (!newCost || newCost <= 0) {
      toast.error('Vui lòng nhập mức kinh phí hợp lệ');
      return;
    }

    setIsCountering(true);
    try {
      if (contract?.id) {
        await contractService.counterContract(contract.id, { costVnd: newCost });
      }
      toast.success(
        'Đã Đề Xuất Mức Kinh Phí Mới!',
        `Hệ thống đã tạo bản hợp đồng mới mức ${formatNumber(newCost)} VNĐ kèm chữ ký số Admin gửi lại Studio.`
      );
      onContractSigned?.();
      onClose();
    } catch (err) {
      toast.error('Lỗi khi gửi báo giá counter', err instanceof Error ? err.message : 'Vui lòng thử lại');
    } finally {
      setIsCountering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#111420] border border-white/[0.1] shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E50914]/20 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Ký Duyệt Hợp Đồng Điện Tử B2B</h3>
              <p className="text-xs text-slate-400">Hợp đồng gia công sản xuất video Master chuẩn OTT Điều 44</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contract Preview Content */}
        <div className="rounded-2xl bg-black/40 border border-white/[0.06] p-4 text-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
            <div>
              <span className="font-bold text-white uppercase text-[10px]">HỢP ĐỒNG SỐ: </span>
              <span className="font-mono text-[#E50914] font-bold">
                {contract ? `HĐ-${contract.id.slice(0, 8).toUpperCase()}` : 'HĐ-2026/AICINEMA-SGVFX-088'}
              </span>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">
              Vòng thương lượng: {contract?.round ?? 1}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-semibold">Bên A (Chủ quản nền tảng):</span>
              <p className="font-bold text-white text-xs">CÔNG TY CỔ PHẦN AI CINEMA</p>
              <p className="text-slate-400 text-[10px]">Đại diện: Executive Admin</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-semibold">Bên B (Studio đối tác gia công):</span>
              <p className="font-bold text-white text-xs">{studioName}</p>
              <p className="text-slate-400 text-[10px]">Tự trang bị AI & Phần cứng bên ngoài</p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            <h4 className="font-bold text-slate-200">Điều 1: Báo giá & Chi phí sản xuất (VNĐ)</h4>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <span className="text-slate-300">Chi phí đề xuất hiện tại:</span>
              <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                {formatNumber(cost)} VNĐ
              </span>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-white/[0.06]">
            <h4 className="font-bold text-slate-200">Điều 2: Tuân thủ pháp lý AI theo Điều 44 Luật Trí tuệ Nhân tạo</h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Studio cam kết tự chịu mọi chi phí AI bên ngoài (Runway, Midjourney, Kling, ElevenLabs), cung cấp danh mục model và prompt, chịu trách nhiệm pháp lý bản quyền.
            </p>
          </div>
        </div>

        {/* CA Digital Signature Badge */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-3 flex items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[10px] flex items-center gap-1.5 font-bold">
              <Key className="w-3 h-3 text-amber-400" />
              <span>Chứng Thư Số Xác Thực (Digital CA):</span>
            </span>
            <span className="font-mono text-slate-200 font-bold text-[11px]">{digitalCertId}</span>
          </div>

          <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
            <ShieldCheck className="w-3 h-3" />
            <span>Chữ Ký Hợp Lệ</span>
          </span>
        </div>

        {/* Counter Cost Form */}
        {showCounterInput ? (
          <form onSubmit={handleCounter} className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
            <FormField label="Nhập mức kinh phí Admin đề xuất lại (VNĐ)">
              <input
                type="number"
                min={1000000}
                step={1000000}
                value={counterCostVnd}
                onChange={(e) => setCounterCostVnd(e.target.value)}
                placeholder="Ví dụ: 130000000"
                required
                className={fieldInputClass}
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCounterInput(false)}
                className="px-3 py-1.5 rounded-lg border border-white/20 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Hủy đề xuất lại
              </button>
              <button
                type="submit"
                disabled={isCountering}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
              >
                {isCountering ? 'Đang gửi...' : 'Ký Số & Gửi Báo Giá Mới'}
              </button>
            </div>
          </form>
        ) : null}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => setShowCounterInput(!showCounterInput)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 text-slate-300 hover:text-white hover:bg-white/5 font-semibold text-xs transition-all cursor-pointer"
          >
            <Repeat className="w-3.5 h-3.5 text-purple-400" />
            <span>Đề Xuất Giá Khác</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/20 text-slate-300 hover:text-white hover:bg-white/5 font-semibold text-xs transition-all cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="button"
              disabled={isSigning}
              onClick={handleSign}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#B81D24] text-white text-xs font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <FileSignature className="w-4 h-4" />
              <span>{isSigning ? 'Đang xác thực ký số...' : 'Ký Số Đồng Ý & Kích Hoạt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
