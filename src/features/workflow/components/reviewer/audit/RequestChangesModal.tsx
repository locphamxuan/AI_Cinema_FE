import { Send } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormField, fieldTextareaClass } from '@/components/ui/FormField';

export interface RequestChangesModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  feedback: string;
  onFeedbackChange: (value: string) => void;
}

export function RequestChangesModal({ open, onClose, onConfirm, feedback, onFeedbackChange }: RequestChangesModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Yêu cầu Chỉnh sửa Nội dung" maxWidth="max-w-md">
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">Gửi phản hồi trả về cho Maker (Creator)</p>

      <FormField label="Lý do & hướng dẫn chỉnh sửa:">
        <textarea
          rows={4}
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="Ví dụ: Phân cảnh 2 ánh sáng hơi chói và thoại AI Aura bị trễ nhịp so với khẩu hình. Vui lòng re-render lại cảnh 2..."
          className={fieldTextareaClass}
        />
      </FormField>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Hủy bỏ
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          <Send className="w-3.5 h-3.5" /> Gửi phản hồi
        </Button>
      </div>
    </Modal>
  );
}
