import type { GenerationFunctionType, GenerationStep } from '@/types/workflow';

/**
 * AI model catalog. Creator never picks a model (BR-40): built-in function
 * types map straight to their model, and a custom function the catalog does
 * not cover is matched against specialist models by keyword, falling back to
 * a general-purpose model.
 */
export interface ModelSpec {
  name: string;
  /** Typical output length (seconds of audio/video, text/frame units) used for estimates and simulation. */
  baseUnits: number;
  tokensPerUnit: number;
}

export type ModelMatch = 'catalog' | 'specialist' | 'general' | 'pending';

type BuiltInFunction = Exclude<GenerationFunctionType, 'CUSTOM'>;

const CATALOG: Record<BuiltInFunction, ModelSpec> = {
  VIDEO: { name: 'CinemaGen v3.2 (4K Photoreal)', baseUnits: 20, tokensPerUnit: 3 },
  IMAGE: { name: 'CinemaGen Image Pro', baseUnits: 5, tokensPerUnit: 6 },
  SCRIPT_VOICE: { name: 'ElevenLabs Pro Voice HD', baseUnits: 14, tokensPerUnit: 2.5 },
  AUDIO_MUSIC: { name: 'Dolby Spatial AI SFX', baseUnits: 25, tokensPerUnit: 1 },
};

const SPECIALISTS: Array<ModelSpec & { keywords: string[] }> = [
  { name: 'LipSync Studio', baseUnits: 15, tokensPerUnit: 3, keywords: ['lipsync', 'lip sync', 'khau hinh', 'dong bo moi'] },
  { name: 'SubtitleAI Translate', baseUnits: 12, tokensPerUnit: 1.5, keywords: ['phu de', 'subtitle', 'caption', 'dich', 'translate'] },
  { name: 'UpscaleX 4K', baseUnits: 20, tokensPerUnit: 2, keywords: ['upscale', 'lam net', 'nang cap', 'do phan giai'] },
  { name: 'ColorGrade AI', baseUnits: 20, tokensPerUnit: 1.5, keywords: ['mau', 'color', 'grading', 'tone'] },
  { name: 'VFX Composer', baseUnits: 12, tokensPerUnit: 5, keywords: ['vfx', 'hieu ung', 'dac biet', 'chay no', 'particle'] },
  { name: 'Character Motion AI', baseUnits: 15, tokensPerUnit: 4, keywords: ['chuyen dong', 'motion', 'hoat hinh', 'animation', 'nhan vat'] },
  { name: 'Poster & Thumbnail Studio', baseUnits: 4, tokensPerUnit: 6, keywords: ['poster', 'thumbnail', 'anh bia', 'bia phim'] },
];

const GENERAL_MODEL: ModelSpec = { name: 'CinemaGen Universal (đa năng)', baseUnits: 10, tokensPerUnit: 4 };

/** Lowercase and strip Vietnamese diacritics so "Đồng bộ khẩu hình" matches "dong bo khau hinh". */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase();
}

export interface ResolvedModel {
  model: ModelSpec | null;
  match: ModelMatch;
}

/** Picks the model for a step; `pending` means a custom function has not been described yet. */
export function resolveModel(step: Pick<GenerationStep, 'function_type' | 'custom_function'>): ResolvedModel {
  if (step.function_type !== 'CUSTOM') return { model: CATALOG[step.function_type], match: 'catalog' };

  const label = normalize(step.custom_function ?? '').trim();
  if (!label) return { model: null, match: 'pending' };

  const specialist = SPECIALISTS.find((s) => s.keywords.some((k) => label.includes(k)));
  return specialist ? { model: specialist, match: 'specialist' } : { model: GENERAL_MODEL, match: 'general' };
}

/** Auto-selected model name and planning estimate for a step — applied whenever its function changes. */
export function stepDefaults(step: Pick<GenerationStep, 'function_type' | 'custom_function'>): Pick<GenerationStep, 'selected_model' | 'token_cost'> {
  const { model } = resolveModel(step);
  return {
    selected_model: model?.name ?? '',
    token_cost: model ? Math.round(model.baseUnits * model.tokensPerUnit) : 0,
  };
}
