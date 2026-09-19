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
    <Modal open={open} onClose={onClose} title="Yêu cầu chỉnh sửa" subtitle="Phản hồi sẽ được gửi cho người sản xuất nội dung." maxWidth="max-w-md">
      <FormField label="Cần sửa gì?">
        <textarea
          rows={4}
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="Ví dụ: cảnh 2 ánh sáng hơi chói, thoại lệch nhịp so với khẩu hình…"
          className={fieldTextareaClass}
        />
      </FormField>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={!feedback.trim()}>
          Gửi phản hồi
        </Button>
      </div>
    </Modal>
  );
}
