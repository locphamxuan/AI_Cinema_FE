import { useState, useRef, useEffect } from 'react';
import { ArrowRight, AlertCircle, Check, ChevronDown } from 'lucide-react';
import type { EpisodePackage, ProductionProject, ProjectMilestone, ReviewLog } from '@/types/workflow';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export interface OverviewTabProps {
  project: ProductionProject;
  currentPackage?: EpisodePackage;
  isQuotaWarning: boolean;
  scenesCount: number;
  estimatedTokens: number;
  synopsis: string;
  latestFeedback?: ReviewLog;
  canEnterStudio: boolean;
  onGotoBrief: () => void;
  onGotoStudio?: () => void;
  onGotoTokens?: () => void;
  onGotoReviews?: () => void;
}

type MilestoneStatus = ProjectMilestone['status'];

const MILESTONE_STATUS_CONFIG: Record<
  MilestoneStatus,
  { label: string; dot: string }
> = {
  pending: {
    label: 'Chưa bắt đầu',
    dot: 'bg-slate-400 dark:bg-slate-500',
  },
  in_progress: {
    label: 'Đang làm',
    dot: 'bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]',
  },
  completed: {
    label: 'Hoàn thành',
    dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]',
  },
};

interface MilestoneStatusDropdownProps {
  status: MilestoneStatus;
  onChange: (status: MilestoneStatus) => void;
}

