import { Plus, Trash2, Milestone as MilestoneIcon } from 'lucide-react';
import { fieldInputClass } from '@/components/ui/FormField';
import type { ProjectMilestone } from '@/types/workflow';

export interface MilestonesEditorProps {
  milestones: ProjectMilestone[];
  /** Deadline a new milestone starts with: the end of production. */
  defaultDeadline: string;
  onChange: (milestones: ProjectMilestone[]) => void;
}

/** Progress milestones the Reviewer sets for the Creator when creating a project. */
export function MilestonesEditor({ milestones, defaultDeadline, onChange }: MilestonesEditorProps) {
  const handleAddMilestone = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newMilestone: ProjectMilestone = {
      id: `ms-${Date.now()}`,
      title: `Cột mốc ${milestones.length + 1}: `,
      startDate: todayStr,
      deadline: defaultDeadline || todayStr,
      description: '',
      status: milestones.length === 0 ? 'in_progress' : 'pending',
    };
    onChange([...milestones, newMilestone]);
  };

  const handleUpdateMilestone = (index: number, field: keyof ProjectMilestone, value: string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemoveMilestone = (index: number) => {
    onChange(milestones.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
            <MilestoneIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Cột mốc
          </label>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Những gì Creator cần bàn giao, kèm hạn chót</p>
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

      {milestones.length === 0 ? (
        <div className="text-center py-6 text-slate-400 dark:text-zinc-500 bg-white dark:bg-[#0E1118] rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-xs">
          Chưa có cột mốc nào. Bấm &quot;Thêm mốc&quot; để thêm.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
          {milestones.map((ms, index) => (
            <div
              key={ms.id || index}
              className="bg-white dark:bg-[#0E1118] p-3 rounded-xl border border-slate-200/80 dark:border-white/10 space-y-2.5 relative group shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  <span>Mốc {index + 1}</span>
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
                placeholder="Ví dụ: Chốt kịch bản 5 tập…"
                className={`${fieldInputClass} text-xs py-1.5`}
              />

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold block mb-1">Bắt đầu</label>
                  <input
                    type="date"
                    required
                    value={ms.startDate || ''}
                    onChange={(e) => handleUpdateMilestone(index, 'startDate', e.target.value)}
                    className={`${fieldInputClass} text-xs py-1.5`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold block mb-1">Hạn chót</label>
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
                placeholder="Cần bàn giao gì? Ví dụ: kịch bản đã chia cảnh, clip mẫu…"
                className={`${fieldInputClass} text-[11px] py-1 text-slate-600 dark:text-zinc-400`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
