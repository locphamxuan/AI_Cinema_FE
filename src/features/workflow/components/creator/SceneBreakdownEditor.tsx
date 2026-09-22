import { Plus, Trash2, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { SceneBreakdownItem, SceneReview } from '@/types/workflow';

export interface SceneBreakdownEditorProps {
  scenes: SceneBreakdownItem[];
  sceneReviews?: SceneReview[];
  onAddScene: () => void;
  onRemoveScene: (index: number) => void;
  onSceneChange: <K extends keyof SceneBreakdownItem>(index: number, field: K, value: SceneBreakdownItem[K]) => void;
}

export function SceneBreakdownEditor({ scenes = [], sceneReviews = [], onAddScene, onRemoveScene, onSceneChange }: SceneBreakdownEditorProps) {
  const safeScenes = scenes || [];
  return (
    <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Phân Tích Chi Tiết Từng Phân Cảnh ({safeScenes.length} Cảnh)
        </h3>
        <button
          type="button"
          onClick={onAddScene}
          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Thêm phân cảnh
        </button>
      </div>

      <div className="space-y-3">
        {safeScenes.map((scene, idx) => {
          const review = sceneReviews?.find((sr) => sr.scene_number === scene.scene_number);
          const needsRework = review?.status === 'changes_requested';
          const isApproved = review?.status === 'approved';

          return (
            <div
              key={idx}
              className={`border rounded-xl p-4 space-y-3 ${
                needsRework
                  ? 'bg-rose-50/60 dark:bg-rose-500/[0.06] border-rose-300 dark:border-rose-500/40'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-purple-600 dark:text-purple-400">Phân cảnh {scene.scene_number}</span>
                  {needsRework && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300">
                      <AlertTriangle className="w-3 h-3" /> Cần làm lại
                    </span>
                  )}
                  {isApproved && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="text"
                    value={scene.title}
                    onChange={(e) => onSceneChange(idx, 'title', e.target.value)}
                    placeholder="Tiêu đề phân cảnh…"
                    className="bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-bold min-w-0 w-full sm:w-64 focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveScene(idx)}
                    aria-label={`Xoá phân cảnh ${scene.scene_number}`}
                    className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {needsRework && review?.comment && (
                <div className="text-[11px] text-rose-700 dark:text-rose-300 bg-white dark:bg-[#161922] border border-rose-200 dark:border-rose-500/30 rounded-lg p-2.5">
                  <strong>Ghi chú của Reviewer:</strong> {review.comment}
                </div>
              )}

              <div className="text-xs">
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Mô tả phân cảnh</label>
                <textarea
                  rows={2}
                  value={scene.description}
                  onChange={(e) => onSceneChange(idx, 'description', e.target.value)}
                  placeholder="Mô tả bối cảnh, nhân vật và diễn biến chính của phân cảnh này…"
                  className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-lg p-2.5 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus-visible:border-purple-500 focus-visible:ring-1 focus-visible:ring-purple-500 transition leading-relaxed"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
