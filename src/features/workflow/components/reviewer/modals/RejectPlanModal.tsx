import { Send, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { fieldTextareaClass } from '@/components/ui/FormField';

export interface RejectPlanModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  feedback: string;
  onFeedbackChange: (value: string) => void;
}

const QUICK_FEEDBACK_PRESETS = [
  'Cần bổ sung chi tiết Visual Prompt cho phân cảnh cao trào.',
  'Ước tính Token Quota đang vượt mức cho phép của tập.',
  'Thời lượng phân cảnh chưa đồng bộ với tổng thời lượng tập.',
  'Kịch bản cần làm rõ mâu thuẫn nhân vật chính.',
];

export function RejectPlanModal({ open, onClose, onConfirm, feedback, onFeedbackChange }: RejectPlanModalProps) {
  const handleAddPreset = (text: string) => {
    if (feedback.trim()) {
      onFeedbackChange(`${feedback.trim()}\n• ${text}`);
    } else {
      onFeedbackChange(text);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Yêu Cầu Hiệu Chỉnh Kế Hoạch"
      subtitle="Gửi phản hồi yêu cầu Creator (Maker) bổ sung kịch bản"
      icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 dark:text-zinc-300 mb-1.5 text-xs font-bold">
            Gợi ý nội dung phản hồi nhanh:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_FEEDBACK_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddPreset(preset)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10 text-[11px] text-left transition cursor-pointer"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-slate-700 dark:text-zinc-300 mb-1.5 text-xs font-bold">
            Nội Dung Yêu Cầu Chỉnh Sửa: <span className="text-ruby">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={feedback}
            onChange={(e) => onFeedbackChange(e.target.value)}
            placeholder="Ví dụ: Kịch bản phân cảnh 2 chưa có prompt hình ảnh chi tiết, vui lòng bổ sung trước khi cấp Quota..."
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
            disabled={!feedback.trim()}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-500 to-ruby hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi Yêu Cầu Sửa</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

