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
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Chờ Duyệt Quota
          </span>
        );
      case 'QUOTA_ALLOCATED':
      case 'IN_PRODUCTION':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 inline-flex items-center gap-1">
            <Video className="w-3 h-3" /> Đang Làm AI
          </span>
        );
      case 'EPISODE_SUBMITTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Chờ Duyệt Video
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 inline-flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Cần Sửa Kịch Bản
          </span>
        );
      case 'COMPLIANCE_PASSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Đã Kiểm Định
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
            <Tv className="w-3 h-3" /> Đã Xuất Bản OTT
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 inline-flex items-center gap-1">
            <FileText className="w-3 h-3" /> Bản Thảo
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 2. Nâng Cấp 4 Thẻ Chỉ Số Actionable Metrics (Clean SaaS Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Chờ Duyệt Kế Hoạch */}
        <div className="bg-white dark:bg-[#181B26] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            {pendingPlanCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Ưu tiên xử lý
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-400">
                Hàng đợi sạch
              </span>
            )}
          </div>

          <div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {pendingPlanCount} <span className="text-sm font-sans font-normal text-slate-500 dark:text-slate-400">Tập</span>
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
              Chờ Duyệt Kế Hoạch
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Cần xử lý <code className="text-amber-600 dark:text-amber-400">content_brief</code> & gán Token Quota
            </p>
          </div>
        </div>

        {/* Thẻ 2: Chờ Kiểm Tra Video */}
        <div className="bg-white dark:bg-[#181B26] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            {submittedCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                Chờ thẩm định
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-400">
                Đã duyệt xong
              </span>
            )}
          </div>

          <div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {submittedCount} <span className="text-sm font-sans font-normal text-slate-500 dark:text-slate-400">Tập</span>
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
              Chờ Kiểm Tra Video
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Cần duyệt bản dựng <code className="text-purple-600 dark:text-purple-400">episode_package</code>
            </p>
          </div>
        </div>

        {/* Thẻ 3: Hạn Ngạch AI Token */}
        <div className="bg-white dark:bg-[#181B26] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              {quotaPercent}% đã dùng
            </span>
          </div>

          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {quotaConsumed} <span className="text-xs font-mono font-normal text-slate-500 dark:text-slate-400">/ {quotaAllocated} T</span>
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
              Hạn Ngạch AI Token
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-1.5 mb-1">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  quotaPercent >= 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-amber-500'
                }`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tổng ngân sách: <strong className="font-mono text-slate-700 dark:text-slate-300">{project.total_budget_tokens} Tokens</strong>
            </p>
          </div>
        </div>

        {/* Thẻ 4: Đã Xuất Bản OTT */}
        <div className="bg-white dark:bg-[#181B26] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Tv className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Điều 44 & NĐ 142
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {publishedCount} <span className="text-sm font-sans font-normal text-slate-500 dark:text-slate-400">Tập</span>
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
              Đã Xuất Bản OTT
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Tập đã pass Compliance Check và lên sóng OTT
            </p>
          </div>
        </div>
      </div>

      {/* 3. Bảng Hàng Đợi Thẩm Định (Audit Queue Table) */}
      <div className="bg-white dark:bg-[#181B26] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
        {/* Table Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-white/[0.01]">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Bảng Hàng Đợi Thẩm Định (Audit Queue)
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/10 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Tập Phim</th>
                <th className="py-3.5 px-4">Thời Lượng & Creator</th>
                <th className="py-3.5 px-4">Trạng Thái Quy Trình</th>
                <th className="py-3.5 px-4">AI Token Usage</th>
                <th className="py-3.5 px-4">Tuân Thủ AI</th>
                <th className="py-3.5 px-4 text-right">Hành Động Chính</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-white/[0.06] text-xs">
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
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Cột 1: STT & Tên tập phim */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                          #{ep.episode_number.toString().padStart(2, '0')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate max-w-[200px]">
                            {ep.title.replace(/^Tập \d+:\s*/, '')}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {ep.brief.scene_breakdown.length} Phân Cảnh AI
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Thời lượng & Creator phụ trách */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{ep.total_duration || '40:00'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{project.creator_name}</span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 3: Trạng thái quy trình */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getWorkflowStatusPill(ep.status)}
                    </td>

                    {/* Cột 4: AI Token Usage */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="w-32 sm:w-36 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {ep.actual_tokens_used} T
                          </span>
                          <span className="text-slate-400">
                            / {ep.quota_allocated || ep.brief.estimated_tokens} T
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              ep.actual_tokens_used > allocated
                                ? 'bg-rose-500'
                                : 'bg-gradient-to-r from-purple-500 to-amber-500'
                            }`}
                            style={{ width: `${tokenPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Cột 5: Tuân thủ AI (Điều 44 & NĐ 142) */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {isPublished || isCompliancePassed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" /> Đạt Điều 44 & NĐ 142
                        </span>
                      ) : isSubmitted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Chờ Thẩm Định AI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                          Chưa kiểm định
                        </span>
                      )}
                    </td>

                    {/* Cột 6: Hành động chính */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      {isPlanPending ? (
                        <button
                          type="button"
                          onClick={() => onReviewPlan(ep.id)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs transition shadow-sm shadow-amber-500/20 active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <span>Duyệt kế hoạch & cấp quota</span>
                        </button>
                      ) : isSubmitted || isCompliancePassed ? (
                        <Link
                          href={`/reviewer/audit/${ep.id}`}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-ruby via-rose-600 to-purple-600 hover:from-ruby-dark hover:to-purple-700 text-white font-bold text-xs transition shadow-sm shadow-ruby/25 active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Thẩm định & gắn nhãn AI</span>
                        </Link>
                      ) : isPublished ? (
                        <Link
                          href={`/watch/${ep.id}`}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs transition cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem Chi Tiết OTT</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onReviewPlan(ep.id)}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-bold text-xs transition cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem Chi Tiết</span>
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
