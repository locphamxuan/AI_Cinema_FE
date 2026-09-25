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

/** Confirms sending the plan back; the text starts as a summary of every field the Reviewer flagged. */
export function RejectPlanModal({ open, onClose, onConfirm, feedback, onFeedbackChange }: RejectPlanModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Trả kế hoạch về để sửa" subtitle="Creator sẽ thấy nội dung này cùng ghi chú ở từng mục." maxWidth="max-w-md">
      <FormField label="Nội dung phản hồi">
        <textarea
          rows={6}
          required
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="Nêu rõ cần sửa gì trước khi duyệt lại…"
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
