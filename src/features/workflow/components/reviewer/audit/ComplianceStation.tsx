import { ShieldCheck, CheckCircle2, Check, BadgeCheck } from 'lucide-react';
import type { DisplayLocation } from '@/types/workflow';

export interface ComplianceStationProps {
  isCompliancePassed: boolean;
  isPassingCompliance: boolean;
  article44Passed: boolean;
  onArticle44Change: (value: boolean) => void;
  decree142Passed: boolean;
  onDecree142Change: (value: boolean) => void;
  watermarkVerified: boolean;
  onWatermarkChange: (value: boolean) => void;
  certificationId?: string;
  displayLocation: DisplayLocation;
  onConfirm: () => void;
}

export function ComplianceStation({
  isCompliancePassed,
  isPassingCompliance,
  article44Passed,
  onArticle44Change,
  decree142Passed,
  onDecree142Change,
  watermarkVerified,
  onWatermarkChange,
  certificationId,
  displayLocation,
  onConfirm,
}: ComplianceStationProps) {
  return (
    <div className="bg-white dark:bg-[#161922] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kiểm định Pháp lý AI</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Điều 44 Luật AI & Nghị định 142/2024</p>
          </div>
        </div>
        {isCompliancePassed ? (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> ĐẠT CHUẨN
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 text-[11px] font-bold">
            CHỜ DUYỆT
          </span>
        )}
      </div>

      <div className="space-y-2.5 text-xs">
        <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition">
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-900 dark:text-white">Điều 44: Nhãn dán định danh AI</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Hiển thị thông báo nội dung do AI tạo ở 5s đầu</p>
          </div>
          <input type="checkbox" checked={article44Passed} onChange={(e) => onArticle44Change(e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition">
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-900 dark:text-white">Nghị định 142: Dấu mờ bản quyền AI</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Đã nhúng mã xác thực watermark ẩn trong luồng video</p>
          </div>
          <input type="checkbox" checked={decree142Passed} onChange={(e) => onDecree142Change(e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition">
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-900 dark:text-white">An toàn nội dung (Content Moderation)</span>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Điểm an toàn: 99.4% (Không vi phạm bản quyền/NSFW)</p>
          </div>
          <input type="checkbox" checked={watermarkVerified} onChange={(e) => onWatermarkChange(e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded" />
        </label>
      </div>

      <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 space-y-2">
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Mô phỏng nhãn định danh phát hành:</span>
          <span className="text-purple-600 dark:text-purple-400 font-mono text-[10px]">DECREE_142_2024_V1</span>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-500/30 p-2.5 rounded-lg text-xs space-y-1">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <BadgeCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            AI CONTENT CERTIFIED
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Mã chứng chỉ: <span className="font-mono text-purple-600 dark:text-purple-400">{certificationId || 'AI-VN-2026-CINEMA-1042-EP2'}</span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Vị trí hiển thị: {displayLocation === 'INTRO_OUTRO' ? 'Đầu & Cuối phim (5s)' : 'Watermark toàn thời lượng'}
          </p>
        </div>
      </div>

      <button
        onClick={onConfirm}
        disabled={isPassingCompliance || isCompliancePassed}
        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
          isCompliancePassed
            ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 cursor-default'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
        }`}
      >
        {isPassingCompliance ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Đang lưu chứng nhận...
          </>
        ) : isCompliancePassed ? (
          <>
            <CheckCircle2 className="w-4 h-4" /> Đã xác nhận Đạt chuẩn Pháp lý AI
          </>
        ) : (
          <>
            <Check className="w-4 h-4" /> Xác nhận Đạt chuẩn Pháp lý AI (Pass Compliance)
          </>
        )}
      </button>
    </div>
  );
}
