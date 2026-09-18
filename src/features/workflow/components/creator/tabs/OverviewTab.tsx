import Link from 'next/link';
import {
  Film,
  Zap,
  Clock,
  Video,
  AlertCircle,
  FileText,
  Milestone as MilestoneIcon,
  Tag,
  Calendar,
  CheckCircle2,
  Circle,
  User,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { EpisodePackage, ProductionProject, ReviewLog } from '@/types/workflow';
import { Card } from '@/components/ui/Card';
import { StatBox } from '@/components/ui/StatBox';
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
}: OverviewTabProps) {
  const { setActiveMilestone, updateMilestoneStatus } = useWorkflowStore();

  const quotaAllocated = currentPackage?.quota_allocated ?? 0;
  const quotaUsed = currentPackage?.actual_tokens_used ?? 0;
  const quotaFillPercent = quotaAllocated > 0 ? Math.min(100, (quotaUsed / quotaAllocated) * 100) : 0;
  const completedJobsCount = currentPackage?.jobs?.filter((j) => j.status === 'completed').length || 0;
  const totalJobsCount = currentPackage?.jobs?.length || 0;

  const milestones = project.milestones || [];
  const activeMilestoneId = project.active_milestone_id;

  return (
    <div className="space-y-6">
      {/* Top Stat Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatBox
          icon={<Film className="w-3.5 h-3.5 text-ruby" />}
          label="Dự Án Tổng Thể"
          value={<span className="text-base truncate block">{project.title}</span>}
          hint={
            <>
              {project.total_episodes} Tập ·{' '}
              <span className="text-slate-700 dark:text-slate-300 font-medium">{project.genre?.[0] || 'Phim AI'}</span>
            </>
          }
        />

        <Card className={`p-4 ${isQuotaWarning ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">AI Token Quota</span>
            <Zap className={`w-3.5 h-3.5 ${isQuotaWarning ? 'text-rose-500' : 'text-amber-500'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{quotaUsed}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/ {quotaAllocated} T</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isQuotaWarning ? 'bg-rose-500' : 'bg-amber-400'}`}
              style={{ width: `${quotaFillPercent}%` }}
            />
          </div>
        </Card>

        <StatBox
          icon={<Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
          label="Kế Hoạch & Kịch Bản"
          value={
            <>
              {scenesCount} <span className="text-xs font-sans font-normal text-slate-500 dark:text-slate-400">Phân Cảnh</span>
            </>
          }
          hint={
            <>
              Dự toán: <span className="text-purple-600 dark:text-purple-400 font-mono font-medium">{estimatedTokens} Tokens</span>
            </>
          }
        />

        <StatBox
          icon={<Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
          label="Tiến Độ Studio"
          value={
            <>
              {completedJobsCount}/{totalJobsCount} <span className="text-xs font-sans font-normal text-slate-500 dark:text-slate-400">Phân Đoạn</span>
            </>
          }
          hint={
            <>
              Trạng thái: <span className="text-emerald-600 dark:text-emerald-400 font-medium">{currentPackage?.status}</span>
            </>
          }
        />
      </div>

      {latestFeedback && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-rose-700 dark:text-rose-400">Yêu cầu hiệu chỉnh từ Thẩm định viên (Checker):</h4>
            <p className="text-slate-700 dark:text-slate-200 mt-1 bg-white dark:bg-[#12141A] p-2.5 rounded-lg border border-rose-100 dark:border-rose-500/20">
              {latestFeedback.feedback_notes}
            </p>
            <button
              onClick={onGotoBrief}
              className="mt-2.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
            >
              Mở Form Kịch Bản Để Hiệu Chỉnh ➔
            </button>
          </div>
        </div>
      )}

      {/* Feature Section 1: Cột Mốc Tiến Độ Dự Án (Do Content Reviewer quy định) */}
      <Card className="p-5 space-y-4 shadow-xs border-purple-200 dark:border-purple-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MilestoneIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Cột Mốc Tiến Độ Dự Án (Do Content Reviewer quy định)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Content Creator chọn cột mốc để làm việc theo thời gian tiến độ của dự án
            </p>
          </div>
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 self-start sm:self-auto">
            {milestones.filter((m) => m.status === 'completed').length}/{milestones.length} Cột Mốc Đã Hoàn Thành
          </span>
        </div>

        {milestones.length === 0 ? (
          <div className="text-xs text-slate-500 py-3 text-center">Chưa có cột mốc nào được thiết lập cho dự án này.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {milestones.map((ms) => {
              const isActive = ms.id === activeMilestoneId;
              const isCompleted = ms.status === 'completed';
              const isInProgress = ms.status === 'in_progress';

              return (
                <div
                  key={ms.id}
                  className={`p-3.5 rounded-xl border transition-all space-y-2.5 relative ${
                    isActive
                      ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-400 dark:border-purple-500 ring-2 ring-purple-400/20 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : isInProgress ? (
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 animate-pulse" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{ms.title}</h4>
                    </div>

                    {isActive && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                        Đang làm
                      </span>
                    )}
                  </div>

                  {ms.description && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pl-6">{ms.description}</p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-white/10 text-[11px]">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Tiến độ:{' '}
                        <strong className="text-slate-700 dark:text-slate-300">
                          {ms.startDate ? `${ms.startDate} ➔ ${ms.deadline}` : ms.deadline}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => setActiveMilestone(ms.id)}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] transition cursor-pointer shadow-xs"
                        >
                          Chọn làm cột mốc này
                        </button>
                      )}

                      <select
                        value={ms.status}
                        onChange={(e) => updateMilestoneStatus(ms.id, e.target.value as any)}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-lg bg-white dark:bg-[#12141A] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="pending">Chưa thực hiện</option>
                        <option value="in_progress">Đang thực hiện</option>
                        <option value="completed">Đã hoàn thành ✓</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Feature Section 2: Xem Chi Tiết Nội Dung Dự Án */}
      <Card className="p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-ruby" /> Thông Tin & Nội Dung Dự Án
          </h3>
          <span className="text-[11px] text-slate-500">Người thực hiện: <strong className="text-slate-800 dark:text-slate-200">{project.creator_name}</strong></span>
        </div>

        {/* Tag Thể loại */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-ruby" /> Thể Loại Phim (Dạng Tag do Reviewer chọn):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {project.genre && project.genre.length > 0 ? (
              project.genre.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-ruby/10 text-ruby border border-ruby/20 shadow-xs"
                >
                  #{g}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Chưa phân loại</span>
            )}
          </div>
        </div>

        {/* Tóm tắt kịch bản */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Tóm Tắt Kịch Bản & Bối Cảnh Phim:</span>
          <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-200 dark:border-white/10 leading-relaxed">
            {synopsis || 'Chưa có tóm tắt kịch bản.'}
          </p>
        </div>

        {/* Thông tin metadata dự án */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200 dark:border-white/10">
            <span className="text-[10px] text-slate-500 font-semibold block">Tổng Số Tập Phim:</span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{project.total_episodes} Tập</span>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200 dark:border-white/10">
            <span className="text-[10px] text-slate-500 font-semibold block">Ngân Sách AI Tokens:</span>
            <span className="font-bold text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">{project.total_budget_tokens} Tokens</span>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200 dark:border-white/10">
            <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" /> Content Reviewer:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5 block">{project.reviewer_name}</span>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200 dark:border-white/10">
            <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Kế Hoạch Công Chiếu:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{project.planned_release_date}</span>
          </div>
        </div>
      </Card>

      {/* AI Studio Section */}
      <Card className="p-5 space-y-3 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Trạng Thái AI Studio các Cảnh Phim Tập {currentPackage?.episode_number}
        </h3>
        <div className="space-y-2 text-xs">
          {currentPackage?.jobs?.slice(0, 3).map((job) => (
            <div key={job.id} className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200 dark:border-white/10">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{job.title}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  job.status === 'completed'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                }`}
              >
                {job.status === 'completed' ? 'Hoàn tất' : 'Chờ sinh AI'}
              </span>
            </div>
          ))}
        </div>
        {canEnterStudio && currentPackage && (
          <Link
            href={`/creator/studio/${currentPackage.id}`}
            className="inline-flex text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold items-center gap-1 mt-2"
          >
            Chuyển vào AI Studio Workspace ➔
          </Link>
        )}
      </Card>
    </div>
  );
}
