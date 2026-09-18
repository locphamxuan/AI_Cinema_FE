import { Zap, CheckCircle2 } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';

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

export function AllocateQuotaModal({ open, onClose, onConfirm, currentPackage, quota, onQuotaChange, notes, onNotesChange }: AllocateQuotaModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Cấp Phép Token Quota" maxWidth="max-w-md">
      <div className="flex items-center gap-3 -mt-1">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Zap className="w-5 h-5" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{currentPackage?.title}</p>
      </div>

      <FormField label="Số Token cấp phát:">
        <input
          type="number"
          value={quota}
          onChange={(e) => onQuotaChange(Number(e.target.value))}
          className={`${fieldInputClass} text-amber-600 dark:text-amber-400 font-mono font-bold`}
        />
      </FormField>

      <FormField label="Ghi chú thẩm định:">
        <textarea rows={3} value={notes} onChange={(e) => onNotesChange(e.target.value)} className={fieldTextareaClass} />
      </FormField>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Hủy bỏ
        </Button>
        <Button variant="success" onClick={onConfirm}>
          <CheckCircle2 className="w-3.5 h-3.5" /> Xác Nhận Cấp Quota
        </Button>
      </div>
    </Modal>
  );
}
