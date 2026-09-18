import { useState } from 'react';
import { Plus, X, Trash2, Tag, Calendar, Milestone as MilestoneIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import type { ProjectMilestone } from '@/types/workflow';

export interface CreateProjectFormState {
  title: string;
  genre: string[];
  synopsis: string;
  episodes: number;
  budgetTokens: number;
  deadline: string;
  releaseDate: string;
  milestones: ProjectMilestone[];
}

export interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: CreateProjectFormState;
  onChange: <K extends keyof CreateProjectFormState>(field: K, value: CreateProjectFormState[K]) => void;
}

const PRESET_GENRES = [
  'Khoa học viễn tưởng',
  'Cyberpunk',
  'Hành động AI',
  'Kinh dị',
  'Tình cảm',
  'Phiêu lưu',
  'Hoạt hình AI',
  'Kỳ ảo / Fantasy',
  'Trinh thám',
  'Hài hước',
];

export function CreateProjectModal({ open, onClose, onSubmit, form, onChange }: CreateProjectModalProps) {
  const [customTagInput, setCustomTagInput] = useState('');

  const togglePresetGenre = (genre: string) => {
    if (form.genre.includes(genre)) {
      onChange('genre', form.genre.filter((g) => g !== genre));
    } else {
      onChange('genre', [...form.genre, genre]);
    }
  };

  const handleAddCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const tag = customTagInput.trim();
    if (tag && !form.genre.includes(tag)) {
      onChange('genre', [...form.genre, tag]);
      setCustomTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange('genre', form.genre.filter((g) => g !== tagToRemove));
  };

  const handleAddMilestone = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newMilestone: ProjectMilestone = {
      id: `ms-${Date.now()}`,
      title: `Cột mốc ${form.milestones.length + 1}: `,
      startDate: todayStr,
      deadline: form.deadline || todayStr,
      description: '',
      status: form.milestones.length === 0 ? 'in_progress' : 'pending',
    };
    onChange('milestones', [...form.milestones, newMilestone]);
  };

  const handleUpdateMilestone = (index: number, field: keyof ProjectMilestone, value: string) => {
    const updated = [...form.milestones];
    updated[index] = { ...updated[index], [field]: value };
    onChange('milestones', updated);
  };

  const handleRemoveMilestone = (index: number) => {
    onChange('milestones', form.milestones.filter((_, i) => i !== index));
  };

  return (
    <Modal open={open} onClose={onClose} title="Khởi Tạo Dự Án Phim AI Mới" maxWidth="max-w-2xl">
      <form onSubmit={onSubmit} className="space-y-4 text-xs">
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

        {/* Section 1: Thể loại dưới dạng Tags */}
        <div className="space-y-2 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-ruby" /> Thể Loại Phim:
            </label>
            <span className="text-[10px] text-slate-500">Đã chọn {form.genre.length} thể loại</span>
          </div>

          {/* Active Selected Tags */}
          {form.genre.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-white dark:bg-[#12141A] rounded-lg border border-slate-200 dark:border-white/10">
              {form.genre.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                >
                  {g}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(g)}
                    className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Preset Tag selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-500 font-medium block">Gợi ý tag phổ biến (bấm để chọn):</span>
            <div className="flex flex-wrap gap-1">
              {PRESET_GENRES.map((preset) => {
                const isSelected = form.genre.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => togglePresetGenre(preset)}
                    className={`px-2 py-0.5 rounded-full text-[10px] transition cursor-pointer font-medium border ${isSelected
                      ? 'bg-ruby text-white border-ruby shadow-xs'
                      : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-ruby/50'
                      }`}
                  >
                    {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom tag input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomTag();
                }
              }}
              placeholder="Nhập tag tự định nghĩa..."
              className={`${fieldInputClass} py-1 text-[11px]`}
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="px-3 py-1 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-semibold text-[11px] shrink-0 cursor-pointer"
            >
              Thêm Tag
            </button>
          </div>
        </div>

        <FormField label="Tóm Tắt Nội Dung Phim:">
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
          <FormField label="Hạn Chót Sản Xuất Dự Án:">
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

        {/* Section 2: Cột mốc (Thời gian tiến độ dự án) */}
        <div className="space-y-2.5 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MilestoneIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Cột Mốc Tiến Độ Dự Án:
              </label>
              <p className="text-[10px] text-slate-500">Thiết lập các mốc tiến độ để Content Creator lựa chọn và thực hiện</p>
            </div>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="px-2.5 py-1 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-[11px] flex items-center gap-1 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {form.milestones.length === 0 ? (
            <div className="text-center py-4 text-slate-400 dark:text-slate-500 bg-white dark:bg-[#12141A] rounded-lg border border-dashed border-slate-200 dark:border-white/10 text-[11px]">
              Chưa có cột mốc nào. Bấm dấu cộng ở trên để quy định thời gian tiến độ cho Creator.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {form.milestones.map((ms, index) => (
                <div
                  key={ms.id || index}
                  className="bg-white dark:bg-[#12141A] p-2.5 rounded-lg border border-slate-200 dark:border-white/10 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] shrink-0">
                      Mốc #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(index)}
                      className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-0.5"
                      title="Xóa cột mốc này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={ms.title}
                    onChange={(e) => handleUpdateMilestone(index, 'title', e.target.value)}
                    placeholder="Tên cột mốc (vd: Hoàn thành kịch bản tập 1)..."
                    className={`${fieldInputClass} text-[11px] py-1`}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Bắt Đầu:</label>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-500 shrink-0" />
                        <input
                          type="date"
                          required
                          value={ms.startDate || ''}
                          onChange={(e) => handleUpdateMilestone(index, 'startDate', e.target.value)}
                          className={`${fieldInputClass} text-[11px] py-1`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Đến Hạn (Hạn Chót):</label>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
                        <input
                          type="date"
                          required
                          value={ms.deadline}
                          onChange={(e) => handleUpdateMilestone(index, 'deadline', e.target.value)}
                          className={`${fieldInputClass} text-[11px] py-1`}
                        />
                      </div>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={ms.description || ''}
                    onChange={(e) => handleUpdateMilestone(index, 'description', e.target.value)}
                    placeholder="Mô tả nội dung / Yêu cầu công việc (tùy chọn)..."
                    className={`${fieldInputClass} text-[10px] py-0.5 text-slate-600 dark:text-slate-400`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit">Tạo Dự Án</Button>
        </div>
      </form>
    </Modal>
  );
}
