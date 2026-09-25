import { Check } from 'lucide-react';
import type { GenerationJob } from '@/types/workflow';

export interface StudioTimelineProps {
  jobs: GenerationJob[];
  selectedJobId: string;
  renderingJobId: string | null;
  onSelectJob: (id: string) => void;
  onGenerate: (id: string) => void;
  /** Generation is closed, e.g. while the cut waits for the Reviewer. */
  locked?: boolean;
}

const ACTION_CLASS =
  'px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50';

/** The plan's scenes in order: pick one to edit, then create or redo its clip. */
export function StudioTimeline({ jobs, selectedJobId, renderingJobId, onSelectJob, onGenerate, locked = false }: StudioTimelineProps) {
  const doneCount = jobs.filter((j) => j.status === 'completed').length;

  return (
    <section aria-labelledby="timeline-title" className="bg-white dark:bg-[#151822] p-5 rounded-xl border border-slate-200 dark:border-white/10 space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="timeline-title" className="text-sm font-semibold text-slate-900 dark:text-white">
          Các cảnh
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          {doneCount}/{jobs.length} đã xong
        </span>
      </div>

      {jobs.length === 0 && <p className="py-4 text-xs text-slate-400 dark:text-slate-500">Kế hoạch này chưa có cảnh nào.</p>}

      <ul className="space-y-2">
        {jobs.map((job) => {
          const isSelected = job.id === selectedJobId;
          const isRendering = renderingJobId === job.id || job.status === 'processing';
          const isCompleted = job.status === 'completed';

          return (
            <li
              key={job.id}
              className={`flex items-center gap-2 rounded-lg border transition ${
                isSelected
                  ? 'border-purple-400 dark:border-purple-500/50 bg-purple-50/50 dark:bg-purple-500/10'
                  : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectJob(job.id)}
                aria-current={isSelected ? 'true' : undefined}
                className="flex-1 min-w-0 flex items-center gap-3 p-3 text-left cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
              >
                <span className="w-6 text-center text-xs font-medium text-slate-400 tabular-nums shrink-0">{job.scene_number}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900 dark:text-white truncate">{job.title}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {job.generation_steps.length} mục · {job.token_cost} token
                  </span>
                </span>
              </button>

              <div className="flex items-center gap-1.5 pr-2 shrink-0">
                {isRendering ? (
                  <span role="status" className="text-xs text-purple-700 dark:text-purple-300 tabular-nums px-2">
                    Đang tạo…
                  </span>
                ) : isCompleted ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5" aria-hidden="true" /> Xong
                    </span>
                    {!locked && (
                      <button type="button" onClick={() => onGenerate(job.id)} className={`${ACTION_CLASS} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10`}>
                        Tạo lại
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {job.status === 'failed' && <span className="text-xs text-rose-600 dark:text-rose-400">Thất bại</span>}
                    {!locked && (
                      <button type="button" onClick={() => onGenerate(job.id)} className={`${ACTION_CLASS} bg-purple-600 hover:bg-purple-700 text-white`}>
                        Tạo clip
                      </button>
                    )}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
