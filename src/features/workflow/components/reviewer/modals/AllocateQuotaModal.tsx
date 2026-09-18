import { Zap, CheckCircle2, Coins, Minus, Plus } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';

export interface AllocateQuotaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPackage?: EpisodePackage;
  quota: number;
  onQuotaChange: (value: number) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

const QUICK_QUOTA_PRESETS = [300, 450, 600, 1000];

export function AllocateQuotaModal({ open, onClose, onConfirm, currentPackage, quota, onQuotaChange, notes, onNotesChange }: AllocateQuotaModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cấp Phép Token Quota"
      subtitle="Phân bổ hạn ngạch ngân sách sinh video AI cho tập phim"
      icon={<Zap className="w-4 h-4 text-emerald-500" />}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs">
        {/* Package banner */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-zinc-500">Tập phim mục tiêu</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{currentPackage?.title || 'Tập phim'}</p>
          </div>
        </div>

        {/* Quota Input with Stepper */}
        <div className="space-y-2 bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-500" /> Số Token Cấp Phát:
            </label>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              {quota.toLocaleString()} Tokens
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onQuotaChange(Math.max(50, quota - 50))}
              className="w-9 h-9 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/15 transition cursor-pointer shrink-0"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <input
                type="number"
                min={50}
                step={50}
                value={quota}
                onChange={(e) => onQuotaChange(Math.max(50, Number(e.target.value)))}
                className={`${fieldInputClass} text-center text-amber-600 dark:text-amber-400 font-mono font-black text-base py-1.5`}
              />
            </div>
            <button
              type="button"
              onClick={() => onQuotaChange(quota + 50)}
              className="w-9 h-9 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/15 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">Mẫu:</span>
            {QUICK_QUOTA_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onQuotaChange(p)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition cursor-pointer ${
                  quota === p
                    ? 'bg-amber-500 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/15'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-slate-700 dark:text-zinc-300 mb-1.5 text-xs font-bold">
            Ghi Chú Thẩm Định & Hướng Dẫn:
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Nhập ghi chú hoặc yêu cầu kỹ thuật cho Creator..."
            className={fieldTextareaClass}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
          <Button variant="secondary" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold">
            Hủy Bỏ
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Xác Nhận Cấp Quota</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

