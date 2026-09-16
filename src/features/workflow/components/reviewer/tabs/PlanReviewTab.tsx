import { FileText, CheckCircle2 } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';

export interface PlanReviewTabProps {
  currentPackage?: EpisodePackage;
  onRequestChanges: () => void;
  onAllocateQuota: () => void;
}

export function PlanReviewTab({ currentPackage, onRequestChanges, onAllocateQuota }: PlanReviewTabProps) {
  const brief = currentPackage?.brief;

  return (
    <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Thẩm Định Kịch Bản & Cấp AI Token Quota
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Đang thẩm định: <strong className="text-slate-900 dark:text-white">{currentPackage?.title}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRequestChanges}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition cursor-pointer"
          >
            Yêu Cầu Chỉnh Sửa Kế Hoạch
          </button>
          <button
            onClick={onAllocateQuota}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 dark:shadow-none flex items-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> Phê Duyệt & Cấp Quota AI
          </button>
        </div>
      </div>

      {brief ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                Tóm Tắt Cốt Truyện (Synopsis)
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">{brief.synopsis}</p>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                Kịch Bản Chi Tiết (Overview Script)
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">{brief.overview_script}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Phân Tích Từng Phân Cảnh ({brief.scene_breakdown.length} Cảnh):
              </h4>
              {brief.scene_breakdown.map((sc) => (
                <div key={sc.scene_number} className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 text-xs space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                    <span className="text-purple-700 dark:text-purple-400">
                      Cảnh {sc.scene_number}: {sc.title}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-mono">
                      {sc.estimated_tokens} Tokens · {sc.target_duration_sec}s
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{sc.description}</p>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-[#12141A] p-2 rounded border border-slate-200 dark:border-white/10">
                    Visual: {sc.visual_prompt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-white/10 pb-2">
              Dự Toán Ngân Sách
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Thời lượng dự kiến:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{brief.target_duration_minutes} Phút</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Tokens đề xuất:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{brief.estimated_tokens} Tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Trạng thái duyệt:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{currentPackage?.status}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
          Tập phim này chưa được nộp bản kế hoạch Content Brief.
        </div>
      )}
    </div>
  );
}
