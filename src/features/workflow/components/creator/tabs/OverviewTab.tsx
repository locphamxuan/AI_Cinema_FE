import { useState } from 'react';
import { ArrowRight, AlertCircle, Check } from 'lucide-react';
import type { EpisodePackage, ProductionProject, ProjectMilestone, ReviewLog, WorkflowState } from '@/types/workflow';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { quotaUsage } from '@/features/workflow/lib/quota';
import { MilestoneStatusDropdown } from './MilestoneStatusDropdown';
import { CompleteMilestoneModal } from './CompleteMilestoneModal';

export interface OverviewTabProps {
  project: ProductionProject;
  currentPackage?: EpisodePackage;
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

// Pipeline stage each workflow state sits in; 4 means every stage is done.
const STAGE_OF: Record<WorkflowState, number> = {
  PLAN_DRAFT: 0,
  CHANGES_REQUESTED: 0,
  PLAN_PENDING: 1,
  QUOTA_ALLOCATED: 2,
  IN_PRODUCTION: 2,
  EPISODE_SUBMITTED: 3,
  CUT_CHANGES_REQUESTED: 2,
  COMPLIANCE_PASSED: 3,
  PUBLISHED: 4,
};

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
  const { updateMilestoneStatus } = useWorkflowStore();
  const [completing, setCompleting] = useState<ProjectMilestone>();

  const quota = quotaUsage(currentPackage);
  const jobs = currentPackage?.jobs ?? [];
  const completedJobsCount = jobs.filter((j) => j.status === 'completed').length;
  const milestones = project.milestones ?? [];
  const gotoOr = (handler: (() => void) | undefined) => () => (handler ?? onGotoBrief)();
  // A returned cut is fixed by regenerating in the Studio, a returned plan by editing the brief.
  const isCutFeedback = latestFeedback?.review_type === 'content';

  // The episode pipeline, in order; where it stands comes from its real workflow state.
  const stages = [
    { title: 'Kịch bản và cảnh', description: 'Viết kịch bản, chia cảnh rồi gửi kế hoạch.', actionLabel: 'Soạn kịch bản', onAction: onGotoBrief },
    { title: 'Duyệt kế hoạch và cấp token', description: 'Reviewer duyệt kế hoạch và cấp token cho tập.', actionLabel: 'Xem token', onAction: gotoOr(onGotoTokens) },
    { title: 'Sản xuất', description: 'Tạo clip, lời thoại, âm thanh trong Studio rồi gửi bản dựng.', actionLabel: 'Mở Studio', onAction: gotoOr(onGotoStudio) },
    { title: 'Kiểm định và phát hành', description: 'Reviewer kiểm tra chất lượng, pháp lý rồi phát hành tập.', actionLabel: 'Xem phản hồi', onAction: gotoOr(onGotoReviews) },
  ];
  const activeIndex = currentPackage ? STAGE_OF[currentPackage.status] : 0;
  const isPublished = activeIndex >= stages.length;
  const currentStage = stages[Math.min(activeIndex, stages.length - 1)];

  return (
    <div className="space-y-5">
      {/* Where the episode stands and the one thing to do next */}
      <section className={`${CARD} p-5 space-y-4`} aria-label="Giai đoạn sản xuất">
        <ol className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {stages.map((stage, i) => {
            const isActive = i === activeIndex;
            const isDone = i < activeIndex;
            return (
              <li
                key={stage.title}
                aria-current={isActive ? 'step' : undefined}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
                  isActive
                    ? 'border-purple-500/60 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300'
                    : 'border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400'
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
              </li>
            );
          })}
        </ol>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {isPublished ? 'Tập đã phát hành' : currentStage.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isPublished ? 'Khán giả đã xem được tập này.' : currentStage.description}
            </p>
          </div>
          {!isPublished && (
            <button
              type="button"
              onClick={currentStage.onAction}
              className="shrink-0 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#151822]"
            >
              {currentStage.actionLabel}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>

      <section className={`${CARD} p-5 space-y-3`} aria-label="Cột mốc dự án">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Cột mốc dự án</h3>
        {milestones.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">Reviewer chưa đặt cột mốc nào cho dự án này.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {milestones.map((milestone) => (
              <li key={milestone.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5">
                <div className="min-w-0 text-xs">
                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{milestone.title}</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {milestone.description && <span>{milestone.description} · </span>}
                    Hạn {milestone.deadline}
                  </p>
                  {milestone.result && <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">Kết quả: {milestone.result}</p>}
                </div>
                <MilestoneStatusDropdown
                  status={milestone.status}
                  onChange={(status) =>
                    status === 'completed' ? setCompleting(milestone) : updateMilestoneStatus(milestone.id, status)
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <CompleteMilestoneModal
        milestoneTitle={completing?.title}
        onClose={() => setCompleting(undefined)}
        onConfirm={(result) => updateMilestoneStatus(completing!.id, 'completed', result)}
      />

      {latestFeedback && (
        <div role="alert" className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 text-xs space-y-2">
            <h4 className="font-semibold text-rose-700 dark:text-rose-400">
              {isCutFeedback ? 'Reviewer trả bản dựng về' : 'Reviewer yêu cầu chỉnh sửa kế hoạch'}
            </h4>
            <p className="text-slate-700 dark:text-slate-200 bg-white dark:bg-[#151822] p-2.5 rounded-lg border border-rose-500/20">{latestFeedback.feedback_notes}</p>
            <button
              type="button"
              onClick={isCutFeedback ? gotoOr(onGotoStudio) : onGotoBrief}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium transition cursor-pointer"
            >
              {isCutFeedback ? 'Mở Studio để làm lại' : 'Mở kịch bản để sửa'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Token đã dùng" value={`${quota.used} / ${quota.allocated}`}>
          <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
            <div className={`h-full rounded-full ${quota.isWarning ? 'bg-rose-500' : 'bg-purple-500'}`} style={{ width: `${quota.percent}%` }} />
          </div>
        </Stat>
        <Stat label="Cảnh" value={scenesCount} hint={`Dự tính ${estimatedTokens} token`} />
        <Stat label="Đã tạo xong" value={`${completedJobsCount} / ${jobs.length}`} hint={canEnterStudio ? undefined : 'Cần được cấp token mới vào được Studio'} />
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
                  {job.status === 'completed' ? 'Hoàn tất' : 'Chưa tạo'}
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
              ['Ngày phát hành', project.planned_release_date],
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
