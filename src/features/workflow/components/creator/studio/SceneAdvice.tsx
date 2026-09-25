import { Link2, Plus, RefreshCw, Sparkles } from 'lucide-react';
import type { GenerationFunctionType } from '@/types/workflow';
import type { ApiSceneAdvice } from '@/types/workflow-api';
import { functionTypeOf } from '@/features/workflow/lib/jobAdapter';
import { FUNCTION_TYPE_META, ICON_BUTTON_CLASS, SMALL_BUTTON_CLASS } from './stepMeta';
import type { KeyedRequestState } from './useKeyedRequest';

type Gap = ApiSceneAdvice['gaps'][number];

const GAP_LABEL: Record<Gap['aspect'], string> = {
  video: 'Video chính',
  voice: 'Lồng tiếng',
  audio: 'Âm thanh',
  lighting: 'Ánh sáng',
  camera: 'Góc máy',
  continuity: 'Liên kết cảnh',
};

export interface SceneAdviceProps {
  state: KeyedRequestState<ApiSceneAdvice>;
  onRefresh: () => void;
  /** Prompts already added as drafts; their suggestions are not offered twice. */
  draftPrompts: string[];
  disabled: boolean;
  onAdd: (functionType: GenerationFunctionType, prompt: string) => void;
}

/**
 * What the selected scene still lacks, where it breaks continuity with its neighbours,
 * and prompts that fix both — to add to the scene as drafts in one click.
 */
export function SceneAdvice({ state, onRefresh, draftPrompts, disabled, onAdd }: SceneAdviceProps) {
  if (state.status === 'loading') {
    return <p className="text-xs text-slate-500 dark:text-slate-400">Đang đối chiếu cảnh với mô tả phim và các cảnh bên cạnh…</p>;
  }
  if (state.status === 'error') {
    return (
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-rose-600 dark:text-rose-400">{state.message}</p>
        <button type="button" onClick={onRefresh} className={`${SMALL_BUTTON_CLASS} text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 focus-visible:ring-purple-500/40`}>
          Thử lại
        </button>
      </div>
    );
  }

  const { summary, gaps, suggestions: all, source } = state.data;
  const continuity = gaps.filter((g) => g.aspect === 'continuity');
  const lacking = gaps.filter((g) => g.aspect !== 'continuity');
  const suggestions = all.filter((s) => !draftPrompts.includes(s.prompt));

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{summary}</p>
        <button type="button" onClick={onRefresh} aria-label="Kiểm tra lại cảnh" className={`${ICON_BUTTON_CLASS} hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 focus-visible:ring-purple-500/40`}>
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {lacking.length > 0 && (
        <ul aria-label="Phần còn thiếu" className="flex flex-wrap gap-1.5">
          {lacking.map((gap) => (
            <li key={gap.aspect} title={gap.message} className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              Thiếu: {GAP_LABEL[gap.aspect]}
            </li>
          ))}
        </ul>
      )}

      {continuity.length > 0 && (
        <div className="p-2.5 rounded-md bg-sky-50 dark:bg-sky-500/10 space-y-1">
          <p className="text-xs font-medium text-sky-800 dark:text-sky-300 inline-flex items-center gap-1">
            <Link2 className="w-3 h-3" aria-hidden="true" /> Liên kết với các cảnh bên cạnh
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-sky-900/80 dark:text-sky-200/80">
            {continuity.map((gap) => (
              <li key={gap.message}>{gap.message}</li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.length > 0 && (
        <ul className="space-y-2">
          {suggestions.map((suggestion) => {
            const functionType = functionTypeOf(suggestion.jobType);
            const { icon: TypeIcon, label } = FUNCTION_TYPE_META[functionType];
            return (
              <li key={`${suggestion.jobType}-${suggestion.prompt}`} className="p-2.5 rounded-lg border border-slate-200 dark:border-white/10 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 min-w-0">
                    <TypeIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{suggestion.title || label}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onAdd(functionType, suggestion.prompt)}
                    disabled={disabled}
                    className={`${SMALL_BUTTON_CLASS} shrink-0 inline-flex items-center gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20 focus-visible:ring-purple-500/40`}
                  >
                    <Plus className="w-3 h-3" aria-hidden="true" /> Thêm vào cảnh
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{suggestion.prompt}</p>
                {suggestion.reason && <p className="text-xs text-slate-400 dark:text-slate-500">{suggestion.reason}</p>}
              </li>
            );
          })}
        </ul>
      )}

      {source === 'ai' && (
        <p className="text-xs text-slate-400 dark:text-slate-500 inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3" aria-hidden="true" /> AI viết theo mô tả phim, cảnh trước và cảnh sau; không tính token.
        </p>
      )}
    </div>
  );
}
