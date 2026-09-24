import type { GenerationStep } from '@/types/workflow';
import type { ApiRoutingRow } from '@/types/workflow-api';
import { JOB_TYPE_OF } from './jobAdapter';

/**
 * Model and planning estimate of a step, from the backend routing table (BR-40).
 * A custom function has no route until the backend resolves its description.
 */
export function routeDefaults(
  routing: ApiRoutingRow[],
  step: Pick<GenerationStep, 'function_type'>
): Pick<GenerationStep, 'selected_model' | 'token_cost' | 'model_match'> {
  if (step.function_type === 'CUSTOM') return { selected_model: '', token_cost: 0, model_match: 'pending' };
  const row = routing.find((r) => r.jobType === JOB_TYPE_OF[step.function_type]);
  return { selected_model: row?.model ?? '', token_cost: row?.estimatedTokenCost ?? 0, model_match: 'catalog' };
}
