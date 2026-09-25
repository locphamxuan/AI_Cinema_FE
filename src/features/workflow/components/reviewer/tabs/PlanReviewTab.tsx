import { CheckCircle2, Edit3, Film } from 'lucide-react';
import { PENDING_FIELD_REVIEW } from '@/types/workflow';
import type { EpisodePackage } from '@/types/workflow';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { availableBudget, derivePlanVerdict, planFieldReviews, scriptReview } from '@/features/workflow/lib/planVerdict';
import { FieldReviewCard } from '../../shared/FieldReviewCard';
import { episodeName } from '@/features/workflow/lib/episodeLabel';
import { isPlanApproved } from '@/features/workflow/lib/workflowState';

export interface PlanReviewTabProps {
  currentPackage?: EpisodePackage;
  onRequestChanges: () => void;
  onAllocateQuota: () => void;
}

export function PlanReviewTab({ currentPackage, onRequestChanges, onAllocateQuota }: PlanReviewTabProps) {
  const project = useWorkflowStore((s) => s.project);
  const reviewScene = useWorkflowStore((s) => s.reviewScene);
  const reviewPlanField = useWorkflowStore((s) => s.reviewPlanField);
  const packageId = currentPackage?.id ?? '';
  const targetDuration = currentPackage?.target_duration_minutes || 0;
  const brief = currentPackage?.brief;
  const durationMismatch = Boolean(
    brief && targetDuration > 0 && Math.abs(brief.target_duration_minutes - targetDuration) / targetDuration > 0.15
  );
  const cleanTitle = episodeName(currentPackage?.title) || 'Chưa đặt tên';
  const budgetLeft = availableBudget(project);
  const verdict = brief ? derivePlanVerdict(project, brief) : 'PENDING';
  const canApprove = verdict === 'APPROVED';
  const fieldReviews = brief ? planFieldReviews(project, brief) : [];
  const approvedCount = fieldReviews.filter((r) => r.status === 'approved').length;

  const isAlreadyApproved = currentPackage ? isPlanApproved(currentPackage.status) : false;
  // Only a submitted plan has a review round to decide in; a draft or a returned plan waits for the Creator.
  const isReviewable = currentPackage?.status === 'PLAN_PENDING';

  return (
    <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 space-y-5 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">{cleanTitle}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isAlreadyApproved ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Kế hoạch đã duyệt & đã cấp {currentPackage?.quota_allocated ?? 0} token</span>
            ) : (
              <>
                {approvedCount}/{fieldReviews.length} mục đã duyệt
                {verdict === 'CHANGES_REQUESTED' && <span className="text-rose-600 dark:text-rose-400"> · Có mục cần sửa</span>}
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {isAlreadyApproved ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Đã cấp {currentPackage?.quota_allocated ?? 0} token</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={onRequestChanges}
                disabled={verdict !== 'CHANGES_REQUESTED'}
                title={verdict === 'CHANGES_REQUESTED' ? undefined : 'Đánh dấu ít nhất một mục cần sửa trước'}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 enabled:hover:bg-rose-50 dark:enabled:hover:bg-rose-500/10 text-slate-700 dark:text-slate-300 enabled:hover:text-rose-600 dark:enabled:hover:text-rose-400 border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit3 className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
                Trả về để sửa
              </button>
              <button
                type="button"
                onClick={onAllocateQuota}
                disabled={!canApprove}
                title={canApprove ? undefined : 'Cần duyệt kịch bản, thời lượng, token và tất cả phân cảnh trước khi cấp token'}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  canApprove
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white cursor-pointer'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Duyệt và cấp token
              </button>
            </>
          )}
        </div>
      </div>

      {brief ? (
        <div className="space-y-5">
          {/* Overall script — reviewed once per project (BR-39) */}
          <FieldReviewCard
            readOnly={!isReviewable}
            review={scriptReview(project, brief)}
            onReview={(status, comment) => reviewPlanField(packageId, 'script', status, comment)}
            approveLabel="Duyệt kịch bản"
            header={
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" /> Kịch bản tổng thể · v{project.script_version}
              </span>
            }
          >
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {project.overall_script || 'Creator chưa nhập kịch bản tổng thể.'}
            </p>
          </FieldReviewCard>

          {/* Duration & token estimate vs project baseline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FieldReviewCard
            readOnly={!isReviewable}
              review={brief.duration_review}
              onReview={(status, comment) => reviewPlanField(packageId, 'duration', status, comment)}
              approveLabel="Duyệt thời lượng"
              header={<span className="text-xs font-bold text-slate-900 dark:text-white">Thời lượng đề xuất</span>}
            >
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Creator đề xuất <strong>{brief.target_duration_minutes} phút</strong>, mốc dự án {targetDuration} phút.
                {durationMismatch && <span className="text-amber-600 dark:text-amber-400 font-semibold"> Lệch mốc dự án.</span>}
              </p>
            </FieldReviewCard>
            <FieldReviewCard
            readOnly={!isReviewable}
              review={brief.token_review}
              onReview={(status, comment) => reviewPlanField(packageId, 'token', status, comment)}
              approveLabel="Duyệt token dự toán"
              header={<span className="text-xs font-bold text-slate-900 dark:text-white">Token dự toán</span>}
            >
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Ước tính <strong>{brief.estimated_tokens} Tokens</strong> so với ngân sách khả dụng của dự án{' '}
                <strong>{budgetLeft.toLocaleString()} Tokens</strong>.
              </p>
            </FieldReviewCard>
          </div>

          {/* Scene-by-scene review */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>Duyệt từng phân cảnh</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                {brief.scene_breakdown.length} cảnh
              </span>
            </h3>

            <div className="space-y-2.5">
              {brief.scene_breakdown.map((sc) => (
                <FieldReviewCard
            readOnly={!isReviewable}
                  key={sc.scene_number}
                  review={brief.scene_reviews.find((sr) => sr.scene_number === sc.scene_number) ?? PENDING_FIELD_REVIEW}
                  onReview={(status, comment) => reviewScene(packageId, sc.scene_number, status, comment)}
                  approveLabel="Duyệt cảnh này"
                  header={
                    <>
                      <span className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-[11px] flex items-center justify-center">
                        {sc.scene_number}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sc.title}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                        {sc.target_duration_sec}s
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-mono font-semibold border border-amber-200/60 dark:border-amber-500/20">
                        {sc.estimated_tokens} Tokens
                      </span>
                    </>
                  }
                >
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{sc.description}</p>
                </FieldReviewCard>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 space-y-2">
          <Film className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Tập phim này chưa được nộp bản kế hoạch.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Vui lòng chuyển qua tập khác từ danh sách bên trái hoặc chờ Creator hoàn tất kế hoạch.
          </p>
        </div>
      )}
    </div>
  );
}
