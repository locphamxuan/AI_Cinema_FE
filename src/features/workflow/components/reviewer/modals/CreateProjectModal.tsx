import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';

export interface CreateProjectFormState {
  title: string;
  genre: string;
  synopsis: string;
  episodes: number;
  budgetTokens: number;
  deadline: string;
  releaseDate: string;
}

export interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: CreateProjectFormState;
  onChange: <K extends keyof CreateProjectFormState>(field: K, value: CreateProjectFormState[K]) => void;
}

export function CreateProjectModal({ open, onClose, onSubmit, form, onChange }: CreateProjectModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Khởi Tạo Dự Án Phim AI Mới" maxWidth="max-w-lg">
      <form onSubmit={onSubmit} className="space-y-3 text-xs">
        <FormField label="Tên Dự Án:">
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Ví dụ: Cyber Saigon 2077..."
            className={fieldInputClass}
          />
        </FormField>

        <FormField label="Thể Loại (phân cách bằng dấu phẩy):">
          <input
            type="text"
            value={form.genre}
            onChange={(e) => onChange('genre', e.target.value)}
            placeholder="Ví dụ: Khoa học viễn tưởng, AI Action..."
            className={fieldInputClass}
          />
        </FormField>

        <FormField label="Tóm Tắt Nội Dung:">
          <textarea
            rows={2}
            value={form.synopsis}
            onChange={(e) => onChange('synopsis', e.target.value)}
            placeholder="Dự án điện ảnh ứng dụng công nghệ GenAI thế hệ mới..."
            className={fieldTextareaClass}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Số Tập:">
            <input
              type="number"
              value={form.episodes}
              onChange={(e) => onChange('episodes', Number(e.target.value))}
              className={fieldInputClass}
            />
          </FormField>
          <FormField label="Ngân Sách AI Tokens:">
            <input
              type="number"
              value={form.budgetTokens}
              onChange={(e) => onChange('budgetTokens', Number(e.target.value))}
              className={fieldInputClass}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Hạn Chót Sản Xuất:">
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => onChange('deadline', e.target.value)}
              className={fieldInputClass}
            />
          </FormField>
          <FormField label="Ngày Công Chiếu Dự Kiến:">
            <input
              type="date"
              value={form.releaseDate}
              onChange={(e) => onChange('releaseDate', e.target.value)}
              className={fieldInputClass}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit">Tạo Dự Án</Button>
        </div>
      </form>
    </Modal>
  );
}
