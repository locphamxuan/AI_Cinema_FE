import { Plus, Trash2, Layers } from 'lucide-react';
import type { SceneBreakdownItem } from '@/types/workflow';

export interface SceneBreakdownEditorProps {
  scenes: SceneBreakdownItem[];
  onAddScene: () => void;
  onRemoveScene: (index: number) => void;
  onSceneChange: <K extends keyof SceneBreakdownItem>(index: number, field: K, value: SceneBreakdownItem[K]) => void;
}

/** Editable list of scenes inside a content brief — add/remove/edit title & AI prompts per scene. */
export function SceneBreakdownEditor({ scenes, onAddScene, onRemoveScene, onSceneChange }: SceneBreakdownEditorProps) {
  return (
    <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Phân Tích Chi Tiết Từng Phân Cảnh ({scenes.length} Cảnh)
        </h3>
        <button
          type="button"
          onClick={onAddScene}
          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Thêm Phân Cảnh
        </button>
      </div>

      <div className="space-y-3">
        {scenes.map((scene, idx) => (
          <div key={idx} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
              <span className="font-bold text-xs text-ruby flex items-center gap-1.5">Phân Cảnh #{scene.scene_number}</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={scene.title}
                  onChange={(e) => onSceneChange(idx, 'title', e.target.value)}
                  placeholder="Tiêu đề phân cảnh..."
                  className="bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-bold"
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

            <div className="text-xs">
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Visual Prompt AI:</label>
              <textarea
                rows={2}
                value={scene.visual_prompt}
                onChange={(e) => onSceneChange(idx, 'visual_prompt', e.target.value)}
                placeholder="Mô tả chi tiết góc quay, bối cảnh, nhân vật, chuyển động và hiệu ứng ánh sáng AI..."
                className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-lg p-2.5 font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-ruby focus:ring-1 focus:ring-ruby transition"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
