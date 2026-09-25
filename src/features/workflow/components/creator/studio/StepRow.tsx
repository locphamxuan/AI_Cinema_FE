import { useState } from 'react';
import { ChevronDown, Pencil, Trash2 } from 'lucide-react';
import type { GenerationFunctionType, GenerationStep, ModelMatch } from '@/types/workflow';
import { isDraftStep } from '@/features/workflow/lib/jobAdapter';
import { FUNCTION_TYPE_META, ICON_BUTTON_CLASS, INPUT_CLASS, SMALL_BUTTON_CLASS, STEP_STATUS } from './stepMeta';

const FUNCTION_TYPES = Object.keys(FUNCTION_TYPE_META) as GenerationFunctionType[];

const MATCH_HINT: Record<ModelMatch, string> = {
  catalog: '',
  pending: 'Nhập việc bạn cần làm, hệ thống sẽ chọn model phù hợp.',
  specialist: 'Đã có model riêng cho việc này.',
  general: 'Chưa có model riêng cho việc này nên hệ thống dùng model đa năng.',
};

export interface StepRowProps {
  step: GenerationStep;
  expanded: boolean;
  onToggle: () => void;
  /** Editing is closed (locked cut, or a generation running). */
  disabled: boolean;
  onChangeDraft: (data: Partial<GenerationStep>) => void;
  onChangeFunction: (type: GenerationFunctionType) => void;
  onDescribeCustom: (customFunction: string) => void;
  onRemoveDraft: () => void;
  onRegenerate: (prompt: string) => Promise<boolean>;
  onDiscard: () => Promise<boolean>;
}

/**
 * One item of a scene as a two-line row (type, model, status, cost / prompt). It opens
 * in place to edit: a draft's function and prompt, or a generated item's prompt to
 * regenerate it. Removing asks first.
 */
