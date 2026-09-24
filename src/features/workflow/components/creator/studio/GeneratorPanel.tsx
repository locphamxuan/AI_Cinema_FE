import { Video, Mic, Volume2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import type { GenerationJob, GenerationStep, GenerationFunctionType } from '@/types/workflow';
import { useEffect, useRef } from 'react';
import type { ModelMatch } from '@/types/workflow';
import { isDraftStep } from '@/features/workflow/lib/jobAdapter';
import { useGenerationMeter } from './useGenerationMeter';
import { GenerationMeter } from './GenerationMeter';

const FUNCTION_TYPE_META: Record<GenerationFunctionType, { label: string; icon: React.ComponentType<{ className?: string }>; placeholder: string }> = {
  VIDEO: {
    label: 'Video',
    icon: Video,
    placeholder: 'Mô tả góc máy, bối cảnh và ánh sáng. Ví dụ: toàn cảnh phòng thí nghiệm, ánh đèn xanh lạnh…',
  },
  IMAGE: {
    label: 'Hình ảnh',
    icon: ImageIcon,
    placeholder: 'Mô tả hình ảnh cần tạo. Ví dụ: poster nhân vật chính, tranh phác thảo bối cảnh…',
  },
  SCRIPT_VOICE: {
    label: 'Lời thoại',
    icon: Mic,
    placeholder: 'Nhập lời thoại và ngữ điệu. Ví dụ: Minh Anh: "Hệ thống đang tự viết lại nhận thức."',
  },
  AUDIO_MUSIC: {
    label: 'Âm thanh',
    icon: Volume2,
    placeholder: 'Mô tả âm thanh hoặc nhạc nền. Ví dụ: tiếng bước chân trên sàn kim loại, còi báo động xa…',
  },
  CUSTOM: {
    label: 'Khác',
    icon: Plus,
    placeholder: 'Mô tả kết quả bạn muốn nhận được…',
  },
};

const FUNCTION_TYPES = Object.keys(FUNCTION_TYPE_META) as GenerationFunctionType[];

const MATCH_HINT: Record<ModelMatch, string> = {
  catalog: '',
  pending: 'Nhập chức năng bạn muốn làm, hệ thống sẽ tự tìm model phù hợp.',
  specialist: 'Đã tìm được model chuyên biệt cho chức năng này.',
  general: 'Chưa có model chuyên biệt, hệ thống dùng model đa năng để thực hiện.',
};

const STEP_STATUS_LABEL: Record<GenerationStep['status'], string> = {
  pending: 'Đang chờ',
  processing: 'Đang tạo',
  completed: 'Đã tạo',
  failed: 'Lỗi',
};

const INPUT_CLASS =
  'w-full bg-white dark:bg-[#101218] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 transition';

export interface GeneratorPanelProps {
  selectedJob?: GenerationJob;
  steps: GenerationStep[];
  onAddStep: () => void;
  onUpdateStep: (stepId: string, data: Partial<GenerationStep>) => void;
  /** Changes a step's function; the backend picks its model (BR-40). */
  onRouteStep: (stepId: string, change: Pick<GenerationStep, 'function_type' | 'custom_function'>) => void;
  onRemoveStep: (stepId: string) => void;
  isGenerating: boolean;
  onGenerateSelected: () => void;
}

export function GeneratorPanel({
  selectedJob,
  steps,
  onAddStep,
  onUpdateStep,
  onRouteStep,
  onRemoveStep,
  isGenerating,
  onGenerateSelected,
}: GeneratorPanelProps) {
  // Route a custom function once the Creator pauses typing, not on every key.
  const routeTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  useEffect(() => {
    const timers = routeTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);
  const describeCustomFunction = (stepId: string, customFunction: string) => {
    onUpdateStep(stepId, { custom_function: customFunction, selected_model: '', token_cost: 0, model_match: 'pending' });
    clearTimeout(routeTimers.current[stepId]);
    routeTimers.current[stepId] = setTimeout(() => onRouteStep(stepId, { function_type: 'CUSTOM', custom_function: customFunction }), 400);
  };

  const drafts = steps.filter((s) => isDraftStep(s));
  // Generating runs the drafts; without drafts it regenerates every saved step.
  const toRun = drafts.length > 0 ? drafts : steps;
  const targetCost = toRun.reduce((sum, s) => sum + (s.token_cost || 0), 0);
  const meter = useGenerationMeter(isGenerating, targetCost);

  return (
    <section aria-labelledby="generator-title" className="bg-white dark:bg-[#151822] p-5 rounded-xl border border-slate-200 dark:border-white/10 space-y-5">
      <h2 id="generator-title" className="text-sm font-semibold text-slate-900 dark:text-white">
        Nội dung phân cảnh
      </h2>

      <p className="text-sm text-slate-700 dark:text-slate-200">
        {selectedJob ? `Cảnh ${selectedJob.scene_number}: ${selectedJob.title}` : 'Kế hoạch chưa có phân cảnh nào.'}
      </p>

      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Cần tạo gì cho cảnh này?</p>

        {steps.length === 0 && (
          <p className="text-center py-6 rounded-lg border border-dashed border-slate-200 dark:border-white/10 text-xs text-slate-400 dark:text-slate-500">
            Chưa có mục nào. Bấm &quot;Thêm mục&quot; để bắt đầu.
          </p>
        )}

        {steps.map((step) => {
          const meta = FUNCTION_TYPE_META[step.function_type];
          const match = step.model_match ?? 'pending';
          if (!isDraftStep(step)) {
            const { icon: TypeIcon, label } = meta;
            return (
              <div key={step.id} className="p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                    <TypeIcon className="w-3 h-3" aria-hidden="true" />
                    {step.function_type === 'CUSTOM' ? step.custom_function : label} · {step.selected_model}
                  </span>
                  <span className={step.status === 'failed' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}>
                    {STEP_STATUS_LABEL[step.status]}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{step.prompt}</p>
                <p className="text-right text-xs text-slate-400 dark:text-slate-500 tabular-nums">{step.token_cost} token</p>
              </div>
            );
          }
          return (
            <div key={step.id} className="p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div role="group" aria-label="Loại nội dung" className="flex items-center gap-1.5 flex-wrap">
                  {FUNCTION_TYPES.map((type) => {
                    const { icon: TypeIcon, label } = FUNCTION_TYPE_META[type];
                    const isSelected = step.function_type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onRouteStep(step.id, { function_type: type, custom_function: step.custom_function })}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-purple-400'
                        }`}
                      >
                        <TypeIcon className="w-3 h-3" aria-hidden="true" />
                        {label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveStep(step.id)}
                  aria-label="Xóa mục này"
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {step.function_type === 'CUSTOM' && (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={step.custom_function ?? ''}
                    onChange={(e) => describeCustomFunction(step.id, e.target.value)}
                    aria-label="Chức năng bạn muốn làm"
                    placeholder="Bạn muốn làm gì? Ví dụ: đồng bộ khẩu hình, dịch phụ đề, chỉnh màu…"
                    autoComplete="off"
                    className={INPUT_CLASS}
                  />
                  <p aria-live="polite" className={`text-xs ${match === 'pending' ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {MATCH_HINT[match]}
                  </p>
                </div>
              )}

              <textarea
                value={step.prompt}
                onChange={(e) => onUpdateStep(step.id, { prompt: e.target.value })}
                rows={2}
                aria-label="Mô tả nội dung cần tạo"
                placeholder={meta.placeholder}
                className={`${INPUT_CLASS} resize-none leading-relaxed`}
              />

              <p className="text-right text-xs text-slate-400 dark:text-slate-500 tabular-nums">~{step.token_cost} token</p>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onAddStep}
          disabled={!selectedJob}
          className="w-full py-2 rounded-lg border border-dashed border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm mục
        </button>
      </div>

      <GenerationMeter meter={meter} isGenerating={isGenerating} targetCost={targetCost} />

      <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          {toRun.length} mục sẽ tạo · dự kiến {targetCost} token
        </p>
        <div>
          <button
            type="button"
            onClick={onGenerateSelected}
            disabled={isGenerating || toRun.length === 0}
            className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#151822]"
          >
            {isGenerating ? 'Đang tạo…' : drafts.length > 0 || steps.length === 0 ? 'Tạo clip' : 'Tạo lại'}
          </button>
        </div>
      </div>
    </section>
  );
}
