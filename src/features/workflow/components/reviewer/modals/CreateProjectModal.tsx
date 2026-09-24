import { useEffect, useState } from 'react';
import { Plus, Trash2, Calendar, Milestone as MilestoneIcon, Film, Coins, UserCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import type { ProjectMilestone } from '@/types/workflow';
import type { ApiGenre, ApiUser } from '@/types/workflow-api';
import { workflowService } from '@/services/workflowService';
import { toast } from '@/components/ui/Toast';
import { GenrePicker } from './GenrePicker';
import { SeasonEpisodesEditor } from './SeasonEpisodesEditor';

export interface CreateProjectFormState {
  title: string;
  /** User id of the assigned Content Creator. */
  assignedCreator: string;
  /** Genre ids. */
  genre: string[];
  synopsis: string;
  /** One list per season, holding each episode's target duration in minutes; seasons may differ in size. */
  seasons: number[][];
  budgetTokens: number;
  productionStartDate: string;
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

const QUICK_TOKEN_OPTIONS = [1500, 3000, 5000, 8000];

export function CreateProjectModal({ open, onClose, onSubmit, form, onChange }: CreateProjectModalProps) {
  const [creators, setCreators] = useState<ApiUser[]>([]);
  const [genres, setGenres] = useState<ApiGenre[]>([]);

  useEffect(() => {
    if (!open) return;
    workflowService.listUsers('CONTENT_CREATOR').then((res) => {
      if (res.success) setCreators(res.data.data);
    });
    workflowService.listGenres().then((res) => {
      if (res.success) setGenres(res.data.data);
    });
  }, [open]);

  // Default to the first creator once the roster arrives.
  useEffect(() => {
    if (!form.assignedCreator && creators.length > 0) onChange('assignedCreator', creators[0].id);
  }, [creators, form.assignedCreator, onChange]);

  const handleCreateGenre = async (name: string) => {
    const res = await workflowService.createGenre(name);
    if (!res.success) {
      toast.error('Không thêm được thể loại', res.message ?? 'Không kết nối được máy chủ.');
      return null;
    }
    setGenres((prev) => (prev.some((g) => g.id === res.data.id) ? prev : [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name, 'vi'))));
    return res.data;
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
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo dự án phim"
      subtitle="Thiết lập số mùa, số tập, ngân sách token và lịch sản xuất"
      icon={<Film className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={onSubmit} className="space-y-4 text-xs">
        {/* Tên Dự Án */}
        <div>
          <label className="block text-slate-700 dark:text-zinc-300 mb-1.5 text-xs font-bold flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Tên dự án phim <span className="text-purple-600 dark:text-purple-400">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Ví dụ: Kỷ Nguyên Siêu Trí Tuệ 2088…"
            className={fieldInputClass}
          />
        </div>

        <GenrePicker genres={genres} selected={form.genre} onChange={(ids) => onChange('genre', ids)} onCreate={handleCreateGenre} />

        {/* Tóm tắt cốt truyện */}
        <div>
          <label className="block text-slate-700 dark:text-zinc-300 mb-1.5 text-xs font-bold">
            Tóm Tắt Cốt Truyện & Ý Tưởng:
          </label>
          <textarea
            rows={2}
            value={form.synopsis}
            onChange={(e) => onChange('synopsis', e.target.value)}
            placeholder="Dự án điện ảnh ứng dụng công nghệ GenAI thế hệ mới, mâu thuẫn trung tâm và phong cách hình ảnh…"
            className={fieldTextareaClass}
          />
        </div>

        <SeasonEpisodesEditor seasons={form.seasons} onChange={(seasons) => onChange('seasons', seasons)} />

        <div>
          {/* Ngân Sách AI Tokens */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-2xl border border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" /> Ngân sách token
              </label>
              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                {form.budgetTokens.toLocaleString()} Tokens
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min={100}
                step={100}
                value={form.budgetTokens}
                onChange={(e) => onChange('budgetTokens', Math.max(100, Number(e.target.value)))}
                className={`${fieldInputClass} font-mono font-bold text-amber-600 dark:text-amber-400 py-1.5 pr-14`}
              />
              <span className="absolute right-3 top-2 text-[11px] font-bold text-slate-400 dark:text-zinc-500 pointer-events-none">
                Tokens
              </span>
            </div>

            {/* Quick token preset pills */}
            <div className="flex items-center gap-1.5 pt-0.5">
              {QUICK_TOKEN_OPTIONS.map((tok) => (
                <button
                  key={tok}
                  type="button"
                  onClick={() => onChange('budgetTokens', tok)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition cursor-pointer ${
                    form.budgetTokens === tok
                      ? 'bg-amber-500 text-white font-bold shadow-xs'
                      : 'bg-white dark:bg-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/15'
                  }`}
                >
                  {tok.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hạn Chót Sản Xuất & Ngày Công Chiếu */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-slate-700 dark:text-zinc-300 mb-1.5 text-xs font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Bắt Đầu Sản Xuất:
            </label>
            <input
              type="date"
              value={form.productionStartDate}
              onChange={(e) => onChange('productionStartDate', e.target.value)}
              className={fieldInputClass}
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-zinc-300 mb-1.5 text-xs font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Kết thúc sản xuất
            </label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => onChange('deadline', e.target.value)}
              className={fieldInputClass}
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-zinc-300 mb-1.5 text-xs font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Ngày công chiếu dự kiến
            </label>
            <input
              type="date"
              value={form.releaseDate}
              onChange={(e) => onChange('releaseDate', e.target.value)}
              className={fieldInputClass}
            />
          </div>
        </div>

        {/* Creator Phụ Trách (Dropdown) */}
        <div>
          <label className="block text-slate-700 dark:text-zinc-300 mb-1.5 text-xs font-bold flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Creator Phụ Trách <span className="text-purple-600 dark:text-purple-400">*</span>
          </label>
          <select
            value={form.assignedCreator}
            onChange={(e) => onChange('assignedCreator', e.target.value)}
            className={`${fieldInputClass} cursor-pointer font-medium text-slate-800 dark:text-zinc-200 bg-white dark:bg-[#0E1118]`}
          >
            {creators.map((creator) => (
              <option key={creator.id} value={creator.id} className="bg-white dark:bg-[#0E1118] text-slate-900 dark:text-white">
                {creator.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Section 2: Cột mốc (Thời gian tiến độ dự án) */}
        <div className="space-y-3 bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <MilestoneIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Lộ Trình Cột Mốc Tiến Độ:
              </label>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Mốc bàn giao kịch bản, video draft và nghiệm thu cho Creator
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 transition hover:bg-purple-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mốc</span>
            </button>
          </div>

          {form.milestones.length === 0 ? (
            <div className="text-center py-6 text-slate-400 dark:text-zinc-500 bg-white dark:bg-[#0E1118] rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-xs">
              Chưa có cột mốc nào. Bấm nút &quot;Thêm mốc&quot; ở trên để thiết lập tiến độ dự án.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {form.milestones.map((ms, index) => (
                <div
                  key={ms.id || index}
                  className="bg-white dark:bg-[#0E1118] p-3 rounded-xl border border-slate-200/80 dark:border-white/10 space-y-2.5 relative group shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      <span>Giai đoạn {index + 1}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(index)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
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
                    placeholder="Tên cột mốc (vd: Hoàn thành kịch bản phân cảnh 5 tập)…"
                    className={`${fieldInputClass} text-xs py-1.5`}
                  />

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold block mb-1">
                        Bắt Đầu:
                      </label>
                      <input
                        type="date"
                        required
                        value={ms.startDate || ''}
                        onChange={(e) => handleUpdateMilestone(index, 'startDate', e.target.value)}
                        className={`${fieldInputClass} text-xs py-1.5`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold block mb-1">
                        Hạn Chót Nghiệm Thu:
                      </label>
                      <input
                        type="date"
                        required
                        value={ms.deadline}
                        onChange={(e) => handleUpdateMilestone(index, 'deadline', e.target.value)}
                        className={`${fieldInputClass} text-xs py-1.5`}
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={ms.description || ''}
                    onChange={(e) => handleUpdateMilestone(index, 'description', e.target.value)}
                    placeholder="Sản phẩm nghiệm thu (vd: Kịch bản phân cảnh, prompt mẫu, clip 4K)…"
                    className={`${fieldInputClass} text-[11px] py-1 text-slate-600 dark:text-zinc-400`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
          <Button type="button" variant="secondary" onClick={onClose} className="px-5 py-2 rounded-xl text-xs font-bold">
            Hủy
          </Button>
          <Button type="submit" className="px-5 py-2.5 rounded-xl text-xs">
            Tạo Dự Án
          </Button>
        </div>
      </form>
    </Modal>
  );
}

