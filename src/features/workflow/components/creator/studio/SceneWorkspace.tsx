import { useEffect, useRef, useState } from 'react';
import { Lightbulb, ListChecks, Plus } from 'lucide-react';
import type { GenerationFunctionType, GenerationJob, GenerationStep } from '@/types/workflow';
import { workflowService } from '@/services/workflowService';
import { isDraftStep } from '@/features/workflow/lib/jobAdapter';
import { useGenerationMeter } from './useGenerationMeter';
import { GenerationMeter } from './GenerationMeter';
import { useKeyedRequest } from './useKeyedRequest';
import { SceneHeader } from './SceneHeader';
import { SceneAdvice } from './SceneAdvice';
import { StepRow } from './StepRow';

type Tab = 'items' | 'advice';
// Expands the draft that is about to be added, before its id is known.
const NEWEST = '__newest__';

export interface SceneWorkspaceProps {
  job: GenerationJob;
  description: string;
  locked: boolean;
  /** This scene is generating right now. */
  isGenerating: boolean;
  /** Some scene is generating, so edits wait. */
  busy: boolean;
  remainingQuota: number;
  onAddStep: (functionType?: GenerationFunctionType, prompt?: string) => void;
  onUpdateStep: (stepId: string, data: Partial<GenerationStep>) => void;
  /** Changes a draft's function; the backend picks its model (BR-40). */
  onRouteStep: (stepId: string, change: Pick<GenerationStep, 'function_type' | 'custom_function'>) => void;
  onRemoveStep: (stepId: string) => void;
  onRegenerateStep: (stepId: string, prompt: string) => Promise<boolean>;
  onDiscardStep: (stepId: string) => Promise<boolean>;
  onGenerate: () => void;
  onSaveScene: (data: { title: string; description: string }) => Promise<boolean>;
  onResetScene: () => Promise<boolean>;
}

/**
 * Everything about the selected scene in one compact, sticky card: the scene and its
 * neighbours, its items as short rows that open to edit, the advisor's suggestions,
 * and the generate button always in reach at the bottom.
 */
