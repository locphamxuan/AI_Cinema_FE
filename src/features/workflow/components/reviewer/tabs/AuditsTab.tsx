import Link from 'next/link';
import { ShieldCheck, Clock, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { ProductionProject, WorkflowState } from '@/types/workflow';

export interface AuditsTabProps {
  project: ProductionProject;
}

export function AuditsTab({ project }: AuditsTabProps) {
  const passedCount = project.episodes.filter(
    (e) => e.status === 'COMPLIANCE_PASSED' || e.status === 'PUBLISHED'
  ).length;

  const getStatusDot = (status: WorkflowState) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Đã Phát Hành
          </span>
        );
      case 'COMPLIANCE_PASSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Đạt Chuẩn Pháp Lý
          </span>
        );
      case 'EPISODE_SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 animate-pulse" />
            Chờ Thẩm Định Video
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            Yêu Cầu Sửa Đổi
          </span>
        );
      case 'PLAN_PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Chờ Duyệt Quota
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            Đang Sản Xuất
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 space-y-6 shadow-xs transition-colors">
      {/* Sleek Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Trạm Kiểm Định Tuân Thủ & Pháp Lý Video
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rà soát Điều 44 Luật AI, Nghị định 142 và kiểm duyệt bản dựng trước khi phát hành OTT
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {passedCount}/{project.episodes.length} Tập Đã Đạt Chuẩn
          </span>
        </div>
      </div>

      {/* Modern SaaS Episode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project.episodes.map((ep) => {
          const isPassed = ep.status === 'COMPLIANCE_PASSED' || ep.status === 'PUBLISHED';
          const isPendingAudit = ep.status === 'EPISODE_SUBMITTED';
          const cleanTitle = ep.title?.replace(/^Tập\s*\d+\s*[:\-]\s*/i, '') || ep.title;

          return (
            <div
              key={ep.id}
              className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-white/15 transition-all"
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{ep.episode_number}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {cleanTitle}
                    </h3>
                  </div>
                  <div className="shrink-0">{getStatusDot(ep.status)}</div>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {ep.total_duration}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Zap className="w-3.5 h-3.5 text-indigo-500" />
                    {ep.actual_tokens_used.toLocaleString()} Tokens
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {isPassed ? 'Sẵn sàng phân phối' : isPendingAudit ? 'Bản dựng chờ duyệt' : 'Chờ hoàn tất bản dựng'}
                </span>

                <Link
                  href={`/reviewer/audit/${ep.id}`}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    isPendingAudit
                      ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white shadow-xs font-semibold'
                      : isPassed
                      ? 'bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                      : 'bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <span>{isPendingAudit ? 'Kiểm Định Ngay' : isPassed ? 'Xem Báo Cáo' : 'Kiểm Định Chi Tiết'}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
