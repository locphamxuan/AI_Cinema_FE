import { FileText, CheckCircle2, Clock, Zap, Layers, AlertCircle, Edit3, Film } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';

export interface PlanReviewTabProps {
  currentPackage?: EpisodePackage;
  onRequestChanges: () => void;
  onAllocateQuota: () => void;
}

export function PlanReviewTab({ currentPackage, onRequestChanges, onAllocateQuota }: PlanReviewTabProps) {
  const brief = currentPackage?.brief;
  const cleanTitle = currentPackage?.title?.replace(/^Tập\s*\d+\s*[:\-]\s*/i, '') || currentPackage?.title || 'Chưa đặt tên';

  return (
    <div className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 space-y-5 shadow-xs transition-colors">
      {/* Sleek Episode Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-[11px] font-mono font-semibold border border-slate-200/80 dark:border-white/10">
                Tập {currentPackage?.episode_number || 1}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {cleanTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bản thảo Content Brief & Phân bổ hạn mức Token sản xuất
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onRequestChanges}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/30 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-rose-500" />
            <span>Yêu Cầu Sửa</span>
          </button>
          <button
            onClick={onAllocateQuota}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Duyệt & Cấp Quota</span>
          </button>
        </div>
      </div>

      {brief ? (
        <div className="space-y-5">
          {/* KPI Metrics Row - Clean SaaS Stat Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Thời lượng</div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white truncate">
                  {brief.target_duration_minutes} Phút
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tokens dự toán</div>
                <div className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 truncate">
                  {brief.estimated_tokens.toLocaleString()} Tokens
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quy mô phân cảnh</div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white truncate">
                  {brief.scene_breakdown.length} Cảnh
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Trạng thái duyệt</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    currentPackage?.status === 'PLAN_PENDING' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {currentPackage?.status === 'PLAN_PENDING' ? 'Chờ duyệt Quota' : currentPackage?.status || 'Bình thường'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Unified Script Synopsis & Overview Card */}
          <div className="bg-slate-50/50 dark:bg-white/[0.02] p-4 sm:p-5 rounded-xl border border-slate-200/70 dark:border-white/5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" /> Tóm tắt cốt truyện
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {brief.synopsis}
                </p>
              </div>
              <div className="space-y-1.5 md:border-l md:border-slate-200/80 md:dark:border-white/5 md:pl-4">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" /> Kịch bản chi tiết
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {brief.overview_script}
                </p>
              </div>
            </div>
          </div>

          {/* Scene Breakdown Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>Phân tích từng phân cảnh</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/5">
                  {brief.scene_breakdown.length} cảnh
                </span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {brief.scene_breakdown.map((sc) => (
                <div
                  key={sc.scene_number}
                  className="bg-slate-50/50 dark:bg-white/[0.02] p-3.5 sm:p-4 rounded-xl border border-slate-200/70 dark:border-white/5 space-y-2 hover:border-indigo-200 dark:hover:border-indigo-500/20 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 font-mono font-bold text-[11px] flex items-center justify-center border border-slate-200/80 dark:border-white/10">
                        {sc.scene_number}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {sc.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-mono font-medium border border-slate-200/50 dark:border-white/5">
                        ⏱ {sc.target_duration_sec}s
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-mono font-semibold border border-indigo-200/50 dark:border-indigo-500/20">
                        🪙 {sc.estimated_tokens} Tokens
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sc.description}
                  </p>

                  {sc.visual_prompt && (
                    <div className="bg-white dark:bg-[#11131a] p-3 rounded-lg border border-slate-200/80 dark:border-white/5 space-y-1 text-[11px]">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 select-none block uppercase text-[10px] tracking-wider">
                        Visual Prompt:
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 font-mono italic leading-relaxed block">
                        {sc.visual_prompt}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 space-y-2">
          <Film className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Tập phim này chưa được nộp bản kế hoạch Content Brief.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Vui lòng chuyển qua tập khác từ danh sách bên trái hoặc chờ Creator hoàn tất kế hoạch.
          </p>
        </div>
      )}
    </div>
  );
}
