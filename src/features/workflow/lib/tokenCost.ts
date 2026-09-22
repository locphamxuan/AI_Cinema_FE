import type { GenerationStep } from '@/types/workflow';
import { resolveModel } from './modelRegistry';

const PROMPT_LENGTH_CAP = 400;
const FALLBACK_MODEL = { baseUnits: 10, tokensPerUnit: 4 };

/**
 * Output length and actual token cost of a completed step; longer prompts yield
 * longer output and cost scales with output length, not a flat price per call (BR-41).
 */
export function settleGenerationStep(step: Pick<GenerationStep, 'function_type' | 'custom_function' | 'prompt'>): { output_duration: number; token_cost: number } {
  const { baseUnits, tokensPerUnit } = resolveModel(step).model ?? FALLBACK_MODEL;
  const promptFactor = 0.75 + (Math.min(step.prompt.length, PROMPT_LENGTH_CAP) / PROMPT_LENGTH_CAP) * 0.5;
  const output_duration = Math.round(baseUnits * promptFactor);
  return { output_duration, token_cost: Math.round(output_duration * tokensPerUnit) };
}
