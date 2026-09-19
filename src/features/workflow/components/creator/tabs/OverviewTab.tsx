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
  CheckCircle2,
  User,
  ShieldCheck,
  Coins,
  ArrowRight,
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
  onGotoStudio?: () => void;
  onGotoTokens?: () => void;
  onGotoReviews?: () => void;
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
  const completedJobsCount = currentPackage?.jobs?.filter((j) => j.status === 'completed').length || 0;
  const totalJobsCount = currentPackage?.jobs?.length || 0;

  const milestones = project.milestones || [];
  const activeMilestoneId = project.active_milestone_id;

  // 4 Chu trình sản xuất chuẩn hóa
  const stages = [
    {
      id: 'ms-1',
      index: 1,
      stepNumber: '01',
      title: 'Kịch Bản & Phân Cảnh',
      shortTitle: '1. Kịch bản',
      description: 'Hoàn thiện kịch bản chi tiết, dàn ý phân cảnh và visual prompt AI cho tập phim.',
      actionLabel: '✍️ Soạn Thảo Kịch Bản & Phân Cảnh',
      onAction: onGotoBrief,
      icon: FileText,
      defaultStatus: 'completed' as const,
    },
    {
      id: 'ms-2',
      index: 2,
      stepNumber: '02',
      title: 'Sản Xuất Video AI',
      shortTitle: '2. Sản xuất Video AI',
      description: 'Tạo clip 4K, lời thoại nhân vật và hiệu ứng âm thanh trong AI Studio.',
      actionLabel: '🎬 Vào AI Studio Sinh Clip',
      onAction: () => (onGotoStudio ? onGotoStudio() : onGotoBrief()),
      icon: Video,
      defaultStatus: 'in_progress' as const,
    },
    {
      id: 'ms-3',
      index: 3,
      stepNumber: '03',
      title: 'Phê Duyệt Quota',
      shortTitle: '3. Phê duyệt Quota',
      description: 'Thẩm định viên (Reviewer) xem xét kịch bản và cấp hạn ngạch AI Token sản xuất.',
      actionLabel: '🪙 Quản Lý Hạn Ngạch Tokens',
      onAction: () => (onGotoTokens ? onGotoTokens() : onGotoBrief()),
      icon: Coins,
      defaultStatus: 'pending' as const,
    },
    {
      id: 'ms-4',
      index: 4,
      stepNumber: '04',
      title: 'Kiểm Định & Đánh Giá',
      shortTitle: '4. Kiểm định',
      description: 'Thẩm định chất lượng bản dựng, kiểm định pháp lý AI theo NĐ 142 và công chiếu OTT.',
      actionLabel: '📋 Xem Báo Cáo & Phản Hồi Kiểm Định',
      onAction: () => (onGotoReviews ? onGotoReviews() : onGotoBrief()),
      icon: ShieldCheck,
      defaultStatus: 'pending' as const,
    },
  ];

  // Khớp nối từng stage với project.milestones
  const resolvedStages = stages.map((st, i) => {
    const matchedMilestone = milestones[i] || milestones.find((m) => m.id === st.id);
    const status = matchedMilestone?.status || st.defaultStatus;
    const deadline = matchedMilestone?.startDate
      ? `${matchedMilestone.startDate} ➔ ${matchedMilestone.deadline}`
      : matchedMilestone?.deadline;
    const milestoneId = matchedMilestone?.id || st.id;
    return {
      ...st,
      milestoneId,
      status,
      deadline,
      description: matchedMilestone?.description || st.description,
    };
  });

  // Xác định stage đang active
  const activeStageIndex = (() => {
    if (activeMilestoneId) {
      const idx = resolvedStages.findIndex((s) => s.milestoneId === activeMilestoneId);
      if (idx !== -1) return idx;
    }
    const inProg = resolvedStages.findIndex((s) => s.status === 'in_progress');
    if (inProg !== -1) return inProg;
    return 1; // Default to Stage 2: Sản xuất Video AI
  })();

  const currentStage = resolvedStages[activeStageIndex];

  return (
    <div className="space-y-6">
      {/* 1. Horizontal Stepper: Thanh Tiến Trình 4 Giai Đoạn Nối Nhau */}
      <Card className="p-5 space-y-4 shadow-xs border-purple-200/80 dark:border-purple-900/40 relative overflow-hidden">
        {/* Top subtle accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-purple-400" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MilestoneIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Tiến Trình Sản Xuất 4 Giai Đoạn (Maker-Checker Workflow)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quy trình sản xuất điện ảnh tuần tự từ kịch bản đến công chiếu
            </p>
          </div>
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 self-start sm:self-auto">
            Giai đoạn {activeStageIndex + 1}/4 đang diễn ra
          </span>
        </div>

        {/* Horizontal Connected Stepper Track */}
        <div className="pt-2 pb-1">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 relative">
            {resolvedStages.map((st, idx) => {
              const isCompleted = st.status === 'completed';
              const isActive = idx === activeStageIndex;

              return (
                <div
                  key={st.id}
                  onClick={() => {
                    setActiveMilestone(st.milestoneId);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                    isActive
                      ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30 shadow-md shadow-purple-500/10'
                      : isCompleted
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/40 hover:border-emerald-400'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {/* Step Header with Circle & Number */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isActive
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.stepNumber}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {st.shortTitle}
                      </span>
                    </div>

                    {/* Stage status badge */}
                    {isActive ? (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                        Đang làm
                      </span>
                    ) : isCompleted ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        Xong ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Chờ
                      </span>
                    )}
                  </div>

                  {/* Step Description */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {st.description}
                  </p>

                  {/* Step Footer with Deadline & Status Select */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-white/10 text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                      {st.deadline ? `📅 ${st.deadline}` : 'Tiến độ kế hoạch'}
                    </span>

                    <select
                      value={st.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateMilestoneStatus(st.milestoneId, e.target.value as any);
                      }}
                      className="px-1.5 py-0.5 text-[10px] font-medium rounded-lg bg-white dark:bg-[#12141A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="pending">Chưa làm</option>
                      <option value="in_progress">Đang làm</option>
                      <option value="completed">Đã xong ✓</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Stage Call-To-Action Banner (1 nút duy nhất) */}
        {currentStage && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-purple-300">Giai đoạn đang làm việc:</span>
                <span className="text-white font-extrabold">{currentStage.title}</span>
                {currentStage.deadline && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-200 border border-purple-500/30">
                    Hạn chót: {currentStage.deadline}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                {currentStage.description}
              </p>
            </div>

            {/* Exactly 1 Single CTA Button */}
            <button
              type="button"
              onClick={currentStage.onAction}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-purple-600/30 active:scale-95 cursor-pointer shrink-0"
            >
              <span>{currentStage.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </Card>

      {/* 2. Hàng Ngang 4 Ô Thông Số Đồng Đều (Token Quota, Tiến Độ, Kịch Bản, Dự Án) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatBox
          icon={<Film className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
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
            <Zap className={`w-3.5 h-3.5 ${isQuotaWarning ? 'text-rose-500' : 'text-purple-500'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{quotaUsed}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/ {quotaAllocated} T</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isQuotaWarning ? 'bg-rose-500' : 'bg-purple-500'}`}
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
          icon={<Video className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
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

      {/* Yêu cầu hiệu chỉnh từ Checker nếu có */}
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

      {/* AI Studio Section: Cảnh Phim Tập Hiện Tại */}
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

      {/* 3. Khung Đọc Kịch Bản & Thông Tin Tham Khảo (Đặt Dưới Cùng) */}
      <Card className="p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Khung Đọc Kịch Bản & Thông Tin Tham Khảo
          </h3>
          <span className="text-[11px] text-slate-500">
            Người thực hiện: <strong className="text-slate-800 dark:text-slate-200">{project.creator_name}</strong>
          </span>
        </div>

        {/* Thể loại phim */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Thể Loại Phim:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {project.genre && project.genre.length > 0 ? (
              project.genre.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 shadow-xs"
                >
                  #{g}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Chưa phân loại</span>
            )}
          </div>
        </div>

        {/* Tóm tắt kịch bản & bối cảnh phim */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Tóm Tắt Kịch Bản & Bối Cảnh Phim:
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 leading-relaxed font-normal">
            {synopsis || 'Chưa có tóm tắt kịch bản cho tập phim này.'}
          </p>
        </div>

        {/* Metadata dự án */}
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
    </div>
  );
}
