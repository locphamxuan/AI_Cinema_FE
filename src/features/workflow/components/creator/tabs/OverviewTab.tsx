import Link from 'next/link';
import { Film, Zap, Clock, Video, AlertCircle, FileText } from 'lucide-react';
import type { EpisodePackage, ProductionProject, ReviewLog } from '@/types/workflow';
import { Card } from '@/components/ui/Card';
import { StatBox } from '@/components/ui/StatBox';

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
  const quotaAllocated = currentPackage?.quota_allocated ?? 0;
  const quotaUsed = currentPackage?.actual_tokens_used ?? 0;
  const quotaFillPercent = quotaAllocated > 0 ? Math.min(100, (quotaUsed / quotaAllocated) * 100) : 0;
  const completedJobsCount = currentPackage?.jobs?.filter((j) => j.status === 'completed').length || 0;
  const totalJobsCount = currentPackage?.jobs?.length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatBox
          icon={<Film className="w-3.5 h-3.5 text-ruby" />}
          label="Dự Án Tổng Thể"
          value={<span className="text-base truncate block">{project.title}</span>}
          hint={
            <>
              {project.total_episodes} Tập · <span className="text-slate-700 dark:text-slate-300 font-medium">{project.genre[0]}</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-5 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-ruby" /> Tóm Tắt Kịch Bản & Bối Cảnh
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 leading-relaxed">
            {synopsis || 'Chưa có tóm tắt kịch bản.'}
          </p>
          <button onClick={onGotoBrief} className="text-xs text-ruby hover:underline font-semibold flex items-center gap-1 cursor-pointer">
            Xem toàn bộ {scenesCount} phân cảnh ➔
          </button>
        </Card>

        <Card className="p-5 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Trạng Thái AI Studio
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
    </div>
  );
}