function MilestoneStatusDropdown({ status, onChange }: MilestoneStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentConfig = MILESTONE_STATUS_CONFIG[status] ?? MILESTONE_STATUS_CONFIG.pending;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Thay đổi trạng thái giai đoạn"
        className="h-9 px-3 text-xs font-semibold rounded-lg bg-white dark:bg-[#12141A] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 shadow-xs hover:border-purple-300 dark:hover:border-purple-500/40 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition cursor-pointer flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${currentConfig.dot}`} aria-hidden="true" />
        <span>{currentConfig.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1.5 w-44 p-1 rounded-xl bg-white dark:bg-[#161922] border border-slate-200 dark:border-white/10 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {(Object.keys(MILESTONE_STATUS_CONFIG) as MilestoneStatus[]).map((key) => {
            const isSelected = key === status;
            const config = MILESTONE_STATUS_CONFIG[key];
            return (
              <button
                key={key}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                  isSelected
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} aria-hidden="true" />
                  <span className="truncate">{config.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 ml-1.5" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const CARD = 'bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs';

function Stat({ label, value, hint, children }: { label: string; value: React.ReactNode; hint?: string; children?: React.ReactNode }) {
  return (
    <div className={`${CARD} p-4`}>
      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">{value}</p>
      {children}
      {hint && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

export function OverviewTab({
  project,
  currentPackage,
  isQuotaWarning,
  scenesCount,
  estimatedTokens,
  synopsis,
  latestFeedback,
  canEnterStudio,
  onGotoBrief,
  onGotoStudio,
  onGotoTokens,
  onGotoReviews,
}: OverviewTabProps) {
  const { setActiveMilestone, updateMilestoneStatus } = useWorkflowStore();

  const quotaAllocated = currentPackage?.quota_allocated ?? 0;
  const quotaUsed = currentPackage?.actual_tokens_used ?? 0;
  const quotaFillPercent = quotaAllocated > 0 ? Math.min(100, (quotaUsed / quotaAllocated) * 100) : 0;
  const jobs = currentPackage?.jobs ?? [];
  const completedJobsCount = jobs.filter((j) => j.status === 'completed').length;

  const milestones = project.milestones ?? [];
  const gotoOr = (handler: (() => void) | undefined) => () => (handler ?? onGotoBrief)();

  // Four standard production stages, matched positionally with the project's milestones.
  const stages = [
    { id: 'ms-1', title: 'Kịch bản & phân cảnh', description: 'Hoàn thiện kịch bản và dàn ý phân cảnh cho tập phim.', actionLabel: 'Soạn kịch bản', onAction: onGotoBrief, defaultStatus: 'completed' as const },
    { id: 'ms-2', title: 'Sản xuất video AI', description: 'Tạo clip, lời thoại và âm thanh trong AI Studio.', actionLabel: 'Vào AI Studio', onAction: gotoOr(onGotoStudio), defaultStatus: 'in_progress' as const },
    { id: 'ms-3', title: 'Phê duyệt quota', description: 'Reviewer xem xét kế hoạch và cấp hạn ngạch AI token.', actionLabel: 'Xem token', onAction: gotoOr(onGotoTokens), defaultStatus: 'pending' as const },
    { id: 'ms-4', title: 'Kiểm định', description: 'Reviewer kiểm định chất lượng và pháp lý AI trước khi công chiếu.', actionLabel: 'Xem phản hồi', onAction: gotoOr(onGotoReviews), defaultStatus: 'pending' as const },
  ].map((stage, i) => {
    const milestone = milestones[i] ?? milestones.find((m) => m.id === stage.id);
    return {
      ...stage,
      milestoneId: milestone?.id ?? stage.id,
      status: milestone?.status ?? stage.defaultStatus,
      deadline: milestone?.deadline,
      description: milestone?.description || stage.description,
    };
  });

  const activeIndex = (() => {
    const byId = stages.findIndex((s) => s.milestoneId === project.active_milestone_id);
    if (byId !== -1) return byId;
    const inProgress = stages.findIndex((s) => s.status === 'in_progress');
    return inProgress !== -1 ? inProgress : 1;
  })();
  const currentStage = stages[activeIndex];

  return (
    <div className="space-y-5">
      {/* Where the episode stands and the one thing to do next */}
      <section className={`${CARD} p-5 space-y-4`} aria-label="Giai đoạn sản xuất">
        <ol className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {stages.map((stage, i) => {
            const isActive = i === activeIndex;
            const isDone = stage.status === 'completed';
            return (
              <li key={stage.id}>
                <button
                  type="button"
                  onClick={() => setActiveMilestone(stage.milestoneId)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
                    isActive
                      ? 'border-purple-500/60 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className="truncate">{stage.title}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {currentStage && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{currentStage.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentStage.description}
                {currentStage.deadline && <span className="text-slate-400"> · Hạn {currentStage.deadline}</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <MilestoneStatusDropdown
                status={currentStage.status}
                onChange={(newStatus) => updateMilestoneStatus(currentStage.milestoneId, newStatus)}
              />
              <button
                type="button"
                onClick={currentStage.onAction}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#151822]"
              >
                {currentStage.actionLabel}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </section>

      {latestFeedback && (
        <div role="alert" className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 text-xs space-y-2">
            <h4 className="font-semibold text-rose-700 dark:text-rose-400">Reviewer yêu cầu chỉnh sửa</h4>
            <p className="text-slate-700 dark:text-slate-200 bg-white dark:bg-[#151822] p-2.5 rounded-lg border border-rose-500/20">{latestFeedback.feedback_notes}</p>
            <button
              type="button"
              onClick={onGotoBrief}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium transition cursor-pointer"
            >
              Mở kịch bản để sửa
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Token đã dùng" value={`${quotaUsed} / ${quotaAllocated}`}>
          <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
            <div className={`h-full rounded-full ${isQuotaWarning ? 'bg-rose-500' : 'bg-purple-500'}`} style={{ width: `${quotaFillPercent}%` }} />
          </div>
        </Stat>
        <Stat label="Phân cảnh" value={scenesCount} hint={`Dự toán ${estimatedTokens} token`} />
        <Stat label="Đã render" value={`${completedJobsCount} / ${jobs.length}`} hint={canEnterStudio ? undefined : 'Cần được cấp quota để vào Studio'} />
      </div>

      {jobs.length > 0 && (
        <section className={`${CARD} p-4 space-y-2`} aria-label="Trạng thái các cảnh">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Các cảnh trong Studio</h3>
          <ul className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {jobs.slice(0, 5).map((job) => (
              <li key={job.id} className="flex justify-between items-center gap-3 py-2">
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{job.title}</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden="true" />
                  {job.status === 'completed' ? 'Hoàn tất' : 'Chờ sinh AI'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <details className={`${CARD} group`}>
        <summary className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
          Thông tin dự án
          <span className="text-xs font-normal text-slate-400 group-open:hidden">Xem</span>
        </summary>
        <div className="px-4 pb-4 space-y-3 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {project.genre.map((g) => (
              <span key={g} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                {g}
              </span>
            ))}
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{synopsis || 'Chưa có tóm tắt.'}</p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              ['Số tập', `${project.total_episodes} tập`],
              ['Ngân sách', `${project.total_budget_tokens} token`],
              ['Reviewer', project.reviewer_name],
              ['Công chiếu', project.planned_release_date],
            ].map(([term, detail]) => (
              <div key={term}>
                <dt className="text-[11px] text-slate-400">{term}</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200 truncate">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </details>
    </div>
  );
}
