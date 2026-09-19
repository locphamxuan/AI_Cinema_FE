import { useState } from 'react';
import { FileText, CheckCircle2, Clock, Zap, Layers, AlertCircle, Edit3, Film, AlertTriangle, X } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export interface PlanReviewTabProps {
  currentPackage?: EpisodePackage;
  onRequestChanges: () => void;
  onAllocateQuota: () => void;
}

export function PlanReviewTab({ currentPackage, onRequestChanges, onAllocateQuota }: PlanReviewTabProps) {
  const reviewScene = useWorkflowStore((s) => s.reviewScene);
  const targetDuration = currentPackage?.target_duration_minutes || 0;
  const brief = currentPackage?.brief;
  const durationMismatch = Boolean(
    brief && targetDuration > 0 && Math.abs(brief.target_duration_minutes - targetDuration) / targetDuration > 0.15
  );
  const cleanTitle = currentPackage?.title?.replace(/^Tập\s*\d+\s*[:\-]\s*/i, '') || currentPackage?.title || 'Chưa đặt tên';

  const [reworkTarget, setReworkTarget] = useState<number | null>(null);
  const [reworkComment, setReworkComment] = useState('');

  const allScenesApproved = Boolean(brief && brief.scene_reviews.length > 0 && brief.scene_reviews.every((sr) => sr.status === 'approved'));

  const handleApproveScene = (sceneNumber: number) => {
    if (!currentPackage) return;
    reviewScene(currentPackage.id, sceneNumber, 'approved');
  };

  const handleOpenRework = (sceneNumber: number) => {
    setReworkTarget(sceneNumber);
    setReworkComment('');
  };

  const handleConfirmRework = () => {
    if (!currentPackage || reworkTarget === null || !reworkComment.trim()) return;
    reviewScene(currentPackage.id, reworkTarget, 'changes_requested', reworkComment.trim());
    setReworkTarget(null);
    setReworkComment('');
  };

  return (
    <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 space-y-5 shadow-xs transition-colors">
      {/* Episode Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-500/30">
                Mùa {currentPackage?.season_number || 1} · Tập {currentPackage?.episode_number || 1}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{cleanTitle}</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Duyệt kịch bản tổng thể và từng phân cảnh trước khi cấp Token Quota</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onRequestChanges}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-rose-500" />
            <span>Yêu Cầu Sửa Toàn Bộ</span>
          </button>
          <button
            onClick={onAllocateQuota}
            disabled={!allScenesApproved}
            title={allScenesApproved ? undefined : 'Cần duyệt hết tất cả phân cảnh trước khi cấp Quota'}
            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition ${
              allScenesApproved
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-600/20 cursor-pointer'
                : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Duyệt & Cấp Quota</span>
          </button>
        </div>
      </div>

      {brief ? (
        <div className="space-y-5">
          {/* KPI Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`p-3 rounded-xl border flex items-center gap-3 ${
                durationMismatch
                  ? 'bg-amber-50/80 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
                  : 'bg-slate-50/80 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/5'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${durationMismatch ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Thời lượng đề xuất</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {brief.target_duration_minutes} / {targetDuration} Phút
                </div>
                {durationMismatch && <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Lệch mốc dự án</div>}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tokens dự toán</div>
                <div className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 truncate">{brief.estimated_tokens} Tokens</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quy mô phân cảnh</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{brief.scene_breakdown.length} Cảnh</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Cảnh đã duyệt</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                  {brief.scene_reviews.filter((sr) => sr.status === 'approved').length}/{brief.scene_reviews.length}
                </div>
              </div>
            </div>
          </div>

          {/* Overall Script */}
          <div className="bg-slate-50/60 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-200/80 dark:border-white/5 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Kịch bản tổng thể
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">{brief.overview_script}</p>
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
              {brief.scene_breakdown.map((sc) => {
                const review = brief.scene_reviews.find((sr) => sr.scene_number === sc.scene_number);
                const status = review?.status || 'pending';

                return (
                  <div
                    key={sc.scene_number}
                    className={`p-3.5 rounded-xl border space-y-2.5 transition ${
                      status === 'changes_requested'
                        ? 'bg-rose-50/60 dark:bg-rose-500/[0.06] border-rose-300 dark:border-rose-500/40'
                        : status === 'approved'
                        ? 'bg-emerald-50/50 dark:bg-emerald-500/[0.05] border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-slate-50/70 dark:bg-white/[0.03] border-slate-200/70 dark:border-white/5'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-[11px] flex items-center justify-center">
                          {sc.scene_number}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sc.title}</h4>
                        {status === 'approved' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                          </span>
                        )}
                        {status === 'changes_requested' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300">
                            <AlertTriangle className="w-3 h-3" /> Yêu cầu làm lại
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-medium">
                          {sc.target_duration_sec}s
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono font-semibold border border-amber-200/60 dark:border-amber-500/20">
                          {sc.estimated_tokens} Tokens
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{sc.description}</p>

                    {status === 'changes_requested' && review?.comment && (
                      <div className="text-[11px] text-rose-700 dark:text-rose-300 bg-white dark:bg-[#161922] border border-rose-200 dark:border-rose-500/30 rounded-lg p-2.5">
                        <strong>Ghi chú đã gửi:</strong> {review.comment}
                      </div>
                    )}

                    {reworkTarget === sc.scene_number ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          autoFocus
                          rows={2}
                          value={reworkComment}
                          onChange={(e) => setReworkComment(e.target.value)}
                          placeholder="Mô tả cụ thể phân cảnh này cần sửa gì..."
                          className="w-full bg-white dark:bg-[#12141A] border border-rose-300 dark:border-rose-500/40 rounded-lg p-2.5 text-[11px] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleConfirmRework}
                            disabled={!reworkComment.trim()}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-[11px] font-bold transition cursor-pointer"
                          >
                            Gửi yêu cầu làm lại
                          </button>
                          <button
                            onClick={() => setReworkTarget(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <X className="w-3 h-3" /> Huỷ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleApproveScene(sc.scene_number)}
                          disabled={status === 'approved'}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-default text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt cảnh này
                        </button>
                        <button
                          onClick={() => handleOpenRework(sc.scene_number)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Yêu cầu làm lại
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
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
