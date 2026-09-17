import { Plus } from 'lucide-react';
import type { ProductionProject } from '@/types/workflow';

export interface ProjectsTabProps {
  project: ProductionProject;
  onCreateProject: () => void;
}

export function ProjectsTab({ project, onCreateProject }: ProjectsTabProps) {
  return (
    <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Dự Án: {project.title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý ngân sách, thể loại và đạo diễn sản xuất</p>
        </div>
        <button
          onClick={onCreateProject}
          className="px-4 py-2 rounded-xl bg-ruby hover:bg-ruby-dark text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" /> Tạo Dự Án Mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
          <span className="text-slate-700 dark:text-slate-300 font-bold block">Tóm tắt dự án:</span>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{project.synopsis}</p>
        </div>

        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
          <span className="text-slate-700 dark:text-slate-300 font-bold block">Thông tin phân quyền:</span>
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
    </div>
  );
}