export function SceneWorkspace(props: SceneWorkspaceProps) {
  const { job, description, locked, isGenerating, busy, remainingQuota, onAddStep, onUpdateStep, onRouteStep } = props;
  const steps = job.generation_steps;
  const saved = steps.filter((s) => !isDraftStep(s));
  const drafts = steps.filter(isDraftStep);

  const [tab, setTab] = useState<Tab>(steps.length === 0 && !locked ? 'advice' : 'items');
  const [expanded, setExpanded] = useState<string | null>(null);
  const expandedId = expanded === NEWEST ? (drafts.at(-1)?.id ?? null) : expanded;

  // The advisor checks again whenever the scene's generated content or description changes.
  const contentKey = `${job.scene_id}|${saved.map((s) => `${s.id}:${s.status}`).join(',')}|${description}`;
  const advice = useKeyedRequest(locked ? null : contentKey, () => workflowService.getSceneAdvice(job.scene_id));
  const gapCount = advice.state.status === 'ready' ? advice.state.data.gaps.length : 0;
  const links = advice.state.status === 'ready' ? advice.state.data : { previousScene: null, nextScene: null };

  // Route a custom function once the Creator pauses typing, not on every key.
  const routeTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  useEffect(() => {
    const timers = routeTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);
  const describeCustom = (stepId: string, customFunction: string) => {
    onUpdateStep(stepId, { custom_function: customFunction, selected_model: '', token_cost: 0, model_match: 'pending' });
    clearTimeout(routeTimers.current[stepId]);
    routeTimers.current[stepId] = setTimeout(() => onRouteStep(stepId, { function_type: 'CUSTOM', custom_function: customFunction }), 400);
  };

  const addStep = (functionType?: GenerationFunctionType, prompt?: string) => {
    onAddStep(functionType, prompt);
    setTab('items');
    setExpanded(NEWEST);
  };

  // Generating runs the drafts; without drafts it regenerates every saved step.
  const toRun = drafts.length > 0 ? drafts : steps;
  const targetCost = toRun.reduce((sum, s) => sum + (s.token_cost || 0), 0);
  const meter = useGenerationMeter(isGenerating, targetCost);
  const shortOfTokens = targetCost > remainingQuota;
  const editingOff = locked || busy;

  const tabClass = (active: boolean) =>
    `flex-1 px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center justify-center gap-1.5 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 ${
      active ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
    }`;

  return (
    <section
      aria-label="Nội dung cảnh"
      className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200 dark:border-white/10 flex flex-col lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]"
    >
      <div className="p-4 space-y-3 border-b border-slate-100 dark:border-white/5">
        <SceneHeader
          key={`${job.id}-${job.title}-${description}`}
          sceneNumber={job.scene_number}
          title={job.title}
          description={description}
          previousScene={links.previousScene}
          nextScene={links.nextScene}
          generatedCount={saved.length}
          disabled={editingOff}
          onSave={props.onSaveScene}
          onReset={props.onResetScene}
        />
        <div role="tablist" aria-label="Nội dung cảnh" className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-white/5">
          <button type="button" role="tab" aria-selected={tab === 'items'} onClick={() => setTab('items')} className={tabClass(tab === 'items')}>
            <ListChecks className="w-3.5 h-3.5" aria-hidden="true" /> Mục ({steps.length})
          </button>
          <button type="button" role="tab" aria-selected={tab === 'advice'} onClick={() => setTab('advice')} disabled={locked} className={`${tabClass(tab === 'advice')} disabled:opacity-40 disabled:cursor-not-allowed`}>
            <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" /> Gợi ý
            {gapCount > 0 && (
              <span className="min-w-4 px-1 rounded-full bg-amber-500 text-white text-[10px] leading-4 tabular-nums" aria-label={`${gapCount} điểm cần xử lý`}>
                {gapCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div role="tabpanel" className="flex-1 min-h-0 overflow-y-auto p-4">
        {tab === 'advice' ? (
          <SceneAdvice
            state={advice.state}
            onRefresh={advice.refresh}
            draftPrompts={drafts.map((s) => s.prompt)}
            disabled={editingOff}
            onAdd={addStep}
          />
        ) : (
          <div className="space-y-2">
            {steps.length === 0 && (
              <p className="text-center py-5 rounded-lg border border-dashed border-slate-200 dark:border-white/10 text-xs text-slate-400 dark:text-slate-500">
                Chưa có mục nào. Thêm mục hoặc xem tab Gợi ý.
              </p>
            )}
            <ul className="space-y-1.5">
              {steps.map((step) => (
                <StepRow
                  key={step.id}
                  step={step}
                  expanded={expandedId === step.id}
                  onToggle={() => setExpanded(expandedId === step.id ? null : step.id)}
                  disabled={editingOff}
                  onChangeDraft={(data) => onUpdateStep(step.id, data)}
                  onChangeFunction={(type) => onRouteStep(step.id, { function_type: type, custom_function: step.custom_function })}
                  onDescribeCustom={(value) => describeCustom(step.id, value)}
                  onRemoveDraft={() => props.onRemoveStep(step.id)}
                  onRegenerate={(prompt) => props.onRegenerateStep(step.id, prompt)}
                  onDiscard={() => props.onDiscardStep(step.id)}
                />
              ))}
            </ul>
            <button
              type="button"
              onClick={() => addStep()}
              disabled={editingOff}
              className="w-full py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm mục
            </button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2.5 border-t border-slate-100 dark:border-white/5">
        <GenerationMeter meter={meter} isGenerating={isGenerating} targetCost={targetCost} />
        {shortOfTokens && !locked && (
          <p role="alert" className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
            Tập này chỉ còn {remainingQuota.toLocaleString()} token, không đủ cho {targetCost} token cần tạo. Vào tab Token của phim để xin thêm.
          </p>
        )}
        <div className="flex items-center gap-3">
          <p className="flex-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {toRun.length} mục sẽ tạo · ~{targetCost} token
          </p>
          <button
            type="button"
            onClick={props.onGenerate}
            disabled={isGenerating || toRun.length === 0 || locked || shortOfTokens}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#151822]"
          >
            {isGenerating ? 'Đang tạo…' : drafts.length > 0 || steps.length === 0 ? 'Tạo clip' : 'Tạo lại'}
          </button>
        </div>
      </div>
    </section>
  );
}
