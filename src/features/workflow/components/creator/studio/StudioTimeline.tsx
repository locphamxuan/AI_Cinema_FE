import { Layers, CheckCircle2, Video, Trash2 } from 'lucide-react';
import type { GenerationJob } from '@/types/workflow';

export interface StudioTimelineProps {
  jobs: GenerationJob[];
  selectedJobId: string;
  renderingJobId: string | null;
  onSelectJob: (id: string) => void;
  onGenerate: (id: string) => void;
  onRemove: (id: string) => void;
}

/** Multi-scene assembly timeline — pick, (re)render, or delete a scene's generation job. */
export function StudioTimeline({ jobs, selectedJobId, renderingJobId, onSelectJob, onGenerate, onRemove }: StudioTimelineProps) {
  return (
    <div className="bg-white dark:bg-[#151822] p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Timeline Phân Cảnh Ghép Tập ({jobs.length} Cảnh)
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Hoàn thành: <b className="text-emerald-600 dark:text-emerald-400">{jobs.filter((j) => j.status === 'completed').length}</b> / {jobs.length} Cảnh
        </span>
      </div>

      <div className="space-y-2.5">
        {jobs.map((job) => {
          const isSelected = job.id === selectedJobId;
          const isRendering = renderingJobId === job.id || job.status === 'processing';
          const isCompleted = job.status === 'completed';

          return (
            <div
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-400 dark:border-indigo-500/40 ring-1 ring-indigo-500/20'
                  : 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-slate-200 font-mono font-bold text-xs shrink-0">
                  #{job.scene_number}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{job.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md font-mono mt-0.5">
                    {job.ai_model} • {job.token_cost} Tokens
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {isRendering ? (
                  <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 px-3 py-1.5 rounded-lg">
                    <div className="w-3 h-3 rounded-full border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent animate-spin" />
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 font-mono">Rendering ({job.progress}%)</span>
                  </div>
                ) : isCompleted ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Hoàn Tất</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerate(job.id);
                      }}
                      className="px-2.5 py-1 rounded-md bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-white/10 cursor-pointer transition"
                    >
                      Re-render
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerate(job.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-medium shadow-xs transition cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Sinh Clip</span>
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(job.id);
                  }}
                  aria-label={`Xoá phân cảnh ${job.scene_number}`}
                  className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
