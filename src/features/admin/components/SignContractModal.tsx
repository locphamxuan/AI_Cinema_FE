'use client';

import { useState } from 'react';
import { X, FileSignature, CheckCircle2, Building2, ShieldCheck, Download, Key } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface SignContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContractSigned: () => void;
}

export function SignContractModal({
  isOpen,
  onClose,
  onContractSigned,
}: SignContractModalProps) {
  const [isSigning, setIsSigning] = useState(false);
  const [digitalCertId, setDigitalCertId] = useState('CERT-VN-AICINEMA-2026-9988');

  if (!isOpen) return null;

  const handleSign = () => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      onContractSigned();
      toast.success(
        'Ký Hợp Đồng B2B Thành Công!',
        'Hợp đồng sản xuất phim "Cyber Saigon 2077" cùng Saigon VFX Studio đã có hiệu lực pháp lý số và kích hoạt ngân sách đặt cọc.'
      );
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#111420] border border-white/[0.1] shadow-2xl p-6 sm:p-7 space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E50914]/20 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Ký Duyệt Hợp Đồng Điện Tử B2B</h3>
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
        <div className="rounded-xl bg-black/40 border border-white/[0.06] p-4 text-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
            <div>
              <span className="font-bold text-white uppercase text-[11px]">HỢP ĐỒNG KINH TẾ SỐ: </span>
              <span className="font-mono text-[#E50914] font-bold">HĐ-2026/AICINEMA-SGVFX-088</span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">Ngày lập: 07/11/2026</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold">Bên A (Chủ quản nền tảng):</span>
              <p className="font-bold text-white">CÔNG TY CỔ PHẦN ĐIỆN ẢNH SỐ AI CINEMA</p>
              <p className="text-slate-400 text-[11px]">Đại diện: Ban Điều Hành Executive Admin</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold">Bên B (Studio đối tác gia công):</span>
              <p className="font-bold text-white">SAIGON VFX STUDIO LAB</p>
              <p className="text-slate-400 text-[11px]">Mã số thuế: 0317889922 • Đại diện: Lê Tuấn Anh</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <h4 className="font-bold text-slate-200">Điều 1: Nội dung dự án & Báo giá sản xuất</h4>
            <ul className="space-y-1 text-slate-300 pl-4 list-disc">
              <li><strong>Tên dự án:</strong> Cyber Saigon 2077 (Trọn bộ 5 tập phim chuẩn 4K UHD Master).</li>
              <li><strong>Kịch bản:</strong> Bàn giao bản Final Draft từ In-house Creator Lê Minh Châu.</li>
              <li><strong>Tổng kinh phí gia công:</strong> <strong className="text-emerald-400 font-mono text-sm">150,000,000 VND</strong> (Đã bao gồm thuế GTGT & chi phí AI Compute).</li>
              <li><strong>Tiến độ hoàn thành:</strong> Bàn giao bản Master Version 2 trong vòng 30 ngày kể từ ngày ký.</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <h4 className="font-bold text-slate-200">Điều 2: Tuân thủ pháp lý AI theo Điều 44 Luật Trí tuệ Nhân tạo</h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Studio cam kết cung cấp toàn bộ danh mục model AI (Runway Gen-3, Midjourney v6, ElevenLabs) kèm mã hash xác thực,
              chịu trách nhiệm hoàn toàn về bản quyền prompt và giọng nói diễn viên. Reviewer của Bên A sẽ kiểm định và đóng dấu trước khi xuất bản.
            </p>
          </div>
        </div>

        {/* Chữ Ký Số & Token Token */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-bold">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Chứng Thư Số Điện Tử Xác Thực (Token Key):</span>
            </span>
            <span className="font-mono text-slate-200 font-bold">{digitalCertId}</span>
          </div>

          <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Chữ Ký Hợp Lệ</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
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
            <span>{isSigning ? 'Đang xác thực ký số...' : 'Ký Số & Phê Duyệt Hợp Đồng'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