export function StepRow({
  step,
  expanded,
  onToggle,
  disabled,
  onChangeDraft,
  onChangeFunction,
  onDescribeCustom,
  onRemoveDraft,
  onRegenerate,
  onDiscard,
}: StepRowProps) {
  const draft = isDraftStep(step);
  const [revised, setRevised] = useState(step.prompt);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const { icon: TypeIcon, label, placeholder } = FUNCTION_TYPE_META[step.function_type];
  const running = !draft && (step.status === 'processing' || step.status === 'pending');
  const actionsOff = disabled || busy || running;
  const name = step.function_type === 'CUSTOM' && step.custom_function ? step.custom_function : label;
  const match = step.model_match ?? 'pending';

  const act = async (action: () => Promise<boolean>) => {
    setBusy(true);
    const ok = await action();
    setBusy(false);
    if (ok) setConfirming(false);
    return ok;
  };

  const remove = () => (draft ? onRemoveDraft() : act(onDiscard));

  return (
    <li className={`rounded-lg border transition ${expanded ? 'border-purple-300 dark:border-purple-500/40 bg-purple-50/30 dark:bg-purple-500/[0.04]' : 'border-slate-200 dark:border-white/10'}`}>
      <div className="flex items-center gap-1 pr-1">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex-1 min-w-0 flex items-start gap-2 px-3 py-2 text-left cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
        >
          <TypeIcon className="w-3.5 h-3.5 mt-0.5 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-xs">
              <span className="font-medium text-slate-800 dark:text-slate-100 truncate">{name}</span>
              {draft ? (
                <span className="px-1.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 text-[11px] font-medium shrink-0">Nháp</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${STEP_STATUS[step.status].dot}`} aria-hidden="true" />
                  {STEP_STATUS[step.status].label}
                </span>
              )}
              <span className="ml-auto text-slate-400 dark:text-slate-500 tabular-nums shrink-0">{draft ? '~' : ''}{step.token_cost} token</span>
            </span>
            {!expanded && (
              <span className={`block text-xs truncate mt-0.5 ${step.prompt ? 'text-slate-500 dark:text-slate-400' : 'italic text-slate-400 dark:text-slate-500'}`}>
                {step.prompt || 'Chưa có mô tả'}
              </span>
            )}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {!draft && !expanded && (
          <button type="button" onClick={onToggle} disabled={actionsOff} aria-label="Sửa mô tả mục này" className={`${ICON_BUTTON_CLASS} hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 focus-visible:ring-purple-500/40`}>
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={() => (draft ? onRemoveDraft() : setConfirming(true))}
          disabled={(draft ? disabled : actionsOff) || confirming}
          aria-label="Xóa mục này"
          className={`${ICON_BUTTON_CLASS} hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 focus-visible:ring-rose-500/40`}
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {confirming && (
        <div role="alert" className="mx-3 mb-2 px-2.5 py-2 rounded-md bg-rose-50 dark:bg-rose-500/10 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-rose-700 dark:text-rose-300">Xóa mục này? Token đã dùng không được hoàn lại.</p>
          <span className="flex gap-1.5">
            <button type="button" onClick={() => setConfirming(false)} disabled={busy} className={`${SMALL_BUTTON_CLASS} text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/5 focus-visible:ring-slate-400/40`}>
              Hủy
            </button>
            <button type="button" onClick={remove} disabled={busy} className={`${SMALL_BUTTON_CLASS} bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500/40`}>
              {busy ? 'Đang xóa…' : 'Xóa'}
            </button>
          </span>
        </div>
      )}

      {expanded && draft && (
        <div className="px-3 pb-3 space-y-2">
          <div role="group" aria-label="Loại nội dung" className="flex flex-wrap gap-1">
            {FUNCTION_TYPES.map((type) => {
              const { icon: Icon, label: typeLabel } = FUNCTION_TYPE_META[type];
              const selected = step.function_type === type;
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChangeFunction(type)}
                  disabled={disabled}
                  className={`px-2 py-0.5 rounded-md text-xs font-medium inline-flex items-center gap-1 border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 ${
                    selected ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-purple-400'
                  }`}
                >
                  <Icon className="w-3 h-3" aria-hidden="true" />
                  {typeLabel}
                </button>
              );
            })}
          </div>
          {step.function_type === 'CUSTOM' && (
            <div className="space-y-1">
              <input
                type="text"
                value={step.custom_function ?? ''}
                onChange={(e) => onDescribeCustom(e.target.value)}
                aria-label="Việc bạn cần làm"
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
            onChange={(e) => onChangeDraft({ prompt: e.target.value })}
            rows={3}
            aria-label="Mô tả nội dung cần tạo"
            placeholder={placeholder}
            disabled={disabled}
            className={`${INPUT_CLASS} resize-y leading-relaxed`}
          />
          <div className="flex justify-end">
            <button type="button" onClick={onToggle} className={`${SMALL_BUTTON_CLASS} text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/10 focus-visible:ring-purple-500/40`}>
              Xong
            </button>
          </div>
        </div>
      )}

      {expanded && !draft && (
        <div className="px-3 pb-3 space-y-2">
          <textarea
            value={revised}
            onChange={(e) => setRevised(e.target.value)}
            rows={3}
            aria-label="Mô tả mới cho mục này"
            disabled={actionsOff}
            className={`${INPUT_CLASS} resize-y leading-relaxed`}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">Tạo lại tính thêm ~{step.token_cost} token, bản cũ vẫn được lưu.</p>
            <span className="flex gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => {
                  setRevised(step.prompt);
                  onToggle();
                }}
                disabled={busy}
                className={`${SMALL_BUTTON_CLASS} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 focus-visible:ring-slate-400/40`}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (await act(() => onRegenerate(revised))) onToggle();
                }}
                disabled={actionsOff || !revised.trim()}
                className={`${SMALL_BUTTON_CLASS} bg-purple-600 hover:bg-purple-700 text-white focus-visible:ring-purple-500/40`}
              >
                {busy ? 'Đang tạo…' : 'Lưu và tạo lại'}
              </button>
            </span>
          </div>
        </div>
      )}
    </li>
  );
}
