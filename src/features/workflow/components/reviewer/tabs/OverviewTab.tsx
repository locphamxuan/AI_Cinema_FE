import Link from 'next/link';
import { Clock, ShieldCheck, Zap, Tv, User, CheckCircle2, ArrowRight, Eye, AlertCircle, FileText, CheckSquare, Video } from 'lucide-react';
import type { ProductionProject, WorkflowState } from '@/types/workflow';

export interface ReviewerOverviewTabProps {
  project: ProductionProject;
  pendingPlanCount: number;
  submittedCount: number;
  onReviewPlan: (episodeId: string) => void;
}

export function OverviewTab({ project, pendingPlanCount, submittedCount, onReviewPlan }: ReviewerOverviewTabProps) {
  const publishedCount = project.episodes.filter((e) => e.status === 'PUBLISHED').length;

  const quotaAllocated = project.allocated_tokens || 1;
  const quotaConsumed = project.consumed_tokens || 0;
  const quotaPercent = Math.min(100, Math.round((quotaConsumed / quotaAllocated) * 100));

  const getWorkflowStatusPill = (status: WorkflowState) => {
    switch (status) {
      case 'PLAN_PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Chờ Duyệt Quota
          </span>
        );
      case 'QUOTA_ALLOCATED':
      case 'IN_PRODUCTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 animate-pulse" />
            Đang Sản Xuất AI
          </span>
        );
      case 'EPISODE_SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
            Chờ Duyệt Video
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            Cần Sửa Kịch Bản
          </span>
        );
      case 'COMPLIANCE_PASSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Đã Kiểm Định
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Đã Xuất Bản OTT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            Bản Thảo
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 2. Nâng Cấp 4 Thẻ Chỉ Số Actionable Metrics (Clean SaaS Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Thẻ 1: Chờ Duyệt Kế Hoạch */}
        <div className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 p-4.5 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:hover:border-white/20">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            {pendingPlanCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Cần duyệt
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-400">
                Sạch hàng đợi
              </span>
            )}
          </div>

          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight flex items-baseline">
              {pendingPlanCount} <span className="text-xs font-sans font-medium text-slate-400 ml-1.5">Tập</span>
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
              Chờ Duyệt Kế Hoạch
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
              Cần thẩm định kịch bản & gán Quota
            </p>
          </div>
        </div>

        {/* Thẻ 2: Chờ Kiểm Tra Video */}
        <div className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 p-4.5 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:hover:border-white/20">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            {submittedCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Chờ kiểm định
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-400">
                Đã duyệt xong
              </span>
            )}
          </div>

          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight flex items-baseline">
              {submittedCount} <span className="text-xs font-sans font-medium text-slate-400 ml-1.5">Tập</span>
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
              Chờ Kiểm Tra Video
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
              Cần duyệt bản dựng hoàn thiện
            </p>
          </div>
        </div>

        {/* Thẻ 3: Hạn Ngạch AI Token */}
        <div className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 p-4.5 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:hover:border-white/20">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/10">
              {quotaPercent}% đã dùng
            </span>
          </div>

          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight flex items-baseline">
              {quotaConsumed} <span className="text-xs font-mono font-normal text-slate-400 ml-1">/ {quotaAllocated} T</span>
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
              Hạn Ngạch AI Token
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-2 mb-1">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  quotaPercent >= 90 ? 'bg-rose-500' : 'bg-indigo-600 dark:bg-indigo-500'
                }`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Tổng ngân sách: <strong className="font-mono text-slate-600 dark:text-slate-300">{project.total_budget_tokens} Tokens</strong>
            </p>
          </div>
        </div>

        {/* Thẻ 4: Đã Xuất Bản OTT */}
        <div className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 p-4.5 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:hover:border-white/20">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
              <Tv className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              NĐ 142
            </span>
          </div>

          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight flex items-baseline">
              {publishedCount} <span className="text-xs font-sans font-medium text-slate-400 ml-1.5">Tập</span>
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
              Đã Xuất Bản OTT
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
              Đạt thẩm định & lên sóng công chiếu
            </p>
          </div>
        </div>
      </div>

      {/* 3. Bảng Hàng Đợi Thẩm Định (Audit Queue Table) */}
      <div className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden">
        {/* Table Top Header */}
        <div className="p-4 sm:px-5 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50 dark:bg-white/[0.01]">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Bảng Hàng Đợi Thẩm Định (Audit Queue)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Danh sách kiểm toán tập phim theo quy trình Maker-Checker thời gian thực
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Tổng số: <strong className="text-slate-900 dark:text-white font-bold">{project.episodes.length}</strong> Tập phim
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 w-52">Tập Phim</th>
                <th className="py-3 px-4 w-40">Thời Lượng & Đạo Diễn</th>
                <th className="py-3 px-4 w-44">Trạng Thái Quy Trình</th>
                <th className="py-3 px-4 w-32">AI Token Usage</th>
                <th className="py-3 px-4 w-36">Tuân Thủ AI</th>
                <th className="py-3 px-4 text-right min-w-[130px]">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.06] text-xs">
              {project.episodes.map((ep) => {
                const isPublished = ep.status === 'PUBLISHED';
                const isCompliancePassed = ep.status === 'COMPLIANCE_PASSED';
                const isSubmitted = ep.status === 'EPISODE_SUBMITTED';
                const isPlanPending = ep.status === 'PLAN_PENDING';

                const allocated = ep.quota_allocated || ep.brief.estimated_tokens || 1;
                const tokenPercent = Math.min(100, Math.round((ep.actual_tokens_used / allocated) * 100));

                return (
                  <tr
                    key={ep.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Cột 1: STT & Tên tập phim */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                          #{ep.episode_number.toString().padStart(2, '0')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white text-xs truncate max-w-[170px]">
                            {ep.title.replace(/^Tập \d+:\s*/, '')}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {ep.brief.scene_breakdown.length} Phân Cảnh AI
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Thời lượng & Creator phụ trách */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{ep.total_duration || '40:00'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate max-w-[130px]">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{project.creator_name}</span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 3: Trạng thái quy trình */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getWorkflowStatusPill(ep.status)}
                    </td>

                    {/* Cột 4: AI Token Usage */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="w-24 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {ep.actual_tokens_used} T
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            / {ep.quota_allocated || ep.brief.estimated_tokens} T
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              ep.actual_tokens_used > allocated
                                ? 'bg-rose-500'
                                : 'bg-indigo-600 dark:bg-indigo-500'
                            }`}
                            style={{ width: `${tokenPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Cột 5: Tuân thủ AI (Điều 44 & NĐ 142) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isPublished || isCompliancePassed ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>Đạt chuẩn AI</span>
                        </span>
                      ) : isSubmitted ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>Chờ thẩm định</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                          <span>Chưa kiểm</span>
                        </span>
                      )}
                    </td>

                    {/* Cột 6: Hành động chính (gọn gàng, không tràn chữ) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isPlanPending ? (
                        <button
                          type="button"
                          onClick={() => onReviewPlan(ep.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition shadow-xs active:scale-95 cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Duyệt Quota</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : isSubmitted || isCompliancePassed ? (
                        <Link
                          href={`/reviewer/audit/${ep.id}`}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition shadow-xs active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Thẩm Định AI</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : isPublished ? (
                        <Link
                          href={`/watch/${ep.id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 font-medium text-xs transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Xem OTT</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onReviewPlan(ep.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 font-medium text-xs transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>Chi tiết</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
