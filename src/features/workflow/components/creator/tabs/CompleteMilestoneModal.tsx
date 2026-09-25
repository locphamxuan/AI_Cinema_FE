import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormField, fieldTextareaClass } from '@/components/ui/FormField';

export interface CompleteMilestoneModalProps {
  /** Title of the milestone being completed; the modal is closed while undefined. */
  milestoneTitle?: string;
  onClose: () => void;
  onConfirm: (result: string) => Promise<boolean>;
}

/** A milestone is completed with what was achieved; once completed it can no longer be reopened. */
export function CompleteMilestoneModal({ milestoneTitle, onClose, onConfirm }: CompleteMilestoneModalProps) {
  const [result, setResult] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const close = () => {
    setResult('');
    onClose();
  };
  const confirm = async () => {
    setIsSaving(true);
    const done = await onConfirm(result.trim());
    setIsSaving(false);
    if (done) close();
  };

  return (
    <Modal
      open={milestoneTitle !== undefined}
      onClose={close}
      title="Hoàn thành cột mốc"
      subtitle={`${milestoneTitle ?? ''} — sau khi hoàn thành sẽ không mở lại được.`}
      maxWidth="max-w-md"
    >
      <FormField label="Kết quả đạt được">
        <textarea
          rows={4}
          required
          maxLength={1000}
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="VD: Đã chốt kịch bản 5 tập và danh sách phân cảnh."
          className={fieldTextareaClass}
        />
      </FormField>
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={close}>
          Hủy
        </Button>
        <Button variant="success" onClick={confirm} disabled={!result.trim() || isSaving}>
          {isSaving ? 'Đang lưu…' : 'Hoàn thành'}
        </Button>
      </div>
    </Modal>
  );
}
