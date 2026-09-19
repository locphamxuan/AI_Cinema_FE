import { Plus, Tag, Milestone as MilestoneIcon, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { ProductionProject } from '@/types/workflow';

export interface ProjectsTabProps {
  project: ProductionProject;
  onCreateProject: () => void;
}

export function ProjectsTab({ project, onCreateProject }: ProjectsTabProps) {
  const milestones = project.milestones || [];

  return (
    <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Dự Án: {project.title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý ngân sách, thể loại (Tags) và cột mốc tiến độ dự án</p>
        </div>
        <button
          onClick={onCreateProject}
          className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" /> Tạo Dự Án Mới
        </button>
      </div>

      {/* Genre Tags */}
      <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
        <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-ruby" /> Thể Loại Phim (Dạng Tag):
        </span>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.genre && project.genre.length > 0 ? (
            project.genre.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
              >
                #{g}
              </span>
            ))
          ) : (
            <span className="text-slate-400">Chưa có tag thể loại</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
          <span className="text-slate-700 dark:text-slate-300 font-bold block">Tóm tắt nội dung dự án:</span>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{project.synopsis}</p>
        </div>

        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
          <span className="text-slate-700 dark:text-slate-300 font-bold block">Thông tin phân quyền & Thời gian:</span>
          <p className="text-slate-600 dark:text-slate-400">
            Creator (Maker): <strong className="text-slate-900 dark:text-white">{project.creator_name}</strong>
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Reviewer (Checker): <strong className="text-slate-900 dark:text-white">{project.reviewer_name}</strong>
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Hạn chót sản xuất: <strong className="text-amber-600 dark:text-amber-400">{project.deadline}</strong>
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Kế hoạch công chiếu: <strong className="text-emerald-600 dark:text-emerald-400">{project.planned_release_date}</strong>
          </p>
        </div>
      </div>

      {/* Milestones List */}
      <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
            <MilestoneIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Cột Mốc Tiến Độ Quy Định (Milestones):
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">{milestones.length} Cột mốc</span>
        </div>

        {milestones.length === 0 ? (
          <p className="text-slate-400 italic">Chưa thiết lập cột mốc tiến độ.</p>
        ) : (
          <div className="space-y-2">
            {milestones.map((ms, idx) => (
              <div
                key={ms.id || idx}
                className="bg-white dark:bg-[#12141A] p-3 rounded-lg border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {ms.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : ms.status === 'in_progress' ? (
                      <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="font-bold text-slate-800 dark:text-slate-200">{ms.title}</span>
                  </div>
                  {ms.description && <p className="text-[11px] text-slate-500 pl-5.5">{ms.description}</p>}
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[11px] pl-5.5 sm:pl-0">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> {ms.deadline}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-semibold text-[10px] border ${
                      ms.status === 'completed'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                        : ms.status === 'in_progress'
                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {ms.status === 'completed' ? 'Đã xong' : ms.status === 'in_progress' ? 'Đang làm' : 'Chưa làm'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
