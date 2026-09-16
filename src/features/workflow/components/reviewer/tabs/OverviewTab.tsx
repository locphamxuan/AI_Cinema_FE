import Link from 'next/link';
import { Clock, BadgeCheck, Zap, Tv, ShieldCheck } from 'lucide-react';
import type { ProductionProject } from '@/types/workflow';
import { StatBox } from '@/components/ui/StatBox';
import { StatusBadge } from '../../shared/StatusBadge';

export interface ReviewerOverviewTabProps {
  project: ProductionProject;
  pendingPlanCount: number;
  submittedCount: number;
  onReviewPlan: (episodeId: string) => void;
}

export function OverviewTab({ project, pendingPlanCount, submittedCount, onReviewPlan }: ReviewerOverviewTabProps) {
  const publishedCount = project.episodes.filter((e) => e.status === 'PUBLISHED').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatBox
          icon={<Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
          label="Kế Hoạch Chờ Duyệt"
          value={
            <span className="text-amber-600 dark:text-amber-400">
              {pendingPlanCount} <span className="text-xs font-sans font-normal text-slate-500 dark:text-slate-400">Tập</span>
            </span>
          }
          hint="Cần xem xét Content Brief"
        />
        <StatBox
          icon={<BadgeCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
          label="Video Chờ Kiểm Toán"
          value={
            <span className="text-purple-600 dark:text-purple-400">
              {submittedCount} <span className="text-xs font-sans font-normal text-slate-500 dark:text-slate-400">Tập</span>
            </span>
          }
          hint="Đã hoàn thành phân cảnh AI"
        />
        <StatBox
          icon={<Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
          label="Quota Đã Phân Bổ"
          value={
            <>
              {project.allocated_tokens} <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/ {project.total_budget_tokens} T</span>
            </>
          }
          hint={
            <>
              Maker đã dùng: <span className="text-amber-600 dark:text-amber-400 font-mono font-medium">{project.consumed_tokens} T</span>
            </>
          }
        />
        <StatBox
          icon={<Tv className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          label="Đã Lên Sóng OTT"
          value={
            <span className="text-emerald-600 dark:text-emerald-400">
              {publishedCount} <span className="text-xs font-sans font-normal text-slate-500 dark:text-slate-400">Tập</span>
            </span>
          }
          hint="Đạt chuẩn Điều 44 & NĐ 142"
        />
      </div>

      <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Danh Sách Gói Phim Cần Thẩm Định
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Hàng đợi kiểm toán realtime</span>
        </div>

        <div className="space-y-3">
          {project.episodes.map((ep) => (
            <div
              key={ep.id}
              className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-white/20 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#12141A] border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 shrink-0 shadow-xs">
                  #{ep.episode_number}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ep.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Thời lượng: {ep.total_duration} · Tiêu thụ: {ep.actual_tokens_used}/{ep.quota_allocated} Tokens
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={ep.status} />

                {ep.status === 'PLAN_PENDING' && (
                  <button
                    onClick={() => onReviewPlan(ep.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                  >
                    Duyệt Kế Hoạch ➔
                  </button>
                )}

                {(ep.status === 'EPISODE_SUBMITTED' || ep.status === 'COMPLIANCE_PASSED') && (
                  <Link
                    href={`/reviewer/audit/${ep.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <BadgeCheck className="w-3.5 h-3.5" /> Kiểm Định & Phát Hành ➔
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
