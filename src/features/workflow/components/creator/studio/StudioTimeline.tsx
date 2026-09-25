import { AlertTriangle, Check, Link2, RefreshCw } from 'lucide-react';
import type { GenerationJob } from '@/types/workflow';
import type { ApiPlanContinuity } from '@/types/workflow-api';
import type { KeyedRequestState } from './useKeyedRequest';

export interface StudioTimelineProps {
  jobs: GenerationJob[];
  selectedJobId: string;
  renderingJobId: string | null;
  onSelectJob: (id: string) => void;
  onGenerate: (id: string) => void;
  /** Generation is closed, e.g. while the cut waits for the Reviewer. */
  locked?: boolean;
  /** Where neighbouring scenes do not cut together; absent while the cut is locked. */
  continuity?: { state: KeyedRequestState<ApiPlanContinuity>; refresh: () => void };
}

const ACTION_CLASS =
  'px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50';

/** The plan's scenes in order: pick one to edit, then create or redo its clip. */
export function StudioTimeline({ jobs, selectedJobId, renderingJobId, onSelectJob, onGenerate, locked = false, continuity }: StudioTimelineProps) {
  const doneCount = jobs.filter((j) => j.status === 'completed').length;
  const report = continuity?.state.status === 'ready' ? continuity.state.data : null;
  const issuesOf = (sceneId: string) => report?.scenes.find((s) => s.sceneId === sceneId)?.issues ?? [];
  const issueCount = report?.scenes.reduce((sum, s) => sum + s.issues.length, 0) ?? 0;

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

      {continuity && jobs.length > 1 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] text-xs">
          {continuity.state.status === 'loading' ? (
            <span className="flex-1 text-slate-500 dark:text-slate-400">Đang kiểm tra liên kết giữa các cảnh…</span>
          ) : continuity.state.status === 'error' ? (
            <span className="flex-1 text-rose-600 dark:text-rose-400">Chưa kiểm tra được liên kết các cảnh.</span>
          ) : issueCount > 0 ? (
            <span className="flex-1 inline-flex items-start gap-1.5 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" />
              <span>{issueCount} chỗ các cảnh chưa khớp nhau. {report?.summary}</span>
            </span>
          ) : (
            <span className="flex-1 inline-flex items-start gap-1.5 text-emerald-700 dark:text-emerald-400">
              <Link2 className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" />
              <span>{report?.summary || 'Các cảnh nối tiếp nhau hợp lý.'}</span>
            </span>
          )}
          <button
            type="button"
            onClick={continuity.refresh}
            disabled={continuity.state.status === 'loading'}
            aria-label="Kiểm tra lại liên kết các cảnh"
            className="p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition cursor-pointer disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${continuity.state.status === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        </div>
      )}

      {jobs.length === 0 && <p className="py-4 text-xs text-slate-400 dark:text-slate-500">Kế hoạch này chưa có cảnh nào.</p>}

      <ul className="space-y-2 lg:max-h-[26rem] lg:overflow-y-auto lg:pr-1">
        {jobs.map((job) => {
          const isSelected = job.id === selectedJobId;
          const isRendering = renderingJobId === job.id || job.status === 'processing';
          const isCompleted = job.status === 'completed';
          const issues = issuesOf(job.scene_id);

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
                  {issues.length > 0 && (
                    <span title={issues.join(' · ')} className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                      <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{issues[0]}</span>
                    </span>
                  )}
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
