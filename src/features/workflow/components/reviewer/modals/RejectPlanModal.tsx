import { Send } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormField, fieldTextareaClass } from '@/components/ui/FormField';

export interface RejectPlanModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  feedback: string;
  onFeedbackChange: (value: string) => void;
}

export function RejectPlanModal({ open, onClose, onConfirm, feedback, onFeedbackChange }: RejectPlanModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Yêu Cầu Hiệu Chỉnh Kế Hoạch" maxWidth="max-w-md">
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">Trả về cho Maker bổ sung kịch bản</p>

      <FormField label="Lý do & hướng dẫn:">
        <textarea
          rows={4}
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="Ví dụ: Kịch bản phân cảnh 2 chưa có prompt âm thanh rõ ràng, vui lòng bổ sung..."
          className={fieldTextareaClass}
        />
      </FormField>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Hủy bỏ
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          <Send className="w-3.5 h-3.5" /> Gửi Yêu Cầu Sửa
        </Button>
      </div>
    </Modal>
  );
}
