import { Check } from 'lucide-react';
import type { useGenerationMeter } from './useGenerationMeter';

export interface GenerationMeterProps {
  meter: ReturnType<typeof useGenerationMeter>;
  isGenerating: boolean;
  targetCost: number;
}

/** Progress readout while a scene renders, then a short confirmation once it finishes. */
export function GenerationMeter({ meter, isGenerating, targetCost }: GenerationMeterProps) {
  const { progress, tokens, time, log, isCompletedRecently } = meter;

  if (isGenerating) {
    return (
      <div role="status" aria-live="polite" className="p-3.5 rounded-lg border border-purple-200 dark:border-purple-500/30 bg-purple-50/60 dark:bg-purple-500/[0.06] space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 tabular-nums">
          <span className="font-medium">Đang tạo… {progress}%</span>
          <span className="text-slate-500 dark:text-slate-400">
            {tokens}/{targetCost} token · {time}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-purple-100 dark:bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-purple-600 transition-[width] duration-100" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{log}</p>
      </div>
    );
  }

  if (isCompletedRecently) {
    return (
      <p role="status" className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-400">
        <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
        Đã tạo xong, dùng {targetCost} token trong {time}.
      </p>
    );
  }

  return null;
}
